export async function onRequestPost(context) {
    const { request, env } = context;
    const { action, chatId } = await request.json();
    
    // Auth Check
    const cookie = request.headers.get("Cookie") || "";
    const token = cookie.split('pal_session=')[1]?.split(';')[0];
    if (!token) return new Response("Unauthorized", { status: 401 });
    
    // Get user from token (using your existing logic)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const username = payload.username;

    if (action === "leave") {
        await env.DB.prepare(
            "DELETE FROM chat_members WHERE room_id = ? AND username = ?"
        ).bind(chatId, username).run();
        return new Response(JSON.stringify({ success: true }));
    }

    if (action === "delete") {
        // 1. Verify Ownership
        const room = await env.DB.prepare("SELECT created_by FROM chat_rooms WHERE id = ?")
            .bind(chatId).first();
            
        if (room.created_by !== username) {
            return new Response("Not the owner", { status: 403 });
        }

        // 2. Nuclear Option: Delete room, members, and messages
        await env.DB.batch([
            env.DB.prepare("DELETE FROM chat_rooms WHERE id = ?").bind(chatId),
            env.DB.prepare("DELETE FROM chat_members WHERE room_id = ?").bind(chatId),
            env.DB.prepare("DELETE FROM chat_messages WHERE room_id = ?").bind(chatId)
        ]);
        
        return new Response(JSON.stringify({ success: true }));
    }
}