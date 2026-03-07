export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { action, chatId } = await request.json();
        
        const cookie = request.headers.get("Cookie") || "";
        const token = cookie.split('pal_session=')[1]?.split(';')[0];
        if (!token) return new Response("Unauthorized", { status: 401 });

        const payload = JSON.parse(atob(token.split(".")[1]));
        const username = payload.username;

        if (action === "leave") {
            // FIX: Match placeholders (?) to bind values
            // We provide chatId, 'System', and the message. 
            // CURRENT_TIMESTAMP is handled by the DB, so it doesn't need a '?'
            await env.DB.prepare(
                "INSERT INTO chat_messages (room_id, username, content, created_at) VALUES (?, 'System', ?, CURRENT_TIMESTAMP)"
            ).bind(chatId, `${username} left the chat`).run();

            await env.DB.prepare(
                "DELETE FROM chat_members WHERE room_id = ? AND username = ?"
            ).bind(chatId, username).run();
            
            return new Response(JSON.stringify({ success: true }));
        }

        if (action === "delete") {
            // FIX: Use 'creator_username' to match your DB
            const room = await env.DB.prepare("SELECT creator_username FROM chat_rooms WHERE id = ?")
                .bind(chatId).first();

            if (!room || room.creator_username !== username) {
                return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
            }

            await env.DB.batch([
                env.DB.prepare("DELETE FROM chat_rooms WHERE id = ?").bind(chatId),
                env.DB.prepare("DELETE FROM chat_members WHERE room_id = ?").bind(chatId),
                env.DB.prepare("DELETE FROM chat_messages WHERE room_id = ?").bind(chatId)
            ]);

            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

    } catch (err) {
        // This will return the actual error message to your console
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}