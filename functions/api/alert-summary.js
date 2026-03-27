import { verifyAndDecodeToken } from "./_jwt.js";

async function getDisplayName(env, username) {
    const normalized = String(username || "").toLowerCase().trim();
    if (!normalized || normalized === "system" || normalized === "[deleted]") {
        return normalized === "[deleted]" ? "Deleted User" : "System";
    }

    try {
        const raw = await env.USERS_KV.get(`user:${normalized}`, { cacheTtl: 1800 });
        if (!raw) return username;
        const user = JSON.parse(raw);
        return user.displayName || user.username || username;
    } catch {
        return username;
    }
}

export async function onRequestGet(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie") || "";
    const token = cookieHeader.split("pal_session=")[1]?.split(";")[0];

    if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const user = await verifyAndDecodeToken(token, env.JWT_SECRET, env);
        const username = String(user.username || "").toLowerCase().trim();

        await env.DB.batch([
            env.DB.prepare(`
                CREATE TABLE IF NOT EXISTS pinned_threads (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_username TEXT NOT NULL,
                    thread_id INTEGER NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_username, thread_id)
                )
            `),
            env.DB.prepare(`
                CREATE TABLE IF NOT EXISTS last_read (
                    user_username TEXT NOT NULL,
                    item_id INTEGER NOT NULL,
                    item_type TEXT NOT NULL,
                    last_viewed_at TEXT NOT NULL,
                    PRIMARY KEY (user_username, item_id, item_type)
                )
            `)
        ]);

        const [rawUser, chatsResult, pinnedResult] = await Promise.all([
            env.USERS_KV.get(`user:${username}`, { cacheTtl: 60 }),
            env.DB.prepare(`
                SELECT
                    r.id,
                    r.room_name,
                    r.creator_username,
                    CASE
                        WHEN lr.last_viewed_at IS NULL OR
                             (SELECT MAX(created_at) FROM chat_messages WHERE room_id = r.id) > lr.last_viewed_at
                        THEN 1 ELSE 0
                    END AS has_unread,
                    (
                        SELECT username
                        FROM chat_messages
                        WHERE room_id = r.id
                        ORDER BY created_at DESC, rowid DESC
                        LIMIT 1
                    ) AS latest_username,
                    (
                        SELECT content
                        FROM chat_messages
                        WHERE room_id = r.id
                        ORDER BY created_at DESC, rowid DESC
                        LIMIT 1
                    ) AS latest_content,
                    (
                        SELECT created_at
                        FROM chat_messages
                        WHERE room_id = r.id
                        ORDER BY created_at DESC, rowid DESC
                        LIMIT 1
                    ) AS latest_created_at
                FROM chat_rooms r
                JOIN chat_members m ON r.id = m.room_id
                LEFT JOIN last_read lr
                    ON r.id = lr.item_id
                    AND lr.user_username = ?
                    AND lr.item_type = 'chat'
                WHERE m.username = ?
                ORDER BY latest_created_at DESC, r.created_at DESC
                LIMIT 20
            `).bind(username, username).all(),
            env.DB.prepare(`
                SELECT
                    t.id,
                    t.title,
                    t.creator_username,
                    t.last_activity_at,
                    CASE
                        WHEN lr.last_viewed_at IS NULL OR
                             (SELECT MAX(created_at) FROM thread_posts WHERE thread_id = t.id) > lr.last_viewed_at
                        THEN 1 ELSE 0
                    END AS has_unread,
                    (
                        SELECT username
                        FROM thread_posts
                        WHERE thread_id = t.id
                        ORDER BY created_at DESC, id DESC
                        LIMIT 1
                    ) AS latest_username,
                    (
                        SELECT content
                        FROM thread_posts
                        WHERE thread_id = t.id
                        ORDER BY created_at DESC, id DESC
                        LIMIT 1
                    ) AS latest_content,
                    (
                        SELECT created_at
                        FROM thread_posts
                        WHERE thread_id = t.id
                        ORDER BY created_at DESC, id DESC
                        LIMIT 1
                    ) AS latest_created_at
                FROM pinned_threads p
                JOIN threads t ON t.id = p.thread_id
                LEFT JOIN last_read lr
                    ON t.id = lr.item_id
                    AND lr.user_username = ?
                    AND lr.item_type = 'thread'
                WHERE p.user_username = ?
                ORDER BY t.last_activity_at DESC
                LIMIT 20
            `).bind(username, username).all()
        ]);

        const kvUser = rawUser ? JSON.parse(rawUser) : {};
        const notifications = Array.isArray(kvUser.notifications) ? kvUser.notifications.slice(0, 20) : [];

        const unreadChatsRaw = (chatsResult.results || []).filter((chat) => Number(chat.has_unread) === 1 && chat.latest_created_at);
        const unreadPinnedRaw = (pinnedResult.results || []).filter((thread) => Number(thread.has_unread) === 1 && thread.latest_created_at);

        const decoratedChats = await Promise.all(unreadChatsRaw.map(async (chat) => ({
            id: chat.id,
            roomName: chat.room_name || "Private Chat",
            creatorUsername: chat.creator_username,
            latestUsername: chat.latest_username || "system",
            latestDisplayName: await getDisplayName(env, chat.latest_username || "system"),
            latestContent: chat.latest_content || "",
            latestCreatedAt: chat.latest_created_at,
            url: `/pages/chat?id=${chat.id}`
        })));

        const decoratedPinnedThreads = await Promise.all(unreadPinnedRaw.map(async (thread) => ({
            id: thread.id,
            title: thread.title || "Pinned Thread",
            creatorUsername: thread.creator_username,
            latestUsername: thread.latest_username || "system",
            latestDisplayName: await getDisplayName(env, thread.latest_username || "system"),
            latestContent: thread.latest_content || "",
            latestCreatedAt: thread.latest_created_at,
            url: `/pages/thread?id=${thread.id}`
        })));

        return new Response(JSON.stringify({
            notifications,
            unreadChats: decoratedChats,
            unreadPinnedThreads: decoratedPinnedThreads,
            hasNotificationInbox: notifications.length > 0,
            hasUnreadChats: decoratedChats.length > 0,
            hasUnreadPinnedThreads: decoratedPinnedThreads.length > 0
        }), {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store"
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message || "Failed to load alert summary" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
