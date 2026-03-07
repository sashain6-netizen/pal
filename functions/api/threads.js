export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const threadId = url.searchParams.get("id");

    try {
        // 1. Fetch posts for this thread
        const { results: posts } = await env.DB.prepare(
            "SELECT * FROM thread_posts WHERE thread_id = ? ORDER BY created_at ASC"
        ).bind(threadId).all();

        // 2. Fetch User Metadata from KV for each post
        // This ensures the Prefix and Theme are always current!
        const richPosts = await Promise.all(posts.map(async (post) => {
            const userData = await env.USERS_KV.get(`user:${post.username}`);
            const user = userData ? JSON.parse(userData) : {};
            
            return {
                ...post,
                displayName: user.displayName || post.username,
                prefix: user.currentPrefix || "",
                rank: user.rank || "Member",
                themeColor: user.themeColor || "#2563eb",
                avatarUrl: user.avatarUrl || "/default-avatar.png"
            };
        }));

        return new Response(JSON.stringify(richPosts), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}