import { verifyAndDecodeToken } from "./_jwt.js"; 

export async function onRequestPost(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie") || "";
    const token = cookieHeader.split('; ').find(row => row.trim().startsWith('pal_session='))?.split('=')[1];

    if (!token) return new Response("Unauthorized", { status: 401 });

    try {
        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET, env); 
        const username = payload.username;

        const baseBioMaxLen = 200;
        const premiumBioMaxLen = baseBioMaxLen * 5;
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
        const bioMaxLen = isPremium ? premiumBioMaxLen : baseBioMaxLen;

                // --- THE FIX: Use the prefixed key ---
        const kvKey = `user:${username}`; 

        const updates = await request.json();

        const rawData = await env.USERS_KV.get(kvKey, { cacheTtl: 1800 });

        const user = rawData ? JSON.parse(rawData) : { 
            username: username, 
            xp: 0, 
            rank: "Member", 
            currency: 0 
        }; 

        const bioStr = String(updates.bio || "");
        if (bioStr.length > bioMaxLen) {
            return new Response(JSON.stringify({ error: `Bio exceeds ${bioMaxLen} characters` }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const updatedUser = {
            ...user, 
            avatarUrl: user.avatarUrl || "/default-avatar.png",

            displayName: (updates.displayName || "").trim().substring(0, 16),

                        bio: bioStr,
            themeColor: updates.themeColor || "#2563eb"
        };

        await env.USERS_KV.put(kvKey, JSON.stringify(updatedUser));

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response("Error: " + err.message, { status: 500 });
    }
}