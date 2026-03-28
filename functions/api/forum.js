import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequest(context) {
    const { request, env } = context;
    const method = request.method;
    const url = new URL(request.url);

    const cookie = request.headers.get("Cookie") || "";
    const token = cookie.split('pal_session=')[1]?.split(';')[0];

        let user = null;
    if (token) {
        try {
            user = await verifyAndDecodeToken(token, env.JWT_SECRET);
        } catch (e) {}
    }

    try {
        if (method === "GET") {
            await env.DB.prepare(`
                CREATE TABLE IF NOT EXISTS threads (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    creator_username TEXT NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    last_activity_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            `).run();

            await env.DB.prepare(`
                CREATE TABLE IF NOT EXISTS thread_posts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    thread_id INTEGER NOT NULL,
                    username TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
                )
            `).run();

            await env.DB.prepare(`
                CREATE TABLE IF NOT EXISTS thread_bumps (
                    thread_id INTEGER PRIMARY KEY,
                    bumped_at TEXT NOT NULL,
                    bumped_by TEXT NOT NULL
                )
            `).run();

            await env.DB.prepare(`
                CREATE TABLE IF NOT EXISTS pinned_threads (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_username TEXT NOT NULL,
                    thread_id INTEGER NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_username, thread_id)
                )
            `).run();

            await env.DB.prepare(`
                CREATE TABLE IF NOT EXISTS last_read (
                    user_username TEXT NOT NULL,
                    item_id INTEGER NOT NULL,
                    item_type TEXT NOT NULL,
                    last_viewed_at TEXT NOT NULL,
                    PRIMARY KEY (user_username, item_id, item_type)
                )
            `).run();

            const limit = parseInt(url.searchParams.get("limit")) || 50;
            const offset = parseInt(url.searchParams.get("offset")) || 0;
            const currentUsername = user?.username || "";

            const premiumData = await env.USERS_KV.get("pal_premium", { cacheTtl: 3600 });
            const premiumUsers = premiumData ? JSON.parse(premiumData) : [];
            const premiumSet = new Set(
                Array.isArray(premiumUsers) ? premiumUsers.map(u => String(u).toLowerCase()) : []
            );

            const sql = `
                SELECT
                    t.id, t.title, t.creator_username, t.created_at,
                    t.last_activity_at,
                    CASE WHEN p.thread_id IS NOT NULL THEN 1 ELSE 0 END as is_pinned,
                    CASE
                        WHEN p.thread_id IS NOT NULL AND (
                            lr.last_viewed_at IS NULL OR
                            (SELECT MAX(created_at) FROM thread_posts WHERE thread_id = t.id) > lr.last_viewed_at
                        ) THEN 1
                        ELSE 0
                    END as has_unread
                FROM threads t
                LEFT JOIN pinned_threads p ON t.id = p.thread_id AND p.user_username = ?
                LEFT JOIN last_read lr ON t.id = lr.item_id AND lr.user_username = ? AND lr.item_type = 'thread'
                -- SORT BY PINNED FIRST, THEN BY NEWEST ACTIVITY
                ORDER BY is_pinned DESC, t.last_activity_at DESC
                LIMIT ? OFFSET ?
            `;

            const { results: rawThreads } = await env.DB.prepare(sql)
                .bind(currentUsername, currentUsername, limit + 1, offset)
                .all();

            const threads = await Promise.all(
                rawThreads.map(async (t) => {
                    const creatorUsername = String(t.creator_username || "").toLowerCase();

                    if (creatorUsername === "[deleted]") {
                        return {
                            ...t,
                            isPremium: false,
                            forumColor: "#6b7280",
                            premiumGlowAlpha: 0.8
                        };
                    }

                    const userDataRaw = await env.USERS_KV.get(`user:${creatorUsername}`, { cacheTtl: 1800 });
                    const userData = userDataRaw ? JSON.parse(userDataRaw) : {};

                    return {
                        ...t,
                        isPremium: premiumSet.has(creatorUsername),
                        forumColor: premiumSet.has(creatorUsername)
                            ? (userData.forumColor || userData.themeColor || "#2563eb")
                            : "#2563eb",
                        premiumGlowAlpha: typeof userData.premiumGlowAlpha === "number" ? userData.premiumGlowAlpha : 0.8,
                        avatar: userData.avatarUrl || "/default-avatar.png"
                    };
                })
            );

            const hasMore = threads.length > limit;
            return new Response(JSON.stringify({
                threads: hasMore ? threads.slice(0, limit) : threads,
                hasMore: hasMore
            }), { headers: { "Content-Type": "application/json" } });
        }

        if (method === "POST") {
            if (!user) return new Response(JSON.stringify({ error: "Login required" }), { status: 401 });
            const data = await request.json();

            if (data.pinThreadId) {
                const threadId = data.pinThreadId;
                const existing = await env.DB.prepare("SELECT id FROM pinned_threads WHERE user_username = ? AND thread_id = ?").bind(user.username, threadId).first();
                if (existing) {
                    await env.DB.prepare("DELETE FROM pinned_threads WHERE id = ?").bind(existing.id).run();
                    return new Response(JSON.stringify({ success: true, pinned: false }));
                } else {
                    await env.DB.prepare("INSERT INTO pinned_threads (user_username, thread_id) VALUES (?, ?)").bind(user.username, threadId).run();
                    return new Response(JSON.stringify({ success: true, pinned: true }));
                }
            }

            const { title, content } = data;

            const titleStr = String(title || "");
            const contentStr = String(content || "");

            if (!titleStr.trim() || !contentStr.trim()) {
                return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
            }

            const baseMaxLen = 1000;
            const premiumMaxLen = baseMaxLen * 5;

            const premiumData = await env.USERS_KV.get("pal_premium", { cacheTtl: 3600 });
            let isPremium = false;
            if (premiumData) {
                try {
                    const premiumUsers = JSON.parse(premiumData);
                    const uname = String(user.username || "").toLowerCase();
                    if (Array.isArray(premiumUsers)) {
                        isPremium = premiumUsers.map(u => String(u).toLowerCase()).includes(uname);
                    } else if (premiumUsers && typeof premiumUsers === "object") {
                        isPremium = !!premiumUsers[uname];
                    }
                } catch {}
            }

            const maxLen = isPremium ? premiumMaxLen : baseMaxLen;
            if (titleStr.trim().length > maxLen || contentStr.trim().length > maxLen) {
                return new Response(JSON.stringify({ error: `Max ${maxLen} characters for title/content.` }), { status: 400 });
            }

            const info = await env.DB.prepare("INSERT INTO threads (title, creator_username) VALUES (?, ?)").bind(titleStr.trim(), user.username).run();
            const threadId = info.meta.last_row_id;
            await env.DB.prepare("INSERT INTO thread_posts (thread_id, username, content) VALUES (?, ?, ?)").bind(threadId, user.username, contentStr.trim()).run();
            return new Response(JSON.stringify({ success: true, threadId }));
        }

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
