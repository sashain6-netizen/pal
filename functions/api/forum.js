import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequest(context) {
    const { request, env } = context;
    const method = request.method;
    const url = new URL(request.url);

    // --- 1. AUTH CHECK ---
    const cookie = request.headers.get("Cookie") || "";
    const token = cookie.split('pal_session=')[1]?.split(';')[0];
    
    let user = null;
    if (token) {
        try {
            user = await verifyAndDecodeToken(token, env.JWT_SECRET);
        } catch (e) {
            // Token is invalid or expired; treat as guest
        }
    }

    try {
        // --- 2. GET: Fetch Threads (Pinned First) ---
        if (method === "GET") {
            const limit = parseInt(url.searchParams.get("limit")) || 50;
            const offset = parseInt(url.searchParams.get("offset")) || 0;
            
            // CRITICAL FIX: If user is logged out, bind an empty string. 
            // D1 crashes if you bind 'undefined' or 'null' directly to a string column.
            const currentUsername = user?.username || "";

            // We use 't.' aliases to prevent "ambiguous column" errors during JOINs
            const sql = `
                SELECT 
                    t.id, t.title, t.creator_username, t.created_at,
                    CASE WHEN p.thread_id IS NOT NULL THEN 1 ELSE 0 END as is_pinned
                FROM threads t
                LEFT JOIN pinned_threads p ON t.id = p.thread_id AND p.user_username = ?
                ORDER BY is_pinned DESC, t.created_at DESC 
                LIMIT ? OFFSET ?
            `;

            const { results: threads } = await env.DB.prepare(sql)
                .bind(currentUsername, limit + 1, offset)
                .all();

            const hasMore = threads.length > limit;
            const threadsToSend = hasMore ? threads.slice(0, limit) : threads;

            return new Response(JSON.stringify({
                threads: threadsToSend,
                hasMore: hasMore
            }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // --- 3. POST: Create or Pin ---
        if (method === "POST") {
            if (!user) return new Response(JSON.stringify({ error: "Login required" }), { status: 401 });

            const data = await request.json();

            // TOGGLE PIN
            if (data.pinThreadId) {
                const threadId = data.pinThreadId;

                const existing = await env.DB.prepare(
                    "SELECT id FROM pinned_threads WHERE user_username = ? AND thread_id = ?"
                ).bind(user.username, threadId).first();

                if (existing) {
                    await env.DB.prepare("DELETE FROM pinned_threads WHERE id = ?").bind(existing.id).run();
                    return new Response(JSON.stringify({ success: true, pinned: false }));
                } else {
                    await env.DB.prepare(
                        "INSERT INTO pinned_threads (user_username, thread_id) VALUES (?, ?)"
                    ).bind(user.username, threadId).run();
                    return new Response(JSON.stringify({ success: true, pinned: true }));
                }
            }

            // CREATE THREAD
            const { title, content } = data;
            if (!title || !content) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });

            const info = await env.DB.prepare(
                "INSERT INTO threads (title, creator_username) VALUES (?, ?)"
            ).bind(title, user.username).run();

            const threadId = info.meta.last_row_id;

            await env.DB.prepare(
                "INSERT INTO thread_posts (thread_id, username, content) VALUES (?, ?, ?)"
            ).bind(threadId, user.username, content).run();

            return new Response(JSON.stringify({ success: true, threadId }));
        }

    } catch (e) {
        // This will send the EXACT error message back to the frontend for debugging
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}