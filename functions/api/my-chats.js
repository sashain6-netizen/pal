import { verifyAndDecodeToken } from "./_jwt.js"; // Use your existing JWT helper

export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        const cookieHeader = request.headers.get("Cookie") || "";
        const token = cookieHeader.split('pal_session=')[1]?.split(';')[0];

        if (!token) {
            return new Response(JSON.stringify({ error: "No session" }), { status: 401 });
        }

        // Verify using your shared secret
        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const username = payload.username.toLowerCase();

        // Query D1 - finding chats where user is a member
        const { results } = await env.DB.prepare(`
            SELECT r.id, r.room_name, r.creator_username, r.created_at 
            FROM chat_rooms r
            JOIN chat_members m ON r.id = m.room_id
            WHERE m.username = ?
            ORDER BY r.created_at DESC
        `).bind(username).all();

        return new Response(JSON.stringify(results || []), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("My-Chats Error:", e.message);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}