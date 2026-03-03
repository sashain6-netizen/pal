import { hashPassword } from "./_crypto.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { username, password, email } = await request.json();

    // 1. Email Format Validation (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response("Please provide a valid email address", { status: 400 });
    }

    // 2. Standard Validations
    if (!username || username.length < 3) {
      return new Response("Username must be at least 3 characters", { status: 400 });
    }
    if (!password || password.length < 8) {
      return new Response("Password must be at least 8 characters", { status: 400 });
    }

    // 3. Check if user already exists
    const existing = await env.USERS_KV.get(username);
    if (existing) {
      return new Response("Username already taken", { status: 409 });
    }

    // 4. Hash and Store
    const { hash, salt } = await hashPassword(password);
    const userData = {
      username,
      email, // Store the email in the profile
      hash,
      salt,
      joined: new Date().toISOString()
    };

    await env.USERS_KV.put(username, JSON.stringify(userData));

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response("Registration failed", { status: 500 });
  }
}