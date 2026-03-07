export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { action, chatId } = await request.json();
        
        // 1. Auth Check (Same as your other files)
        const cookie = request.headers.get("Cookie") || "";
        const token = cookie.split('pal_session=')[1]?.split(';')[0];
        if (!token) return new Response("Unauthorized", { status: 401 });

        // Get username from JWT
        const payload = JSON.parse(atob(token.split(".")[1]));
        const username = payload.username;

        if (action === "leave") {
            await env.DB.prepare(
                "DELETE FROM chat_members WHERE room_id = ? AND username = ?"
            ).bind(chatId, username).run();
            
            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        if (action === "delete") {
            // Verify ownership before deleting
            const room = await env.DB.prepare("SELECT created_by FROM chat_rooms WHERE id = ?")
                .bind(chatId).first();

            if (!room || room.created_by !== username) {
                return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
            }

            // Batch delete everything related to this chat
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
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}