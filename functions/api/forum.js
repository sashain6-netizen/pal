import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequest(context) {
    const { request, env } = context;
    const method = request.method;
    const url = new URL(request.url);

    const cookie = request.headers.get("Cookie") || "";
    const token = cookie.split('pal_session=')[1]?.split(';')[0];
    
    let user = null;
    if (token) {
        try {
            user = await verifyAndDecodeToken(token, env.JWT_SECRET);
        } catch (e) {}
    }

    try {
        if (method === "GET") {
            const limit = parseInt(url.searchParams.get("limit")) || 50;
            const offset = parseInt(url.searchParams.get("offset")) || 0;
            const currentUsername = user?.username || "";

            // The Subquery finds the MAX(created_at) from thread_posts for each thread
            const sql = `
                SELECT 
                    t.id, t.title, t.creator_username, t.created_at,
                    CASE WHEN p.thread_id IS NOT NULL THEN 1 ELSE 0 END as is_pinned,
                    CASE 
                        WHEN p.thread_id IS NOT NULL AND (
                            lr.last_viewed_at IS NULL OR 
                            (SELECT MAX(created_at) FROM thread_posts WHERE thread_id = t.id) > lr.last_viewed_at
                        ) THEN 1
                        ELSE 0 
                    END as has_unread
                FROM threads t
                LEFT JOIN pinned_threads p ON t.id = p.thread_id AND p.user_username = ?
                LEFT JOIN last_read lr ON t.id = lr.item_id AND lr.user_username = ? AND lr.item_type = 'thread'
                ORDER BY is_pinned DESC, t.created_at DESC 
                LIMIT ? OFFSET ?
            `;

            const { results: threads } = await env.DB.prepare(sql)
                .bind(currentUsername, currentUsername, limit + 1, offset)
                .all();

            const hasMore = threads.length > limit;
            return new Response(JSON.stringify({
                threads: hasMore ? threads.slice(0, limit) : threads,
                hasMore: hasMore
            }), { headers: { "Content-Type": "application/json" } });
        }

        // ... POST logic remains the same ...
        if (method === "POST") {
            if (!user) return new Response(JSON.stringify({ error: "Login required" }), { status: 401 });
            const data = await request.json();

            if (data.pinThreadId) {
                const threadId = data.pinThreadId;
                const existing = await env.DB.prepare("SELECT id FROM pinned_threads WHERE user_username = ? AND thread_id = ?").bind(user.username, threadId).first();
                if (existing) {
                    await env.DB.prepare("DELETE FROM pinned_threads WHERE id = ?").bind(existing.id).run();
                    return new Response(JSON.stringify({ success: true, pinned: false }));
                } else {
                    await env.DB.prepare("INSERT INTO pinned_threads (user_username, thread_id) VALUES (?, ?)").bind(user.username, threadId).run();
                    return new Response(JSON.stringify({ success: true, pinned: true }));
                }
            }

            const { title, content } = data;
            if (!title || !content) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
            const info = await env.DB.prepare("INSERT INTO threads (title, creator_username) VALUES (?, ?)").bind(title, user.username).run();
            const threadId = info.meta.last_row_id;
            await env.DB.prepare("INSERT INTO thread_posts (thread_id, username, content) VALUES (?, ?, ?)").bind(threadId, user.username, content).run();
            return new Response(JSON.stringify({ success: true, threadId }));
        }

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}