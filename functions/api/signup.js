import { hashPassword } from "./_crypto.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { username, email, password } = await request.json();

    // 1. Validations (Regex & Length)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response("Please provide a valid email address", { status: 400 });
    }
    if (!username || username.length < 3) {
      return new Response("Username must be at least 3 characters", { status: 400 });
    }
    if (!password || password.length < 8) {
      return new Response("Password must be at least 8 characters", { status: 400 });
    }

    // 2. CHECK USERNAME (Primary Key)
    const existingUser = await env.USERS_KV.get(username);
    if (existingUser) {
      return new Response("Username already taken", { status: 409 });
    }

    // 3. CHECK EMAIL (Secondary Index)
    // We store emails with a prefix like 'email:user@example.com' to keep them separate
    const emailKey = `email:${email.toLowerCase()}`;
    const existingEmail = await env.USERS_KV.get(emailKey);
    if (existingEmail) {
      return new Response("An account with this email already exists", { status: 409 });
    }

    // 4. Hash Password
    const { hash, salt } = await hashPassword(password);
    
    const userData = {
      username,
      email: email.toLowerCase(),
      hash,
      salt,
      joined: new Date().toISOString()
    };

    // 5. ATOMIC-LIKE STORAGE
    // Store the actual user profile
    await env.USERS_KV.put(username, JSON.stringify(userData));
    
    // Store the email marker so it's "reserved"
    await env.USERS_KV.put(emailKey, username);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response("Registration failed", { status: 500 });
  }
}