export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const username = url.searchParams.get("username")?.toLowerCase();

    if (!username) return new Response(JSON.stringify({ error: "Missing query" }), { status: 400 });

    const userRaw = await env.USERS_KV.get(`user:${username}`);
    
    if (userRaw) {
        const user = JSON.parse(userRaw);
        return new Response(JSON.stringify({ 
            exists: true, 
            username: user.username // Returns the properly cased name (e.g., "PalUser")
        }), { headers: { "Content-Type": "application/json" }});
    }

    return new Response(JSON.stringify({ exists: false }), {
        headers: { "Content-Type": "application/json" }
    });
}