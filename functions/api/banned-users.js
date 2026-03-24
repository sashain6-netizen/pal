import { verifyAndDecodeToken } from './_jwt.js';

export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        // 1. Authenticate user
        const cookieHeader = request.headers.get("Cookie") || "";
        const cookies = {};
        cookieHeader.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) {
                cookies[name] = value;
            }
        });
        const token = cookies['pal_session'];
        if (!token) return new Response("Unauthorized", { status: 401 });

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET, env);
        const username = payload.username.toLowerCase();

        // 2. Check if user is staff
        const userData = await env.USERS_KV.get(`user:${username}`);
        const user = userData ? JSON.parse(userData) : {};
        
        const staffRoles = ["Owner", "Admin", "Manager", "Moderator"];
        if (!staffRoles.includes(user.rank)) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }

        // 3. Get all users and filter banned ones
        const allUsersIndex = await env.USERS_KV.get("all_users_index", { cacheTtl: 3600 });
        const allUsers = allUsersIndex ? JSON.parse(allUsersIndex) : [];
        
        const bannedUsers = [];
        const now = Date.now();

        for (const targetUsername of allUsers) {
            const targetData = await env.USERS_KV.get(`user:${targetUsername.toLowerCase()}`);
            if (targetData) {
                const targetUser = JSON.parse(targetData);
                
                if (targetUser.isBanned === true) {
                    // --- NEW LOGIC: Find the Ban ID for the frontend ---
                    const userBansRecord = await env.USERS_KV.get(`bans:${targetUsername.toLowerCase()}`);
                    const banIds = userBansRecord ? JSON.parse(userBansRecord) : [];
                    let banId = null;
                    
                    // Get the most recent ban ID from the user's history
                    if (banIds.length > 0) {
                        banId = banIds[banIds.length - 1];
                    }

                    // Calculate time remaining
                    let timeRemaining = null;
                    let banStatus = "Permanent";
                    
                    if (targetUser.banExpiration) {
                        const expirationTime = new Date(targetUser.banExpiration).getTime();
                        if (expirationTime > now) {
                            const remainingMs = expirationTime - now;
                            timeRemaining = {
                                days: Math.floor(remainingMs / (24 * 60 * 60 * 1000)),
                                hours: Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)),
                                minutes: Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000)),
                                totalMs: remainingMs,
                                expirationDate: targetUser.banExpiration
                            };
                            banStatus = "Temporary";
                        } else {
                            // Ban expired (Auto-cleanup logic could go here)
                            continue;
                        }
                    }

                    bannedUsers.push({
                        username: targetUsername,
                        displayName: targetUser.displayName || targetUser.username,
                        rank: targetUser.rank || "Member",
                        banReason: targetUser.banReason || "No reason provided",
                        banStatus: banStatus,
                        timeRemaining: timeRemaining,
                        banDate: targetUser.banDate || "Unknown",
                        // Added these for the frontend to find the ban log
                        id: banId, 
                        active: true 
                    });
                }
            }
        }

        // Sort by ban date
        bannedUsers.sort((a, b) => {
            if (a.banDate === "Unknown") return 1;
            if (b.banDate === "Unknown") return -1;
            return new Date(b.banDate) - new Date(a.banDate);
        });

        return new Response(JSON.stringify({ 
            bannedUsers: bannedUsers,
            totalBanned: bannedUsers.length
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("Banned users error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}