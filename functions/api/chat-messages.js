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
            // Check your column names! 
            // If your table doesn't have 'created_at', this will fail.
            // I'm using a safer approach: just room_id, username, and content.
            await env.DB.prepare(
                "INSERT INTO chat_messages (room_id, username, content) VALUES (?, 'System', ?)"
            ).bind(chatId, `${username} left the chat`).run();

            await env.DB.prepare(
                "DELETE FROM chat_members WHERE room_id = ? AND username = ?"
            ).bind(chatId, username).run();
            
            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        if (action === "delete") {
            // Verify ownership
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
        // This is crucial: It returns the ERROR as JSON so your script doesn't see HTML
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
        });
    }
}