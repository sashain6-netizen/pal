import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequestPost(context) {
    const { request, env } = context;

    const cookie = request.headers.get("Cookie") || "";
    const token = cookie.split('pal_session=')[1]?.split(';')[0];
    if (!token) return new Response("Unauthorized", { status: 401 });

    try {
        const user = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const { itemId, type } = await request.json(); 

        await env.DB.prepare(`
            INSERT INTO last_read (user_username, item_id, item_type, last_viewed_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_username, item_id, item_type) 
            DO UPDATE SET last_viewed_at = CURRENT_TIMESTAMP
        `).bind(user.username, itemId, type).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}