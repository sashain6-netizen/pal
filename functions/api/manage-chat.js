export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { action, chatId, targetUsername } = body;
        
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

        // --- ACTION: LEAVE ---
        if (action === "leave") {
            // 1. Add System Message
            await env.DB.prepare(
                "INSERT INTO chat_messages (room_id, username, content, created_at) VALUES (?, 'System', ?, CURRENT_TIMESTAMP)"
            ).bind(chatId, `@${username} left the chat`).run();

            // 2. Remove Member
            await env.DB.prepare(
                "DELETE FROM chat_members WHERE room_id = ? AND username = ?"
            ).bind(chatId, username).run();
            
            return new Response(JSON.stringify({ success: true }));
        }

        // --- OWNER VERIFICATION ---
        const room = await env.DB.prepare("SELECT creator_username FROM chat_rooms WHERE id = ?")
            .bind(chatId).first();

        if (!room || room.creator_username !== username) {
            return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
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

            const allUsersJson = await env.USERS_KV.get("all_users_index");
            const userList = JSON.parse(allUsersJson || "[]");
            const userExists = userList.some(u => u.toLowerCase() === targetUsername.toLowerCase());

            if (!userExists) {
                return new Response(JSON.stringify({ error: "User does not exist" }), { status: 404 });
            }

            // 1. Add to Members
            await env.DB.prepare("INSERT OR IGNORE INTO chat_members (room_id, username) VALUES (?, ?)")
                .bind(chatId, targetUsername).run();

            // 2. Add System Message
            await env.DB.prepare(
                "INSERT INTO chat_messages (room_id, username, content, created_at) VALUES (?, 'System', ?, CURRENT_TIMESTAMP)"
            ).bind(chatId, `@${username} invited @${targetUsername} to the chat`).run();

            return new Response(JSON.stringify({ success: true }));
        }

        // --- ACTION: KICK ---
        if (action === "kick") {
            if (!targetUsername) return new Response(JSON.stringify({ error: "Username required" }), { status: 400 });

            // 1. Add System Message
            await env.DB.prepare(
                "INSERT INTO chat_messages (room_id, username, content, created_at) VALUES (?, 'System', ?, CURRENT_TIMESTAMP)"
            ).bind(chatId, `@${targetUsername} was kicked from the chat`).run();

            // 2. Remove Member
            await env.DB.prepare("DELETE FROM chat_members WHERE room_id = ? AND username = ?")
                .bind(chatId, targetUsername).run();

            return new Response(JSON.stringify({ success: true }));
        }

        return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}