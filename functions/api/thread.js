export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const threadId = url.searchParams.get("id");

    if (!threadId) return new Response("ID Required", { status: 400 });

    try {
        // 1. FIXED: Changed 'author_username' to 'creator_username' to match your DB
        const thread = await env.DB.prepare("SELECT title, creator_username FROM threads WHERE id = ?")
            .bind(threadId).first();

        if (!thread) return new Response("Thread not found", { status: 404 });

        // 2. Get All Posts
        const { results: posts } = await env.DB.prepare(
            "SELECT * FROM thread_posts WHERE thread_id = ? ORDER BY created_at ASC"
        ).bind(threadId).all();

        const decoratedPosts = await Promise.all(posts.map(async (post) => {
            const userData = await env.USERS_KV.get(`user:${post.username.toLowerCase().trim()}`);
            const user = userData ? JSON.parse(userData) : {};
            
            return {
                ...post,
                displayName: user.displayName || post.username,
                avatarUrl: user.avatarUrl || "/default-avatar.png",
                themeColor: user.themeColor || "#2563eb",
                rank: user.rank || "Member",
                prefix: user.currentPrefix || user.prefix || "" 
             };
        }));

        // 3. MAP 'creator_username' to 'author_username' for the frontend
        return new Response(JSON.stringify({ 
            title: thread.title, 
            author_username: thread.creator_username, // The frontend expects 'author_username'
            posts: decoratedPosts 
        }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}