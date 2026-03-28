import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        const cookieHeader = request.headers.get("Cookie") || "";
        const token = cookieHeader.split('pal_session=')[1]?.split(';')[0];

        if (!token) return new Response(JSON.stringify({ error: "No session" }), { status: 401 });

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const username = payload.username;

        const sql = `
            SELECT
                r.id, r.room_name, r.creator_username, r.created_at,
                CASE
                    WHEN lr.last_viewed_at IS NULL OR
                    (SELECT MAX(created_at) FROM chat_messages WHERE room_id = r.id) > lr.last_viewed_at
                    THEN 1
                    ELSE 0
                END as has_unread
            FROM chat_rooms r
            JOIN chat_members m ON r.id = m.room_id
            LEFT JOIN last_read lr ON r.id = lr.item_id AND lr.user_username = ? AND lr.item_type = 'chat'
            WHERE m.username = ?
            ORDER BY r.created_at DESC
        `;

        const { results } = await env.DB.prepare(sql).bind(username, username).all();

        return new Response(JSON.stringify(results || []), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
