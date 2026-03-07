export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // 1. Parse data ONCE at the very top
        const body = await request.json();
        const { action, chatId, targetUsername } = body;
        
        // 2. Auth Check
        const cookie = request.headers.get("Cookie") || "";
        const token = cookie.split('pal_session=')[1]?.split(';')[0];
        
        if (!token) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { 
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        const username = payload.username;

        // --- ACTION: LEAVE (Doesn't require ownership) ---
        if (action === "leave") {
            await env.DB.prepare(
                "INSERT INTO chat_messages (room_id, username, content, created_at) VALUES (?, 'System', ?, CURRENT_TIMESTAMP)"
            ).bind(chatId, `${username} left the chat`).run();

            await env.DB.prepare(
                "DELETE FROM chat_members WHERE room_id = ? AND username = ?"
            ).bind(chatId, username).run();
            
            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // --- OWNER VERIFICATION (Required for Delete, Invite, Kick) ---
        const room = await env.DB.prepare("SELECT creator_username FROM chat_rooms WHERE id = ?")
            .bind(chatId).first();

        if (!room || room.creator_username !== username) {
            return new Response(JSON.stringify({ error: "Forbidden: You are not the owner" }), { 
                status: 403,
                headers: { "Content-Type": "application/json" }
            });
        }

        // --- ACTION: DELETE ---
        if (action === "delete") {
            await env.DB.batch([
                env.DB.prepare("DELETE FROM chat_messages WHERE room_id = ?").bind(chatId),
                env.DB.prepare("DELETE FROM chat_members WHERE room_id = ?").bind(chatId),
                env.DB.prepare("DELETE FROM chat_rooms WHERE id = ?").bind(chatId)
            ]);
            return new Response(JSON.stringify({ success: true }));
        }

        // --- ACTION: INVITE ---
        if (action === "invite") {
            if (!targetUsername) return new Response(JSON.stringify({ error: "Username required" }), { status: 400 });

            const userExists = await env.DB.prepare("SELECT 1 FROM users WHERE username = ?")
                .bind(targetUsername).first();
            
            if (!userExists) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

            await env.DB.prepare("INSERT OR IGNORE INTO chat_members (room_id, username) VALUES (?, ?)")
                .bind(chatId, targetUsername).run();

            return new Response(JSON.stringify({ success: true }));
        }

        // --- ACTION: KICK ---
        if (action === "kick") {
            if (!targetUsername) return new Response(JSON.stringify({ error: "Username required" }), { status: 400 });
            if (targetUsername === username) return new Response(JSON.stringify({ error: "Cannot kick yourself" }), { status: 400 });

            await env.DB.prepare("DELETE FROM chat_members WHERE room_id = ? AND username = ?")
                .bind(chatId, targetUsername).run();

            return new Response(JSON.stringify({ success: true }));
        }

        // Default if no action matched
        return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}