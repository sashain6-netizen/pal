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

        const { postId } = await request.json();
        if (!postId) return new Response("Post ID required", { status: 400 });

        const post = await env.DB.prepare(`
            SELECT tp.username, tp.thread_id, t.creator_username as thread_creator
            FROM thread_posts tp
            JOIN threads t ON tp.thread_id = t.id
            WHERE tp.id = ?
        `).bind(postId).first();

        if (!post) return new Response(JSON.stringify({ error: "Post not found" }), { status: 404 });

        const userData = await env.USERS_KV.get(`user:${username}`);
        const user = userData ? JSON.parse(userData) : {};

        const isPostAuthor = post.username.toLowerCase() === username;
        const staffRoles = ["Owner", "Admin", "Manager", "Moderator"];
        const isStaff = staffRoles.includes(user.rank);

        if (!isPostAuthor && !isStaff) {
            return new Response(JSON.stringify({ error: "You do not have permission to delete this post." }), { status: 403 });
        }

        await env.DB.prepare("DELETE FROM thread_posts WHERE id = ?").bind(postId).run();

        const remainingPosts = await env.DB.prepare("SELECT created_at FROM thread_posts WHERE thread_id = ? ORDER BY created_at DESC LIMIT 1")
            .bind(post.thread_id).first();

                if (remainingPosts) {
            await env.DB.prepare("UPDATE threads SET last_activity_at = ? WHERE id = ?")
                .bind(remainingPosts.created_at, post.thread_id).run();
        }

        return new Response(JSON.stringify({ success: true }));

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
