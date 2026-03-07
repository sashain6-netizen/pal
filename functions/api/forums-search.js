export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.toLowerCase();

    if (!query || query.length < 2) {
        return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
    }

    try {
        // SQL using 'creator_username' to match your verified schema
        const { results } = await env.DB.prepare(`
            SELECT DISTINCT t.id, t.title, t.creator_username, t.created_at 
            FROM threads t
            LEFT JOIN thread_posts p ON t.id = p.thread_id
            WHERE t.title LIKE ? OR p.content LIKE ?
            ORDER BY t.created_at DESC
            LIMIT 15
        `).bind(`%${query}%`, `%${query}%`).all();

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}