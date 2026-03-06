export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const username = url.searchParams.get("username")?.toLowerCase();

    if (!username) return new Response(JSON.stringify({ error: "Missing query" }), { status: 400 });

    // Check KV for the user
    const userRaw = await env.USERS_KV.get(`user:${username}`);
    
    if (userRaw) {
        const user = JSON.parse(userRaw);
        // We return limited info for safety/privacy
        return new Response(JSON.stringify({ 
            exists: true, 
            username: user.username,
            prefix: user.currentPrefix // Show their cool prefix in search!
        }));
    }

    return new Response(JSON.stringify({ exists: false }));
}