import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const method = request.method;

    try {
        // 1. Auth Check
        const cookie = request.headers.get("Cookie") || "";
        const token = cookie.split('pal_session=')[1]?.split(';')[0];
        if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        
        const user = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const username = user.username;

        // 2. GET: Fetch Messages (Security Gate Added Here)
        if (method === "GET") {
            const chatId = url.searchParams.get("id");
            if (!chatId) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });

            // --- THE SECURITY GATE ---
            // Check if this specific user is a member of this specific room
            const membership = await env.DB.prepare(
                "SELECT 1 FROM chat_members WHERE room_id = ? AND username = ?"
            ).bind(chatId, username).first();

            if (!membership) {
                return new Response(JSON.stringify({ 
                    error: "Access Denied: You are not a member of this chat." 
                }), { 
                    status: 403, 
                    headers: { "Content-Type": "application/json" } 
                });
            }
            // -------------------------

            // If they pass the gate, fetch data as normal
            const messages = await env.DB.prepare(
                "SELECT username, content, created_at FROM chat_messages WHERE room_id = ? ORDER BY created_at ASC LIMIT 50"
            ).bind(chatId).all();

            const room = await env.DB.prepare("SELECT room_name, creator_username FROM chat_rooms WHERE id = ?")
                .bind(chatId)
                .first();

            if (!room) return new Response(JSON.stringify({ error: "Room not found" }), { status: 404 });

            return new Response(JSON.stringify({ 
                roomName: room.room_name, 
                createdBy: room.creator_username, 
                messages: messages.results || []
            }), { headers: { "Content-Type": "application/json" } });
        }

        // 3. POST: Send Message (Add Security Gate here too)
        if (method === "POST") {
            const { chatId, content } = await request.json();

            // Re-verify membership before allowing a message to be sent
            const membership = await env.DB.prepare(
                "SELECT 1 FROM chat_members WHERE room_id = ? AND username = ?"
            ).bind(chatId, username).first();

            if (!membership) {
                return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
            }
            
            await env.DB.prepare(
                "INSERT INTO chat_messages (room_id, username, content, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)"
            ).bind(chatId, username, content).run();

            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}