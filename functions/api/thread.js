import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    const threadId = url.searchParams.get("id");
    const limit = parseInt(url.searchParams.get("limit")) || 50;
    const offset = parseInt(url.searchParams.get("offset")) || 0;

    if (!threadId) return new Response("ID Required", { status: 400 });

    // --- MARK AS READ LOGIC ---
    const cookie = request.headers.get("Cookie") || "";
    const token = cookie.split('pal_session=')[1]?.split(';')[0];
    
    if (token) {
        try {
            const user = await verifyAndDecodeToken(token, env.JWT_SECRET);
            // context.waitUntil runs the DB update in the background 
            // so it doesn't slow down the thread loading for the user.
            context.waitUntil(
                env.DB.prepare(`
                    INSERT INTO last_read (user_username, item_id, item_type, last_viewed_at)
                    VALUES (?, ?, 'thread', CURRENT_TIMESTAMP)
                    ON CONFLICT(user_username, item_id, item_type) 
                    DO UPDATE SET last_viewed_at = CURRENT_TIMESTAMP
                `).bind(user.username, threadId).run()
            );
        } catch (authError) {
            console.error("Auth check failed for mark-read:", authError);
        }
    }
    // --- END MARK AS READ ---

    try {
        // ... (Your existing code to fetch thread and posts)
        const thread = await env.DB.prepare("SELECT title, creator_username FROM threads WHERE id = ?")
            .bind(threadId)
            .first();

        if (!thread) return new Response("Thread not found", { status: 404 });

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