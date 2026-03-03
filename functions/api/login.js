import { verifyPassword } from "./_crypto.js";
import { createToken } from "./_jwt.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  const { username, password } = await request.json();

  const data = await env.USERS_KV.get(username);
  if (!data) return new Response("Invalid credentials", { status: 401 });

  const user = JSON.parse(data);
  const isValid = await verifyPassword(password, user.hash, user.salt);

  if (!isValid) return new Response("Invalid credentials", { status: 401 });

  // Create the session token
  const token = await createToken(username, env.JWT_SECRET);

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `pal_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
    }
  });
}