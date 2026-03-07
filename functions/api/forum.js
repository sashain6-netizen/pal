import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequest(context) {
    const { request, env } = context;
    const method = request.method;

    // --- AUTH CHECK ---
    const cookie = request.headers.get("Cookie") || "";
    const token = cookie.split('pal_session=')[1]?.split(';')[0];
    
    let user = null;
    if (token) {
        try {
            // Verify the JWT against your secret
            user = await verifyAndDecodeToken(token, env.JWT_SECRET);
        } catch (e) {
            // If token is fake or expired, user remains null
        }
    }

    try {
        if (method === "GET") {
            const { results } = await env.DB.prepare(
                "SELECT * FROM threads ORDER BY created_at DESC"
            ).all();
            return new Response(JSON.stringify(results), {
                headers: { "Content-Type": "application/json" }
            });
        }

        if (method === "POST") {
            // Check if JWT was valid
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