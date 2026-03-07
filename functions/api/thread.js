export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const threadId = url.searchParams.get("id");

    if (!threadId) return new Response("ID Required", { status: 400 });

    try {
        // 1. Get Thread Title
        const thread = await env.DB.prepare("SELECT title FROM threads WHERE id = ?")
            .bind(threadId).first();

        // 2. Get All Posts in that thread
        const { results: posts } = await env.DB.prepare(
            "SELECT * FROM thread_posts WHERE thread_id = ? ORDER BY created_at ASC"
        ).bind(threadId).all();

        const decoratedPosts = await Promise.all(posts.map(async (post) => {
        const userData = await env.USERS_KV.get(`user:${post.username}`);
        const user = userData ? JSON.parse(userData) : {};
        
        return {
            ...post,
            // Pulling from KV, defaulting if not set
            displayName: user.displayName || post.username,
            avatarUrl: user.avatarUrl || "/default-avatar.png",
            themeColor: user.themeColor || "#2563eb",
            rank: user.rank || "Member",    // This fixes the "Owner" issue
            prefix: user.currentPrefix || user.prefix || ""       
         };
    }));

        return new Response(JSON.stringify({ 
            title: thread.title, 
            posts: decoratedPosts 
        }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}