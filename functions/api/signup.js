import { hashPassword } from "./_crypto.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  const { username, password } = await request.json();

  if (password.length < 8) {
    return new Response("Password must be 8+ characters", { status: 400 });
  }

  const existing = await env.USERS_KV.get(username);
  if (existing) return new Response("User already exists", { status: 409 });

  // SECURE: Salt and Hash
  const { hash, salt } = await hashPassword(password);

  const userData = {
    username,
    hash,
    salt,
    created: new Date().toISOString()
  };

  await env.USERS_KV.put(username, JSON.stringify(userData));
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  });
}