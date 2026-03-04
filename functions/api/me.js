export async function onRequestGet(context) {
  const { request, env } = context;
  const cookie = request.headers.get("Cookie") || "";
  
  if (!cookie.includes("pal_session=")) {
    return new Response(JSON.stringify({ loggedIn: false }), { 
      headers: { "Content-Type": "application/json" } 
    });
  }

  try {
    // 1. Extract and Decode the token
    const token = cookie.split("pal_session=")[1].split(";")[0];
    const payload = JSON.parse(atob(token.split(".")[1]));
    const username = payload.username;

    // 2. Fetch the user from KV to get the themeColor
    const rawData = await env.USERS_KV.get(username);
    const user = rawData ? JSON.parse(rawData) : null;

    if (!user) {
      return new Response(JSON.stringify({ loggedIn: false }), { status: 200 });
    }

    // 3. Return the data the frontend is looking for
    return new Response(JSON.stringify({
      loggedIn: true,
      username: user.username,
      themeColor: user.themeColor || "#2563eb"
    }), { 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (err) {
    return new Response(JSON.stringify({ loggedIn: false, error: err.message }), { 
      status: 200, // Return 200 so the frontend handles it as "Logged Out"
      headers: { "Content-Type": "application/json" }
    });
  }
}