export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { action, chatId } = await request.json();
        
        // 1. Auth Check
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

        // 2. Action: LEAVE
        if (action === "leave") {
            // Insert system message
            await env.DB.prepare(
                "INSERT INTO chat_messages (room_id, username, content, created_at) VALUES (?, 'System', ?, CURRENT_TIMESTAMP)"
            ).bind(chatId, `${username} left the chat`).run();

            // Delete membership
            await env.DB.prepare(
                "DELETE FROM chat_members WHERE room_id = ? AND username = ?"
            ).bind(chatId, username).run();
            
            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        if (action === "delete") {
        // 1. Verify ownership
        const room = await env.DB.prepare("SELECT creator_username FROM chat_rooms WHERE id = ?")
            .bind(chatId).first();

        if (!room || room.creator_username !== username) {
            return new Response(JSON.stringify({ error: "Forbidden" }), { 
                status: 403,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (action === "invite") {
            const { targetUsername } = await request.json(); // The person you want to add

            // 1. Check if YOU are the owner
            const room = await env.DB.prepare("SELECT creator_username FROM chat_rooms WHERE id = ?")
                .bind(chatId).first();
            if (!room || room.creator_username !== username) return new Response("Forbidden", { status: 403 });

            // 2. Check if the target user exists in your USERS table
            const userExists = await env.DB.prepare("SELECT 1 FROM users WHERE username = ?")
                .bind(targetUsername).first();
            if (!userExists) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

            // 3. Add them to the chat
            await env.DB.prepare("INSERT OR IGNORE INTO chat_members (room_id, username) VALUES (?, ?)")
                .bind(chatId, targetUsername).run();

            return new Response(JSON.stringify({ success: true }));
        }

        if (action === "kick") {
            const { targetUsername } = await request.json();

            // 1. Check ownership
            const room = await env.DB.prepare("SELECT creator_username FROM chat_rooms WHERE id = ?")
                .bind(chatId).first();
            if (!room || room.creator_username !== username) return new Response("Forbidden", { status: 403 });

            // 2. You can't kick yourself!
            if (targetUsername === username) return new Response("Cannot kick owner", { status: 400 });

            // 3. Remove them
            await env.DB.prepare("DELETE FROM chat_members WHERE room_id = ? AND username = ?")
                .bind(chatId, targetUsername).run();

            return new Response(JSON.stringify({ success: true }));
        }

        // 2. Delete in the correct order (Messages/Members FIRST, Room LAST)
        await env.DB.batch([
            env.DB.prepare("DELETE FROM chat_messages WHERE room_id = ?").bind(chatId),
            env.DB.prepare("DELETE FROM chat_members WHERE room_id = ?").bind(chatId),
            env.DB.prepare("DELETE FROM chat_rooms WHERE id = ?").bind(chatId)
        ]);

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    }

        return new Response(JSON.stringify({ error: "Invalid action" }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        // This ensures the frontend gets a JSON error string, not an HTML page
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}