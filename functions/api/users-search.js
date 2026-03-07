import { verifyAndDecodeToken } from './_jwt.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.toLowerCase().trim();

    if (!query || query.length < 2) return new Response("[]");

    try {
        // 1. Get current user from JWT to exclude them
        const cookieHeader = request.headers.get("Cookie") || "";
        const token = cookieHeader.split('pal_session=')[1]?.split(';')[0];
        let currentUser = "";
        if (token) {
            const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
            currentUser = payload.username.toLowerCase();
        }

        // 2. List keys from KV starting with the query
        // This assumes your keys are named like "user_index:username"
        const userList = await env.USERS_KV.list({ 
            prefix: `user_index:${query}`, 
            limit: 5 
        });

        // 3. Clean the names (remove the 'user_index:' prefix)
        const results = userList.keys
            .map(k => k.name.split(':')[1])
            .filter(name => name !== currentUser)
            .map(name => ({ username: name }));

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}