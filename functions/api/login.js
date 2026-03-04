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

    // Normalizing the identifier
    const cleanIdentifier = identifier.trim();
    let targetUsername = cleanIdentifier;

    // 1. EMAIL LOOKUP LOGIC
    if (cleanIdentifier.includes('@')) {
      const emailKey = `email:${cleanIdentifier.toLowerCase()}`;
      const foundUsername = await env.USERS_KV.get(emailKey);
      
      if (!foundUsername) {
        // Generic error to prevent email harvesting
        return new Response("Invalid credentials", { status: 401 });
      }
      targetUsername = foundUsername;
    }

    // 2. FETCH PROFILE
    // We use the foundUsername (from email) OR the raw identifier (if they typed username)
    const userData = await env.USERS_KV.get(targetUsername);
    if (!userData) {
      return new Response("Invalid credentials", { status: 401 });
    }

    // 3. SAFE PARSE
    let user;
    try {
      user = JSON.parse(userData);
    } catch (e) {
      console.error("KV Data Corruption for user:", targetUsername);
      return new Response("Account error", { status: 500 });
    }

    // 4. VERIFY PASSWORD
    const isValid = await verifyPassword(password, user.hash, user.salt);
    if (!isValid) {
      return new Response("Invalid credentials", { status: 401 });
    }

    // 5. JWT GENERATION
    const token = await createToken(user.username, env.JWT_SECRET);

    // 6. RESPONSE
    return new Response(JSON.stringify({ 
      success: true, 
      username: user.username 
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