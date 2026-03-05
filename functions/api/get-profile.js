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

        // --- AUTOMATIC RANK PROGRESSION ---
        const staffRanks = ["Admin", "Moderator", "Staff", "Owner"];
        let updated = false;

        // Only calculate rank if they aren't Staff
        if (!staffRanks.includes(user.rank)) {
            const ladder = [
                { name: "Legend", xp: 30000 },
                { name: "Elite", xp: 15000 },
                { name: "Veteran", xp: 7500 },
                { name: "Contributor", xp: 3500 },
                { name: "Supporter", xp: 1500 },
                { name: "Active Member", xp: 500 },
                { name: "Member", xp: 0 }
            ];

            // Find the highest rank they qualify for based on current XP
            const correctRank = ladder.find(r => (user.xp || 0) >= r.xp)?.name || "Member";

            // If their stored rank is different from their calculated rank, update it
            if (user.rank !== correctRank) {
                user.rank = correctRank;
                updated = true;
                
                // Optional: Push a notification for the level up
                if (!user.notifications) user.notifications = [];
                user.notifications.push({
                    id: Date.now(),
                    text: `Congratulations! Your rank has been updated to ${correctRank}!`,
                    date: new Date().toISOString(),
                    read: false
                });
            }
        }

        // If we changed the rank (or added a notification), save it back to KV
        if (updated) {
            await env.USERS_KV.put(`user:${username}`, JSON.stringify(user));
        }

        const profileData = {
            username: user.username,
            displayName: user.displayName || user.username,
            bio: user.bio || "",
            themeColor: user.themeColor || "#2563eb",
            avatar: user.avatarUrl || "/default-avatar.png",
            rank: user.rank || "Member",
            xp: user.xp || 0
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