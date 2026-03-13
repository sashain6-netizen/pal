export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    const limit = parseInt(url.searchParams.get("limit")) || 10;
    const offset = parseInt(url.searchParams.get("offset")) || 0;

    try {
        // 1. Fetch the most recent threads with pagination
        // We use LIMIT to restrict the count and OFFSET to skip already loaded ones
        const { results: threads } = await env.DB.prepare(`
            SELECT id, title, creator_username, created_at 
            FROM threads 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `)
        .bind(limit, offset)
        .all();

        // 2. Decorate threads with User KV data (optional, but good for avatars on list)
        const decoratedThreads = await Promise.all(threads.map(async (thread) => {
            const userData = await env.USERS_KV.get(`user:${thread.creator_username.toLowerCase().trim()}`);
            const user = userData ? JSON.parse(userData) : {};
            
            return {
                ...thread,
                author_display_name: user.displayName || thread.creator_username,
                author_avatar: user.avatarUrl || "/default-avatar.png"
            };
        }));

        // 3. Return the list and the next offset for the frontend to use
        return new Response(JSON.stringify({ 
            threads: decoratedThreads,
            nextOffset: offset + limit,
            hasMore: threads.length === limit // If we got fewer than the limit, there's no more data
        }), { 
            headers: { "Content-Type": "application/json" } 
        });

    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}