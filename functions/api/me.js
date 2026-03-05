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
    
    // Normalize the username from the token
    const username = payload.username?.toLowerCase();

    // 2. Fetch using the NEW KEY FORMAT: user:name
    const userKey = `user:${username}`;
    const rawData = await env.USERS_KV.get(userKey);
    const user = rawData ? JSON.parse(rawData) : null;

    if (!user) {
      // If we can't find the userKey, we return loggedIn: false
      return new Response(JSON.stringify({ loggedIn: false }), { 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // 3. Return data to frontend
    return new Response(JSON.stringify({
      loggedIn: true,
      username: user.displayName || user.username, // Send the "Pretty" name to the UI
      themeColor: user.themeColor || "#2563eb"
    }), { 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (err) {
    return new Response(JSON.stringify({ loggedIn: false, error: err.message }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" }
    });
  }
}