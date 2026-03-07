import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const method = request.method;

    // 1. Auth Check
    const cookie = request.headers.get("Cookie") || "";
    const token = cookie.split('pal_session=')[1]?.split(';')[0];
    if (!token) return new Response("Unauthorized", { status: 401 });
    const user = await verifyAndDecodeToken(token, env.JWT_SECRET);

    // 2. GET: Fetch Messages
    if (method === "GET") {
        const chatId = url.searchParams.get("id");
        
        const member = await env.DB.prepare(
            "SELECT 1 FROM chat_members WHERE room_id = ? AND username = ?"
        ).bind(chatId, user.username).first();

        if (!member) return new Response("Forbidden", { status: 403 });

        const messages = await env.DB.prepare(
            "SELECT username, content, created_at FROM chat_messages WHERE room_id = ? ORDER BY created_at ASC LIMIT 50"
        ).bind(chatId).all();

        // 1. Change created_by to creator_username here
        const room = await env.DB.prepare("SELECT room_name, creator_username FROM chat_rooms WHERE id = ?")
            .bind(chatId)
            .first();

        return new Response(JSON.stringify({ 
            roomName: room?.room_name, 
            createdBy: room?.creator_username, // 2. Keep the JSON key as createdBy for your script.js
            messages: messages.results 
        }));
    }

    // 3. POST: Send Message
    if (method === "POST") {
        const { chatId, content } = await request.json();
        
        // Use new Date().toISOString() or CURRENT_TIMESTAMP for better sorting
        await env.DB.prepare(
            "INSERT INTO chat_messages (room_id, username, content, created_at) VALUES (?, ?, ?, ?)"
        ).bind(chatId, user.username, content, new Date().toISOString()).run();

        return new Response(JSON.stringify({ success: true }));
    }
}