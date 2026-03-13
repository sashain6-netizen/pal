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

        // 2. GET: Fetch Messages
if (method === "GET") {
    const chatId = url.searchParams.get("id");
    // Get the page from URL, default to 0 (the most recent 50)
    const page = parseInt(url.searchParams.get("page") || "0");
    const limit = 50;
    const offset = page * limit;

    if (!chatId) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });

    const membership = await env.DB.prepare(
        "SELECT 1 FROM chat_members WHERE room_id = ? AND username = ?"
    ).bind(chatId, username).first();

    if (!membership) {
        return new Response(JSON.stringify({ error: "Access Denied" }), { status: 403 });
    }

    // 1. Fetch the LATEST messages using DESC and OFFSET
    const result = await env.DB.prepare(
        `SELECT username, content, created_at 
         FROM chat_messages 
         WHERE room_id = ? 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`
    ).bind(chatId, limit, offset).all();

    // 2. Re-reverse the array so they appear in chronological order (oldest to newest) for the UI
    const messages = (result.results || []).reverse();

    const room = await env.DB.prepare("SELECT room_name, creator_username FROM chat_rooms WHERE id = ?")
        .bind(chatId)
        .first();

    return new Response(JSON.stringify({ 
        roomName: room?.room_name, 
        createdBy: room?.creator_username, 
        messages: messages,
        currentPage: page
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