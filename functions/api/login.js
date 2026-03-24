import { verifyPassword } from "./_crypto.js";
import { createToken } from "./_jwt.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.USERS_KV || !env.JWT_SECRET) {
    return new Response("Server Configuration Error", { status: 500 });
  }

  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return new Response("Please enter both fields", { status: 400 });
    }

    // 1. NORMALIZE THE IDENTIFIER
    const cleanIdentifier = identifier.trim().toLowerCase(); // Force lowercase here
    let userKey = "";

    // 2. IDENTIFY THE KEY TYPE (Email vs Username)
    if (cleanIdentifier.includes('@')) {
      // It's an email: Look up the associated username first
      const emailKey = `email:${cleanIdentifier}`;
      const foundUsername = await env.USERS_KV.get(emailKey);
      
      if (!foundUsername) {
        return new Response("Invalid credentials", { status: 401 });
      }
      // If foundUsername is "pal", the key is "user:pal"
      userKey = `user:${foundUsername}`;
    } else {
      // It's a username: Prefix it for the KV lookup
      userKey = `user:${cleanIdentifier}`;
    }

    // 3. FETCH PROFILE
    const userData = await env.USERS_KV.get(userKey, { cacheTtl: 1800 });
    if (!userData) {
      return new Response("Invalid credentials", { status: 401 });
    }

    // 4. SAFE PARSE
    let user;
    try {
      user = JSON.parse(userData);
    } catch (e) {
      console.error("KV Data Corruption for user:", userKey);
      return new Response("Account error", { status: 500 });
    }

    // 5. VERIFY PASSWORD
    const isValid = await verifyPassword(password, user.hash, user.salt);
    if (!isValid) {
      return new Response("Invalid credentials", { status: 401 });
    }

    // 6. CHECK IF USER IS BANNED
    if (user.isBanned === true) {
      // Check if ban has expired
      if (user.banExpiration) {
        const expirationTime = new Date(user.banExpiration).getTime();
        if (expirationTime > Date.now()) {
          // Ban is still active
          return new Response(JSON.stringify({ 
            error: "Account banned",
            reason: user.banReason || "No reason provided",
            expires: user.banExpiration
          }), { 
            status: 403,
            headers: { "Content-Type": "application/json" }
          });
        } else {
          // Ban has expired, clean up all ban-related KV pairs
          user.isBanned = false;
          delete user.banReason;
          delete user.banExpiration;
          await env.USERS_KV.put(userKey, JSON.stringify(user));
          
          // Clean up ban records and KV pairs
          const username = user.username.toLowerCase();
          const userBans = await env.USERS_KV.get(`bans:${username}`);
          if (userBans) {
            const bans = JSON.parse(userBans);
            // Remove each ban KV pair
            for (const banId of bans) {
              await env.USERS_KV.delete(`ban:${banId}`);
              
              // Clean up global bans list
              const bansList = await env.USERS_KV.get("bans_list");
              if (bansList) {
                const allBans = JSON.parse(bansList);
                const updatedBansList = allBans.filter(id => id !== banId);
                await env.USERS_KV.put("bans_list", JSON.stringify(updatedBansList));
              }
            }
            // Remove the bans list KV entry
            await env.USERS_KV.delete(`bans:${username}`);
          }
        }
      } else {
        // Permanent ban
        return new Response(JSON.stringify({ 
          error: "Account permanently banned",
          reason: user.banReason || "No reason provided"
        }), { 
          status: 403,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // 7. JWT GENERATION
    // Note: 'user.username' is the lowercase version from our signup script
    const token = await createToken(user.username, env.JWT_SECRET);

    // 8. RESPONSE
    return new Response(JSON.stringify({ 
      success: true, 
      username: user.displayName // Return the "Pretty" name (e.g., "Pal") to the UI
    }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `pal_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`
      }
    });

  } catch (err) {
    console.error(err);
    return new Response("An unexpected error occurred", { status: 500 });
  }
}