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

        for (const username of allUsers) {
            const userData = await env.USERS_KV.get(`user:${username.toLowerCase()}`);
            if (userData) {
                const user = JSON.parse(userData);
                
                if (user.isBanned === true) {
                    // Calculate time remaining
                    let timeRemaining = null;
                    let banStatus = "Permanent";
                    
                    if (user.banExpiration) {
                        const expirationTime = new Date(user.banExpiration).getTime();
                        if (expirationTime > now) {
                            const remainingMs = expirationTime - now;
                            const remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
                            const remainingHours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                            const remainingMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
                            
                            timeRemaining = {
                                days: remainingDays,
                                hours: remainingHours,
                                minutes: remainingMinutes,
                                totalMs: remainingMs,
                                expirationDate: user.banExpiration
                            };
                            banStatus = "Temporary";
                        } else {
                            // Ban expired, skip this user
                            continue;
                        }
                    }

                    bannedUsers.push({
                        username: username,
                        displayName: user.displayName || user.username,
                        rank: user.rank || "Member",
                        banReason: user.banReason || "No reason provided",
                        banStatus: banStatus,
                        timeRemaining: timeRemaining,
                        banDate: user.banDate || "Unknown"
                    });
                }
            }
        }

        // Sort by ban date (most recent first)
        bannedUsers.sort((a, b) => {
            if (a.banDate === "Unknown" && b.banDate === "Unknown") return 0;
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
