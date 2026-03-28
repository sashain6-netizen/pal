import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);

        const threadId = url.searchParams.get("id");
    const limit = Math.min(parseInt(url.searchParams.get("limit")) || 50, 100);
    const offset = parseInt(url.searchParams.get("offset")) || 0;

    if (!threadId) return new Response("ID Required", { status: 400 });

    const cookie = request.headers.get("Cookie") || "";
    const token = cookie.split('pal_session=')[1]?.split(';')[0];

        if (token) {
        context.waitUntil((async () => {
            try {
                const user = await verifyAndDecodeToken(token, env.JWT_SECRET);
                await env.DB.prepare(`
                    INSERT INTO last_read (user_username, item_id, item_type, last_viewed_at)
                    VALUES (?, ?, 'thread', CURRENT_TIMESTAMP)
                    ON CONFLICT(user_username, item_id, item_type)
                    DO UPDATE SET last_viewed_at = CURRENT_TIMESTAMP
                `).bind(user.username, threadId).run();
            } catch (e) { console.error("Mark-read background error", e); }
        })());
    }

    try {
        const thread = await env.DB.prepare("SELECT title, creator_username FROM threads WHERE id = ?")
            .bind(threadId).first();

        if (!thread) return new Response("Thread not found", { status: 404 });

        const { results: posts } = await env.DB.prepare(`
            SELECT * FROM thread_posts
            WHERE thread_id = ?
            ORDER BY created_at ASC
            LIMIT ? OFFSET ?
        `).bind(threadId, limit + 1, offset).all();

        const hasMore = posts.length > limit;
        const postsToSend = hasMore ? posts.slice(0, limit) : posts;

        const premiumData = await env.USERS_KV.get("pal_premium", { cacheTtl: 3600 });
        const premiumUsers = premiumData ? JSON.parse(premiumData) : [];

        const uniqueUsernames = [...new Set(postsToSend.map(p => p.username.toLowerCase().trim()))];
        const userMap = {};

        await Promise.all(uniqueUsernames.map(async (uname) => {
            if (uname === "[deleted]") {
                userMap[uname] = { deleted: true };
            } else {
                const data = await env.USERS_KV.get(`user:${uname}`, { cacheTtl: 1800 });
                userMap[uname] = data ? JSON.parse(data) : {};
            }
        }));

        const decoratedPosts = postsToSend.map(post => {
            const uname = post.username.toLowerCase().trim();
            const user = userMap[uname] || {};
            const isPremium = premiumUsers.includes(uname);

            if (uname === "[deleted]" || user.deleted) {
                return {
                    ...post,
                    displayName: "Deleted User",
                    themeColor: "#6b7280",
                    forumColor: "#6b7280",
                    rank: "Deleted",
                    prefix: "",
                    premiumGlowAlpha: 0.8,
                    postCaption: "",
                    postAnimation: "none",
                    isPremium: false
                };
            }

            return {
                ...post,
                displayName: user.displayName || post.username,
                themeColor: user.themeColor || "#2563eb",
                forumColor: user.forumColor || user.themeColor || "#2563eb",
                rank: user.rank || "Member",
                prefix: user.currentPrefix || user.prefix || "",
                premiumGlowAlpha: typeof user.premiumGlowAlpha === "number" ? user.premiumGlowAlpha : 0.8,
                postCaption: isPremium ? String(user.postCaption || "") : "",
                postAnimation: isPremium ? String(user.postAnimation || "none") : "none",
                isPremium,
                avatar: user.avatarUrl || "/default-avatar.png"
            };
        });

        return new Response(JSON.stringify({
            title: thread.title,
            author_username: thread.creator_username,
            posts: decoratedPosts,
            hasMore: hasMore
        }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
