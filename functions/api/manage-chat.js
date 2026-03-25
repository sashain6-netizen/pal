import { verifyAndDecodeToken } from './_jwt.js';

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

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const username = payload.username;

        const isMember = await env.DB.prepare(
            "SELECT 1 FROM chat_members WHERE room_id = ? AND username = ?"
        ).bind(chatId, username).first();

        if (!isMember) {
            return new Response(JSON.stringify({ 
                error: "Access Denied: You are not a member of this conversation." 
            }), { status: 403 });
        }

        // --- ACTION: LEAVE (Available to any member) ---
        if (action === "leave") {
            await env.DB.batch([
                env.DB.prepare("INSERT INTO chat_messages (room_id, username, content, created_at) VALUES (?, 'System', ?, CURRENT_TIMESTAMP)")
                    .bind(chatId, `@${username} left the chat`),
                env.DB.prepare("DELETE FROM chat_members WHERE room_id = ? AND username = ?")
                    .bind(chatId, username)
            ]);
            return new Response(JSON.stringify({ success: true }));
        }

        const room = await env.DB.prepare("SELECT creator_username FROM chat_rooms WHERE id = ?")
            .bind(chatId).first();

        if (!room || room.creator_username !== username) {
            return new Response(JSON.stringify({ error: "Only the chat creator can do this." }), { status: 403 });
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

            const allUsersJson = await env.USERS_KV.get("all_users_index", { cacheTtl: 3600 });
            const userList = JSON.parse(allUsersJson || "[]");
            if (!userList.some(u => u.toLowerCase() === targetUsername.toLowerCase())) {
                return new Response(JSON.stringify({ error: "User does not exist" }), { status: 404 });
            }

            const alreadyIn = await env.DB.prepare("SELECT 1 FROM chat_members WHERE room_id = ? AND username = ?")
                .bind(chatId, targetUsername).first();

            if (alreadyIn) {
                return new Response(JSON.stringify({ error: "User is already in this chat" }), { status: 400 });
            }

            await env.DB.batch([
                env.DB.prepare("INSERT INTO chat_members (room_id, username) VALUES (?, ?)")
                    .bind(chatId, targetUsername),
                env.DB.prepare("INSERT INTO chat_messages (room_id, username, content, created_at) VALUES (?, 'System', ?, CURRENT_TIMESTAMP)")
                    .bind(chatId, `@${username} invited @${targetUsername}`)
            ]);

            return new Response(JSON.stringify({ success: true }));
        }

        // --- ACTION: KICK ---
        if (action === "kick") {
            if (!targetUsername) return new Response(JSON.stringify({ error: "Username required" }), { status: 400 });

                        if (targetUsername.toLowerCase() === username.toLowerCase()) {
                return new Response(JSON.stringify({ error: "You cannot kick yourself" }), { status: 400 });
            }

            const memberToKick = await env.DB.prepare("SELECT 1 FROM chat_members WHERE room_id = ? AND username = ?")
                .bind(chatId, targetUsername).first();

            if (!memberToKick) {
                return new Response(JSON.stringify({ error: "User is not in this chat" }), { status: 404 });
            }

            await env.DB.batch([
                env.DB.prepare("INSERT INTO chat_messages (room_id, username, content, created_at) VALUES (?, 'System', ?, CURRENT_TIMESTAMP)")
                    .bind(chatId, `@${targetUsername} was kicked`),
                env.DB.prepare("DELETE FROM chat_members WHERE room_id = ? AND username = ?")
                    .bind(chatId, targetUsername)
            ]);

            return new Response(JSON.stringify({ success: true }));
        }

        return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}