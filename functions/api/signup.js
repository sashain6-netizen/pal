import { hashPassword } from "./_crypto.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { username, email, password } = await request.json();

    // 1. Clean up inputs
    const displayName = username?.trim(); // Keeps original casing for display
    const canonicalUsername = displayName?.toLowerCase(); // Used for uniqueness check
    const cleanEmail = email?.trim().toLowerCase();

    // 2. Validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return new Response(JSON.stringify({ error: "Please provide a valid email" }), { status: 400 });
    }
    if (!displayName || displayName.length < 3) {
      return new Response(JSON.stringify({ error: "Username must be at least 3 characters" }), { status: 400 });
    }
    if (!password || password.length < 8) {
      return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), { status: 400 });
    }

    // 3. CHECK USERNAME (Using the lowercase canonical version)
    // If "pal" is in KV, "Pal" will now correctly trigger this error.
    const usernameKey = `user:${canonicalUsername}`; 
    const existingUser = await env.USERS_KV.get(usernameKey);
    if (existingUser) {
      return new Response(JSON.stringify({ error: "Username already taken" }), { status: 409 });
    }

    // 4. CHECK EMAIL
    const emailKey = `email:${cleanEmail}`;
    const existingEmail = await env.USERS_KV.get(emailKey);
    if (existingEmail) {
      return new Response(JSON.stringify({ error: "Email already in use" }), { status: 409 });
    }

    // 5. Hash & Prepare Data
    const { hash, salt } = await hashPassword(password);

    const userData = {
      username: canonicalUsername, // Logical ID
      displayName: displayName,    // Pretty version (e.g., "Pal")
      email: cleanEmail,
      hash,
      salt,
      joined: new Date().toISOString(),
      bio: "",
      themeColor: "#2563eb",
      avatarUrl: "",
      xp: 0,
      rank: "Guest",
      currency: 0
    };

    // 6. STORAGE
    // We store the user object under the lowercase key to ensure uniqueness
    await env.USERS_KV.put(usernameKey, JSON.stringify(userData));
    await env.USERS_KV.put(emailKey, canonicalUsername);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error during registration" }), { status: 500 });
  }
}