import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const method = request.method;

    try {
        const cookie = request.headers.get("Cookie") || "";
        const token = cookie.split('pal_session=')[1]?.split(';')[0];
        if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

                const user = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const username = user.username;

        // --- GET: Fetch Messages ---
        if (method === "GET") {
            const chatId = url.searchParams.get("id");
            const page = parseInt(url.searchParams.get("page") || "0");
            const limit = 50;
            const offset = page * limit;

            if (!chatId) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });

            const membership = await env.DB.prepare(
                "SELECT 1 FROM chat_members WHERE room_id = ? AND username = ?"
            ).bind(chatId, username).first();

            if (!membership) return new Response(JSON.stringify({ error: "Access Denied" }), { status: 403 });

            // --- AUTO MARK AS READ ---
            context.waitUntil(
                env.DB.prepare(`
                    INSERT INTO last_read (user_username, item_id, item_type, last_viewed_at)
                    VALUES (?, ?, 'chat', CURRENT_TIMESTAMP)
                    ON CONFLICT(user_username, item_id, item_type) 
                    DO UPDATE SET last_viewed_at = CURRENT_TIMESTAMP
                `).bind(username, chatId).run()
            );

            const result = await env.DB.prepare(
                `SELECT username, content, created_at 
                 FROM chat_messages 
                 WHERE room_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT ? OFFSET ?`
            ).bind(chatId, limit, offset).all();

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

        // --- POST: Send Message ---
        if (method === "POST") {
            const { chatId, content } = await request.json();

                        const contentStr = String(content || "");
            if (!contentStr.trim()) {
                return new Response(JSON.stringify({ error: "Empty message" }), { status: 400 });
            }

            const baseMaxLen = 1000;
            const premiumMaxLen = baseMaxLen * 5;

            const premiumData = await env.USERS_KV.get("pal_premium", { cacheTtl: 3600 });
            let isPremium = false;
            if (premiumData) {
                try {
                    const premiumUsers = JSON.parse(premiumData);
                    const uname = String(username || "").toLowerCase();
                    if (Array.isArray(premiumUsers)) {
                        isPremium = premiumUsers.map(u => String(u).toLowerCase()).includes(uname);
                    } else if (premiumUsers && typeof premiumUsers === "object") {
                        isPremium = !!premiumUsers[uname];
                    }
                } catch {}
            }

            const maxLen = isPremium ? premiumMaxLen : baseMaxLen;
            if (contentStr.trim().length > maxLen) {
                return new Response(JSON.stringify({ error: `Max ${maxLen} characters for private chat messages.` }), { status: 400 });
            }

            const membership = await env.DB.prepare(
                "SELECT 1 FROM chat_members WHERE room_id = ? AND username = ?"
            ).bind(chatId, username).first();

            if (!membership) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });

                        await env.DB.prepare(
                "INSERT INTO chat_messages (room_id, username, content, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)"
            ).bind(chatId, username, contentStr.trim()).run();

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