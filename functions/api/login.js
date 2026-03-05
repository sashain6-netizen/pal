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
    const userData = await env.USERS_KV.get(userKey);
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

    // 6. JWT GENERATION
    // Note: 'user.username' is the lowercase version from our signup script
    const token = await createToken(user.username, env.JWT_SECRET);

    // 7. RESPONSE
    return new Response(JSON.stringify({ 
      success: true, 
      username: user.displayName // Return the "Pretty" name (e.g., "Pal") to the UI
    }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `pal_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
      }
    });

  } catch (err) {
    console.error(err);
    return new Response("An unexpected error occurred", { status: 500 });
  }
}