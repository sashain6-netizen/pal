import { verifyPassword } from "./_crypto.js";
import { createToken } from "./_jwt.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // 1. Parse the incoming JSON credentials
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response("Username and password are required", { status: 400 });
    }

    // 2. Fetch the user from Cloudflare KV
    const userData = await env.USERS_KV.get(username);
    if (!userData) {
      // Security tip: Use generic error messages to prevent "username enumeration"
      return new Response("Invalid username or password", { status: 401 });
    }

    const user = JSON.parse(userData);

    // 3. Verify the password hash with the stored salt
    const isValid = await verifyPassword(password, user.hash, user.salt);
    if (!isValid) {
      return new Response("Invalid username or password", { status: 401 });
    }

    // 4. Create a JWT Session Token
    // Ensure you have defined JWT_SECRET in your Cloudflare Pages Environment Variables
    const token = await createToken(username, env.JWT_SECRET);

    // 5. Return success and set the Secure HttpOnly Cookie
    return new Response(JSON.stringify({ success: true, username: user.username }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `pal_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
      }
    });

  } catch (err) {
    return new Response("Server Error", { status: 500 });
  }
}