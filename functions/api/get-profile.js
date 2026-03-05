import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequestGet(context) {
    const { request, env } = context;
    
    const cookieHeader = request.headers.get("Cookie") || "";
    const token = cookieHeader
        .split('; ')
        .find(row => row.trim().startsWith('pal_session='))
        ?.split('=')[1];

    if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { 
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET); 
        const username = payload.username;

        const rawData = await env.USERS_KV.get(`user:${username}`);
        
        if (!rawData) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const user = JSON.parse(rawData);

        // 1. Define the Rank Ladder
        const ladder = [
            { name: "Legend", xp: 30000 },
            { name: "Elite", xp: 15000 },
            { name: "Veteran", xp: 7500 },
            { name: "Contributor", xp: 3500 },
            { name: "Supporter", xp: 1500 },
            { name: "Active Member", xp: 500 },
            { name: "Member", xp: 0 }
        ];

        // 2. ALWAYS calculate the XP-based rank (for staff visibility)
        const xpRank = ladder.find(r => (user.xp || 0) >= r.xp)?.name || "Member";

        // 3. AUTOMATIC RANK PROGRESSION (Only for non-staff)
        const staffRanks = ["Admin", "Moderator", "Staff", "Owner", "Bot"];
        let updated = false;

        if (!staffRanks.includes(user.rank)) {
            if (user.rank !== xpRank) {
                user.rank = xpRank;
                updated = true;
                
                if (!user.notifications) user.notifications = [];
                user.notifications.push({
                    id: Date.now(),
                    text: `Congratulations! Your rank has been updated to ${xpRank}!`,
                    date: new Date().toISOString(),
                    read: false
                });
            }
        }

        if (updated) {
            await env.USERS_KV.put(`user:${username}`, JSON.stringify(user));
        }

        // 4. PREPARE FULL DATA (including stats)
        const profileData = {
            username: user.username,
            displayName: user.displayName || user.username,
            bio: user.bio || "",
            themeColor: user.themeColor || "#2563eb",
            avatar: user.avatarUrl || "/default-avatar.png",
            rank: user.rank || "Member",        // Official Rank (Admin, Mod, etc.)
            xpRank: xpRank,                     // The XP title (Legend, Elite, etc.)
            xp: user.xp || 0,
            currency: user.currency || 0,
            followersCount: user.followers || 0,
            followingCount: user.following?.length || 0
        };

        return new Response(JSON.stringify(profileData), {
            headers: { 
                "Content-Type": "application/json",
                "Cache-Control": "no-store" 
            }
        });

    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: "Invalid Session" }), { 
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }
}