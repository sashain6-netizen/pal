export async function onRequestGet(context) {
  const { request, env } = context;
  const cookieHeader = request.headers.get("Cookie") || "";
  
  if (!cookieHeader.includes("pal_session=")) {
    return new Response(JSON.stringify({ loggedIn: false }), { 
      headers: { "Content-Type": "application/json" } 
    });
  }

  try {
    const token = cookieHeader.split("pal_session=")[1].split(";")[0];
    const payload = JSON.parse(atob(token.split(".")[1]));
    const username = payload.username?.toLowerCase();

    const userKey = `user:${username}`;
    const rawData = await env.USERS_KV.get(userKey);
    const user = rawData ? JSON.parse(rawData) : null;

    if (!user) {
      return new Response(JSON.stringify({ loggedIn: false }), { 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // --- STEP 3: THE FIX IS HERE ---
    return new Response(JSON.stringify({
      loggedIn: true,
      username: user.username,       // Raw ID for logical checks
      displayName: user.displayName, // Pretty name for display
      rank: user.rank || "Member",   // CRITICAL: This is now in the success path!
      themeColor: user.themeColor || "#2563eb"
    }), { 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (err) {
    // If something breaks, we return loggedIn: false so the UI doesn't crash
    return new Response(JSON.stringify({ loggedIn: false, error: err.message }), { 
      headers: { "Content-Type": "application/json" }
    });
  }
}