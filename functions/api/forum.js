import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequest(context) {
    const { request, env } = context;
    const method = request.method;
    const url = new URL(request.url);

    // --- AUTH CHECK ---
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
            // 1. Get pagination params from URL (Default to 50)
            const limit = parseInt(url.searchParams.get("limit")) || 50;
            const offset = parseInt(url.searchParams.get("offset")) || 0;

            // 2. Fetch threads with LIMIT and OFFSET
            // We fetch limit + 1 to check if there is a next page
            const { results: threads } = await env.DB.prepare(
                "SELECT * FROM threads ORDER BY created_at DESC LIMIT ? OFFSET ?"
            ).bind(limit + 1, offset).all();

            const hasMore = threads.length > limit;
            const threadsToSend = hasMore ? threads.slice(0, limit) : threads;

            // 3. Return the results wrapped in an object
            return new Response(JSON.stringify({
                threads: threadsToSend,
                hasMore: hasMore
            }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        if (method === "POST") {
            if (!user) return new Response(JSON.stringify({ error: "Login required" }), { status: 401 });

            const { title, content } = await request.json();
            if (!title || !content) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });

            // 1. Insert Thread
            const info = await env.DB.prepare(
                "INSERT INTO threads (title, creator_username) VALUES (?, ?)"
            ).bind(title, user.username).run();

            const threadId = info.meta.last_row_id;

            // 2. Insert First Post
            await env.DB.prepare(
                "INSERT INTO thread_posts (thread_id, username, content) VALUES (?, ?, ?)"
            ).bind(threadId, user.username, content).run();

            return new Response(JSON.stringify({ success: true, threadId }));
        }
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}