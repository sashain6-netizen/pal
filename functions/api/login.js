import { verifyPassword } from "./_crypto.js";
import { createToken } from "./_jwt.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // 1. Parse the incoming credentials (identifier can be username OR email)
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return new Response("Missing credentials", { status: 400 });
    }

    let username = identifier;

    // 2. Determine if the user provided an email
    const isEmail = identifier.includes('@');
    
    if (isEmail) {
      // Look up the username associated with this email marker
      const emailKey = `email:${identifier.toLowerCase()}`;
      const foundUsername = await env.USERS_KV.get(emailKey);
      
      if (!foundUsername) {
        // We use a generic error to prevent account snooping
        return new Response("Invalid username or password", { status: 401 });
      }
      username = foundUsername;
    }

    // 3. Fetch the actual User Profile using the username
    const userData = await env.USERS_KV.get(username);
    if (!userData) {
      return new Response("Invalid username or password", { status: 401 });
    }

    const user = JSON.parse(userData);

    // 4. Verify the password hash
    const isValid = await verifyPassword(password, user.hash, user.salt);
    if (!isValid) {
      return new Response("Invalid username or password", { status: 401 });
    }

    // 5. Create a JWT Session Token
    const token = await createToken(username, env.JWT_SECRET);

    // 6. Return success and set the Secure HttpOnly Cookie
    return new Response(JSON.stringify({ success: true, username: user.username }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `pal_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
      }
    });

  } catch (err) {
    console.error(err);
    return new Response("Server Error", { status: 500 });
  }
}