export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    // Get parameters
    const threadId = url.searchParams.get("id");
    const limit = parseInt(url.searchParams.get("limit")) || 10;
    const offset = parseInt(url.searchParams.get("offset")) || 0;

    if (!threadId) return new Response("ID Required", { status: 400 });

    try {
        // 1. Get the main thread info (Title and Author)
        const thread = await env.DB.prepare("SELECT title, creator_username FROM threads WHERE id = ?")
            .bind(threadId)
            .first();

        if (!thread) return new Response("Thread not found", { status: 404 });

        // 2. Get the POSTS for this thread with pagination
        // We fetch limit + 1 to see if there is another page available
        const { results: posts } = await env.DB.prepare(`
            SELECT * FROM thread_posts 
            WHERE thread_id = ? 
            ORDER BY created_at ASC 
            LIMIT ? OFFSET ?
        `)
        .bind(threadId, limit + 1, offset)
        .all();

        const hasMore = posts.length > limit;
        const postsToSend = hasMore ? posts.slice(0, limit) : posts;

        // 3. Decorate posts with User KV data
        const decoratedPosts = await Promise.all(postsToSend.map(async (post) => {
            const userData = await env.USERS_KV.get(`user:${post.username.toLowerCase().trim()}`);
            const user = userData ? JSON.parse(userData) : {};
            
            return {
                ...post,
                displayName: user.displayName || post.username,
                themeColor: user.themeColor || "#2563eb",
                rank: user.rank || "Member",
                prefix: user.currentPrefix || user.prefix || "" 
            };
        }));

        // 4. Return what the frontend expects: { title, author_username, posts, hasMore }
        return new Response(JSON.stringify({ 
            title: thread.title, 
            author_username: thread.creator_username, 
            posts: decoratedPosts, 
            hasMore: hasMore
        }), { 
            headers: { "Content-Type": "application/json" } 
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message, posts: [] }), { status: 500 });
    }
}