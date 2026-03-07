import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequestPost(context) {
    const { request, env } = context;

    // --- 1. AUTH CHECK ---
    const cookie = request.headers.get("Cookie") || "";
    const token = cookie.split('pal_session=')[1]?.split(';')[0];
    
    if (!token) {
        return new Response(JSON.stringify({ error: "You must be logged in to reply." }), { status: 401 });
    }

    try {
        const user = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const { threadId, content } = await request.json();

        // --- 2. VALIDATION ---
        if (!threadId || !content || content.trim() === "") {
            return new Response(JSON.stringify({ error: "Reply cannot be empty." }), { status: 400 });
        }

        // Optional: Check if the thread actually exists
        const threadCheck = await env.DB.prepare("SELECT id FROM threads WHERE id = ?")
            .bind(threadId).first();
            
        if (!threadCheck) {
            return new Response(JSON.stringify({ error: "Thread not found." }), { status: 404 });
        }

        // --- 3. INSERT REPLY ---
        await env.DB.prepare(
            "INSERT INTO thread_posts (thread_id, username, content) VALUES (?, ?, ?)"
        ).bind(threadId, user.username, content).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("Reply Error:", e);
        return new Response(JSON.stringify({ error: "Server error while posting reply." }), { status: 500 });
    }
}