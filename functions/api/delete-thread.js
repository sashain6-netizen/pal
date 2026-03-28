import { verifyAndDecodeToken } from './_jwt.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const cookieHeader = request.headers.get("Cookie") || "";
        const cookies = Object.fromEntries(cookieHeader.split(';').map(c => [c.split('=')[0].trim(), c.split('=')[1]]));
        const token = cookies['pal_session'];
        if (!token) return new Response("Unauthorized", { status: 401 });

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const username = payload.username.toLowerCase();

        const { threadId } = await request.json();
        if (!threadId) return new Response("Thread ID required", { status: 400 });

        const thread = await env.DB.prepare("SELECT creator_username FROM threads WHERE id = ?")
            .bind(threadId).first();

        if (!thread) return new Response(JSON.stringify({ error: "Thread not found" }), { status: 404 });

        const userData = await env.USERS_KV.get(`user:${username}`);
        const user = userData ? JSON.parse(userData) : {};

        const isOP = thread.creator_username.toLowerCase() === username;
        const staffRoles = ["Owner", "Admin", "Manager", "Moderator"];
        const isStaff = staffRoles.includes(user.rank);

        if (!isOP && !isStaff) {
            return new Response(JSON.stringify({ error: "You do not have permission to delete this." }), { status: 403 });
        }

        await env.DB.batch([
        env.DB.prepare("DELETE FROM thread_posts WHERE thread_id = ?").bind(threadId),
        env.DB.prepare("DELETE FROM threads WHERE id = ?").bind(threadId)
    ]);

        return new Response(JSON.stringify({ success: true }));

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
