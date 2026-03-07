export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const method = request.method;

    // --- AUTH CHECK ---
    const cookie = request.headers.get("Cookie") || "";
    const session = cookie.split('pal_session=')[1]?.split(';')[0];
    
    // Helper to get user from KV via session
    async function getUser() {
        if (!session) return null;
        const data = await env.USERS_KV.get(`session:${session}`);
        return data ? JSON.parse(data) : null;
    }

    try {
        // GET: Fetch all threads
        if (method === "GET") {
            const { results } = await env.DB.prepare(
                "SELECT * FROM threads ORDER BY created_at DESC"
            ).all();
            return new Response(JSON.stringify(results), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // POST: Create a new thread
        if (method === "POST") {
            const user = await getUser();
            if (!user) return new Response("Login required", { status: 401 });

            const { title, content } = await request.json();
            if (!title || !content) return new Response("Missing fields", { status: 400 });

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