import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequestPost(context) {
    const { request, env } = context;

    // --- 1. AUTH CHECK ---
    const cookie = request.headers.get("Cookie") || "";
    const token = cookie.split('pal_session=')[1]?.split(';')[0];
    
    if (!token) {
        return new Response(JSON.stringify({ error: "You must be logged in to reply." }), { status: 401 });
    }

    try {
        const user = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const { threadId, content } = await request.json();

        // --- 2. VALIDATION ---
        const contentStr = String(content || "");
        if (!threadId || !contentStr.trim()) {
            return new Response(JSON.stringify({ error: "Reply cannot be empty." }), { status: 400 });
        }

        const baseMaxLen = 1000;
        const premiumMaxLen = baseMaxLen * 5;

        const premiumData = await env.USERS_KV.get("pal_premium");
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
        if (contentStr.trim().length > maxLen) {
            return new Response(JSON.stringify({ error: `Max ${maxLen} characters for replies.` }), { status: 400 });
        }

        const threadCheck = await env.DB.prepare("SELECT id FROM threads WHERE id = ?")
            .bind(threadId).first();
            
        if (!threadCheck) {
            return new Response(JSON.stringify({ error: "Thread not found." }), { status: 404 });
        }

        // --- 3. INSERT REPLY & JUMP TO TOP ---
        await env.DB.batch([
            env.DB.prepare(
                "INSERT INTO thread_posts (thread_id, username, content) VALUES (?, ?, ?)"
            ).bind(threadId, user.username, contentStr.trim()),
            
            env.DB.prepare(
                "UPDATE threads SET last_activity_at = CURRENT_TIMESTAMP WHERE id = ?"
            ).bind(threadId)
        ]);

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("Reply Error:", e);
        return new Response(JSON.stringify({ error: "Server error while posting reply." }), { status: 500 });
    }
}