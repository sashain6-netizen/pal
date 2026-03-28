import { hashPassword } from "./_crypto.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
        return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400 });
    }

    const displayName = username.trim();
    const canonicalUsername = displayName.toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const userRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!userRegex.test(displayName)) {
      return new Response(JSON.stringify({
        error: "Username must be 3-20 characters and contain only letters, numbers, or underscores"
      }), { status: 400 });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (cleanEmail.length > 255 || !emailRegex.test(cleanEmail)) {
      return new Response(JSON.stringify({ error: "Please provide a valid email address" }), { status: 400 });
    }

    if (password.trim().length < 8 || password.length > 100) {
      return new Response(JSON.stringify({ error: "Password must be between 8 and 100 characters" }), { status: 400 });
    }

    const usernameKey = `user:${canonicalUsername}`;
    const existingUser = await env.USERS_KV.get(usernameKey);
    if (existingUser) {
      return new Response(JSON.stringify({ error: "Username already taken" }), { status: 409 });
    }

    const emailKey = `email:${cleanEmail}`;
    const existingEmail = await env.USERS_KV.get(emailKey);
    if (existingEmail) {
      return new Response(JSON.stringify({ error: "Email already in use" }), { status: 409 });
    }

    const { hash, salt } = await hashPassword(password);

    const userData = {
      username: canonicalUsername,
      displayName: displayName,
      email: cleanEmail,
      hash,
      salt,
      joined: new Date().toISOString(),
      bio: "",
      themeColor: "#2563eb",
      avatarUrl: "",
      xp: 0,
      rank: "Member",
      currency: 0,
      followers: 0,
      following: [],
      notifications: [{
          id: Date.now(),
          text: `Welcome to PAL, ${displayName}! We're glad to have you here.`,
          date: new Date().toISOString(),
          read: false
        }],
      ownedPrefixes: [],
      currentPrefix: ""
    };

    const indexRaw = await env.USERS_KV.get("all_users_index") || "[]";
    let index = JSON.parse(indexRaw);
    if (!index.includes(canonicalUsername)) {
        index.push(canonicalUsername);
        await env.USERS_KV.put("all_users_index", JSON.stringify(index));
    }

    await env.USERS_KV.put(usernameKey, JSON.stringify(userData));
    await env.USERS_KV.put(emailKey, canonicalUsername);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Registration Error:", err);
    return new Response(JSON.stringify({ error: "Server error during registration" }), { status: 500 });
  }
}
