export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { action, chatId } = await request.json();
        
        // 1. Auth Check
        const cookie = request.headers.get("Cookie") || "";
        const token = cookie.split('pal_session=')[1]?.split(';')[0];
        if (!token) return new Response("Unauthorized", { status: 401 });

        const payload = JSON.parse(atob(token.split(".")[1]));
        const username = payload.username;

        if (action === "leave") {
            // We use 3 placeholders for 3 bind values: chatId, 'System', and the message.
            // CURRENT_TIMESTAMP is a SQL function and doesn't need a placeholder.
            await env.DB.prepare(
                "INSERT INTO chat_messages (room_id, username, content, created_at) VALUES (?, 'System', ?, CURRENT_TIMESTAMP)"
            ).bind(chatId, `${username} left the chat`).run();

            // Remove the user from members
            await env.DB.prepare(
                "DELETE FROM chat_members WHERE room_id = ? AND username = ?"
            ).bind(chatId, username).run();
            
            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        if (action === "delete") {
            // Verify ownership using the correct column name: creator_username
            const room = await env.DB.prepare("SELECT creator_username FROM chat_rooms WHERE id = ?")
                .bind(chatId).first();

            if (!room || room.creator_username !== username) {
                return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
            }

            // Wipe everything
            await env.DB.batch([
                env.DB.prepare("DELETE FROM chat_rooms WHERE id = ?").bind(chatId),
                env.DB.prepare("DELETE FROM chat_members WHERE room_id = ?").bind(chatId),
                env.DB.prepare("DELETE FROM chat_messages WHERE room_id = ?").bind(chatId)
            ]);

            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response("Invalid Action", { status: 400 });

    } catch (err) {
        // This returns the exact SQL error to your Network tab so you can see it
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}