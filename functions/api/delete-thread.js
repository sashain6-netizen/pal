import { verifyAndDecodeToken } from './_jwt.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // 1. Get User from JWT
        const cookieHeader = request.headers.get("Cookie") || "";
        const cookies = Object.fromEntries(cookieHeader.split(';').map(c => [c.split('=')[0].trim(), c.split('=')[1]]));
        const token = cookies['pal_session'];
        if (!token) return new Response("Unauthorized", { status: 401 });

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const username = payload.username.toLowerCase();

        // 2. Get Thread ID from Request
        const { threadId } = await request.json();
        if (!threadId) return new Response("Thread ID required", { status: 400 });

        // 3. Fetch Thread & User Rank simultaneously
        const thread = await env.DB.prepare("SELECT author_username FROM threads WHERE id = ?")
            .bind(threadId).first();
        
        const userData = await env.USERS_KV.get(`user:${username}`);
        const user = userData ? JSON.parse(userData) : {};

        if (!thread) return new Response("Thread not found", { status: 404 });

        // 4. THE SECURITY CHECK
        const isOP = thread.author_username.toLowerCase() === username;
        const isOwner = user.rank === "Owner";

        if (!isOP && !isOwner) {
            return new Response(JSON.stringify({ error: "You do not have permission to delete this." }), { status: 403 });
        }

        // 5. Execute Delete (Delete Thread + All associated posts)
        await env.DB.batch([
            env.DB.prepare("DELETE FROM threads WHERE id = ?").bind(threadId),
            env.DB.prepare("DELETE FROM thread_posts WHERE thread_id = ?").bind(threadId)
        ]);

        return new Response(JSON.stringify({ success: true }));

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}