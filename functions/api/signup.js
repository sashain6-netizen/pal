import { hashPassword } from "./_crypto.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { username, email, password } = body;

    // 1. Clean up & basic existence check
    if (!username || !email || !password) {
        return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400 });
    }

    const displayName = username.trim(); 
    const canonicalUsername = displayName.toLowerCase(); 
    const cleanEmail = email.trim().toLowerCase();

    // 2. STAGE 1 VALIDATION: Usernames
    // Rules: 3-20 chars, alphanumeric/underscore only, no spaces
    const userRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!userRegex.test(displayName)) {
      return new Response(JSON.stringify({ 
        error: "Username must be 3-20 characters and contain only letters, numbers, or underscores" 
      }), { status: 400 });
    }

    // 3. STAGE 2 VALIDATION: Emails
    // More robust regex for real-world email formats
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (cleanEmail.length > 255 || !emailRegex.test(cleanEmail)) {
      return new Response(JSON.stringify({ error: "Please provide a valid email address" }), { status: 400 });
    }

    // 4. STAGE 3 VALIDATION: Passwords
    // Rules: Min 8, Max 100 (to prevent long-string attacks), must not be only spaces
    if (password.trim().length < 8 || password.length > 100) {
      return new Response(JSON.stringify({ error: "Password must be between 8 and 100 characters" }), { status: 400 });
    }

    // 5. CHECK USERNAME (Lowercase key for uniqueness)
    const usernameKey = `user:${canonicalUsername}`; 
    const existingUser = await env.USERS_KV.get(usernameKey);
    if (existingUser) {
      return new Response(JSON.stringify({ error: "Username already taken" }), { status: 409 });
    }

    // 6. CHECK EMAIL
    const emailKey = `email:${cleanEmail}`;
    const existingEmail = await env.USERS_KV.get(emailKey);
    if (existingEmail) {
      return new Response(JSON.stringify({ error: "Email already in use" }), { status: 409 });
    }

    // 7. Hash & Prepare Data
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
        }]
    };

    // 8. STORAGE
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