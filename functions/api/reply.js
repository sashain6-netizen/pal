export async function onRequestPost(context) {
    const { request, env } = context;

    // --- AUTH CHECK ---
    const cookie = request.headers.get("Cookie") || "";
    const session = cookie.split('pal_session=')[1]?.split(';')[0];
    
    if (!session) return new Response("Unauthorized", { status: 401 });

    try {
        const userData = await env.USERS_KV.get(`session:${session}`);
        if (!userData) return new Response("Session expired", { status: 401 });
        const user = JSON.parse(userData);

        const { threadId, content } = await request.json();

        if (!content || content.trim().length === 0) {
            return new Response("Post cannot be empty", { status: 400 });
        }

        // Insert the reply into D1
        await env.DB.prepare(
            "INSERT INTO thread_posts (thread_id, username, content) VALUES (?, ?, ?)"
        ).bind(threadId, user.username, content).run();

        return new Response(JSON.stringify({ success: true }));

    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}