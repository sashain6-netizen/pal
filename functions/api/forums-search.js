export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.toLowerCase();

    if (!query || query.length < 2) {
        return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
    }

    try {
        const premiumData = await env.USERS_KV.get("pal_premium");
        const premiumUsers = premiumData ? JSON.parse(premiumData) : [];

        const searchTerm = `%${query}%`;

        const { results: rawResults } = await env.DB.prepare(`
            SELECT DISTINCT 
                t.id, 
                t.title, 
                t.creator_username, 
                t.created_at,
                (CASE WHEN t.title LIKE ? THEN 2 ELSE 1 END) as match_score
            FROM threads t
            LEFT JOIN thread_posts p ON t.id = p.thread_id
            WHERE t.title LIKE ? OR p.content LIKE ?
            ORDER BY match_score DESC, t.created_at DESC
            LIMIT 15
        `).bind(searchTerm, searchTerm, searchTerm).all();

        const results = rawResults.map(t => ({
            ...t,
            isPremium: premiumUsers.includes(t.creator_username.toLowerCase())
        }));

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}