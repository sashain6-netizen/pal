export async function onRequestGet(context) {
  const { request, env } = context;
  const { searchParams } = new URL(request.url);
  
  // 1. Get the 'id' from the URL (?id=pal)
  const userId = searchParams.get('id')?.toLowerCase();

  if (!userId) {
    return new Response(JSON.stringify({ error: "No user specified" }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 2. Look up the user in KV
    // We use the same 'user:username' key format from your login script
    const userData = await env.USERS_KV.get(`user:${userId}`);

    if (!userData) {
      return new Response(JSON.stringify({ error: "User not found" }), { 
        status: 404, 
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. Parse and filter sensitive data
    const user = JSON.parse(userData);

    // IMPORTANT: Only send back data you want the public to see.
    // NEVER send user.hash or user.salt!
    const publicProfile = {
      username: user.username,
      displayName: user.displayName,
      bio: user.bio || "This user hasn't written a bio yet.",
      joined: user.joinedDate || "Unknown"
    };

    return new Response(JSON.stringify(publicProfile), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Allows your frontend to talk to it
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Database error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}