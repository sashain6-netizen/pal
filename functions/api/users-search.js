export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.toLowerCase().trim();

    if (!query || query.length < 1) return new Response("[]");

    try {
        // 1. Fetch your index key
        const allUsers = await env.USERS_KV.get("all_users_index", { type: "json" });

        if (!allUsers || !Array.isArray(allUsers)) {
            return new Response("[]");
        }

        // 2. Filter the array for names starting with the query
        const matches = allUsers
            .filter(username => username.toLowerCase().startsWith(query))
            .slice(0, 5) // Limit to top 5 results
            .map(username => ({ username: username })); // Format for your frontend

        return new Response(JSON.stringify(matches), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}