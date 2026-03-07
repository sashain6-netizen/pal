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

        // 3. Fetch Thread (FIXED COLUMN NAME)
        const thread = await env.DB.prepare("SELECT creator_username FROM threads WHERE id = ?")
            .bind(threadId).first();

        if (!thread) return new Response(JSON.stringify({ error: "Thread not found" }), { status: 404 });

        const userData = await env.USERS_KV.get(`user:${username}`);
        const user = userData ? JSON.parse(userData) : {};

        // 4. THE SECURITY CHECK (FIXED REFERENCE)
        // We check against thread.creator_username now
        const isOP = thread.creator_username.toLowerCase() === username;
        const isOwner = user.rank === "Owner";

        if (!isOP && !isOwner) {
            return new Response(JSON.stringify({ error: "You do not have permission to delete this." }), { status: 403 });
        }

        await env.DB.batch([
        // Order is important!!!!! Don't delete
        env.DB.prepare("DELETE FROM thread_posts WHERE thread_id = ?").bind(threadId),
        env.DB.prepare("DELETE FROM threads WHERE id = ?").bind(threadId)
    ]);

        return new Response(JSON.stringify({ success: true }));

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}