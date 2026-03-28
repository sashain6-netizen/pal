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

    const cleanIdentifier = identifier.trim().toLowerCase();
    let userKey = "";

    if (cleanIdentifier.includes('@')) {
      const emailKey = `email:${cleanIdentifier}`;
      const foundUsername = await env.USERS_KV.get(emailKey);

            if (!foundUsername) {
        return new Response("Invalid credentials", { status: 401 });
      }
      userKey = `user:${foundUsername}`;
    } else {
      userKey = `user:${cleanIdentifier}`;
    }

    const userData = await env.USERS_KV.get(userKey, { cacheTtl: 1800 });
    if (!userData) {
      return new Response("Invalid credentials", { status: 401 });
    }

    let user;
    try {
      user = JSON.parse(userData);
    } catch (e) {
      console.error("KV Data Corruption for user:", userKey);
      return new Response("Account error", { status: 500 });
    }

    const isValid = await verifyPassword(password, user.hash, user.salt);
    if (!isValid) {
      return new Response("Invalid credentials", { status: 401 });
    }

    if (user.isBanned === true) {
      if (user.banExpiration) {
        const expirationTime = new Date(user.banExpiration).getTime();
        if (expirationTime > Date.now()) {
          return new Response(JSON.stringify({
            error: "Account banned",
            reason: user.banReason || "No reason provided",
            expires: user.banExpiration
          }), {
            status: 403,
            headers: { "Content-Type": "application/json" }
          });
        } else {
          user.isBanned = false;
          delete user.banReason;
          delete user.banExpiration;
          await env.USERS_KV.put(userKey, JSON.stringify(user));

          const username = user.username.toLowerCase();
          const userBans = await env.USERS_KV.get(`bans:${username}`);
          if (userBans) {
            const bans = JSON.parse(userBans);
            for (const banId of bans) {
              await env.USERS_KV.delete(`ban:${banId}`);

              const bansList = await env.USERS_KV.get("bans_list");
              if (bansList) {
                const allBans = JSON.parse(bansList);
                const updatedBansList = allBans.filter(id => id !== banId);
                await env.USERS_KV.put("bans_list", JSON.stringify(updatedBansList));
              }
            }
            await env.USERS_KV.delete(`bans:${username}`);
          }
        }
      } else {
        return new Response(JSON.stringify({
          error: "Account permanently banned",
          reason: user.banReason || "No reason provided"
        }), {
          status: 403,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    const token = await createToken(user.username, env.JWT_SECRET);

    return new Response(JSON.stringify({
      success: true,
      username: user.displayName
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
