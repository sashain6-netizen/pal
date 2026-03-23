import { verifyAndDecodeToken } from './_jwt.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // 1. Get User from JWT
        const cookieHeader = request.headers.get("Cookie") || "";
        const cookies = Object.fromEntries(cookieHeader.split(';').map(c => [c.split('=')[0].trim(), c.split('=')[1]]));
        const token = cookies['pal_session'];
        if (!token) return new Response("Unauthorized", { status: 401 });

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const bannerUsername = payload.username.toLowerCase();

        // 2. Get Ban Data from Request
        const { targetUsername, reason, duration } = await request.json();
        if (!targetUsername || !reason) {
            return new Response(JSON.stringify({ error: "Target username and reason are required" }), { status: 400 });
        }

        // 3. Check if banner has permission
        const bannerData = await env.USERS_KV.get(`user:${bannerUsername}`);
        const banner = bannerData ? JSON.parse(bannerData) : {};
        
        const staffRoles = ["Owner", "Admin", "Manager", "Moderator"];
        if (!staffRoles.includes(banner.rank)) {
            return new Response(JSON.stringify({ error: "Only staff can ban users" }), { status: 403 });
        }

        // 4. Check if target user exists
        const targetData = await env.USERS_KV.get(`user:${targetUsername.toLowerCase()}`);
        if (!targetData) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const target = JSON.parse(targetData);

        // 5. Prevent banning higher rank users
        const rankHierarchy = { "Owner": 3, "Admin": 2, "Manager": 2, "Moderator": 1, "Staff": 0 };
        if (rankHierarchy[target.rank] > rankHierarchy[banner.rank]) {
            return new Response(JSON.stringify({ error: "Cannot ban users with higher rank" }), { status: 403 });
        }

        // 6. Calculate ban expiration
        let banExpiration = null;
        if (duration && duration !== "permanent") {
            let durationMs;
            
            // Handle new seconds-based format (e.g., "3600seconds")
            const secondsMatch = duration.match(/^(\d+)seconds$/);
            if (secondsMatch) {
                const seconds = parseInt(secondsMatch[1]);
                // Validate maximum duration (365 days in seconds)
                const maxSeconds = 365 * 24 * 60 * 60;
                if (seconds > maxSeconds) {
                    return new Response(JSON.stringify({ error: "Maximum ban duration is 365 days" }), { status: 400 });
                }
                if (seconds <= 0) {
                    return new Response(JSON.stringify({ error: "Duration must be greater than 0" }), { status: 400 });
                }
                durationMs = seconds * 1000;
            } else {
                // Legacy support for old preset durations
                const durationMap = {
                    "1hour": 1 * 60 * 60 * 1000,
                    "24hours": 24 * 60 * 60 * 1000,
                    "7days": 7 * 24 * 60 * 60 * 1000,
                    "30days": 30 * 24 * 60 * 60 * 1000
                };
                
                if (durationMap[duration]) {
                    durationMs = durationMap[duration];
                } else {
                    // Legacy custom duration (format: "Xdays")
                    const customMatch = duration.match(/^(\d+)days$/);
                    if (customMatch) {
                        const days = parseInt(customMatch[1]);
                        if (days >= 1 && days <= 365) {
                            durationMs = days * 24 * 60 * 60 * 1000;
                        }
                    }
                }
            }
            
            if (durationMs) {
                // Additional safety check - ensure we're not dealing with absurdly large numbers
                const maxMs = 365 * 24 * 60 * 60 * 1000; // 365 days in milliseconds
                if (durationMs > maxMs) {
                    return new Response(JSON.stringify({ error: "Maximum ban duration is 365 days" }), { status: 400 });
                }
                
                banExpiration = new Date(Date.now() + durationMs).toISOString();
            } else {
                return new Response(JSON.stringify({ error: "Invalid duration format" }), { status: 400 });
            }
        }

        // 7. Create ban entry
        const ban = {
            id: Date.now().toString(),
            targetUsername: targetUsername.toLowerCase(),
            bannerUsername,
            reason,
            duration: duration || "permanent",
            banExpiration,
            timestamp: new Date().toISOString(),
            active: true
        };

        // 8. Store ban
        await env.USERS_KV.put(`ban:${ban.id}`, JSON.stringify(ban));

        // 9. Add to user's record
        const userBans = await env.USERS_KV.get(`bans:${targetUsername.toLowerCase()}`);
        const bans = userBans ? JSON.parse(userBans) : [];
        bans.push(ban.id);
        await env.USERS_KV.put(`bans:${targetUsername.toLowerCase()}`, JSON.stringify(bans));

        // 10. Update user's banned status
        target.isBanned = true;
        target.banReason = reason;
        target.banExpiration = banExpiration;
        await env.USERS_KV.put(`user:${targetUsername.toLowerCase()}`, JSON.stringify(target));

        // 11. Add to global bans list
        const bansList = await env.USERS_KV.get("bans_list");
        const allBans = bansList ? JSON.parse(bansList) : [];
        allBans.push(ban.id);
        await env.USERS_KV.put("bans_list", JSON.stringify(allBans));

        return new Response(JSON.stringify({ success: true, banId: ban.id }));

    } catch (e) {
        console.error("Ban user error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const { request, env } = context;

    try {
        // 1. Get User from JWT
        const cookieHeader = request.headers.get("Cookie") || "";
        const cookies = Object.fromEntries(cookieHeader.split(';').map(c => [c.split('=')[0].trim(), c.split('=')[1]]));
        const token = cookies['pal_session'];
        if (!token) return new Response("Unauthorized", { status: 401 });

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const unbannerUsername = payload.username.toLowerCase();

        // 2. Get Ban ID from Request
        const { banId, targetUsername } = await request.json();
        if (!banId || !targetUsername) {
            return new Response(JSON.stringify({ error: "Ban ID and target username are required" }), { status: 400 });
        }

        // 3. Check if unbanner has permission
        const unbannerData = await env.USERS_KV.get(`user:${unbannerUsername}`);
        const unbanner = unbannerData ? JSON.parse(unbannerData) : {};
        
        const staffRoles = ["Owner", "Admin", "Manager", "Moderator"];
        if (!staffRoles.includes(unbanner.rank)) {
            return new Response(JSON.stringify({ error: "Only staff can unban users" }), { status: 403 });
        }

        // 4. Get ban data
        const banData = await env.USERS_KV.get(`ban:${banId}`);
        if (!banData) {
            return new Response(JSON.stringify({ error: "Ban not found" }), { status: 404 });
        }

        const ban = JSON.parse(banData);
        if (ban.targetUsername !== targetUsername.toLowerCase()) {
            return new Response(JSON.stringify({ error: "Ban ID does not match target username" }), { status: 400 });
        }

        // 5. Deactivate ban
        ban.active = false;
        ban.unbannerUsername = unbannerUsername;
        ban.unbanTimestamp = new Date().toISOString();
        await env.USERS_KV.put(`ban:${banId}`, JSON.stringify(ban));

        // 6. Update user's banned status
        const userData = await env.USERS_KV.get(`user:${targetUsername.toLowerCase()}`);
        if (userData) {
            const user = JSON.parse(userData);
            user.isBanned = false;
            delete user.banReason;
            delete user.banExpiration;
            await env.USERS_KV.put(`user:${targetUsername.toLowerCase()}`, JSON.stringify(user));
        }

        return new Response(JSON.stringify({ success: true, message: `User ${targetUsername} has been unbanned` }));

    } catch (e) {
        console.error("Unban user error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        // 1. Get User from JWT
        const cookieHeader = request.headers.get("Cookie") || "";
        const cookies = Object.fromEntries(cookieHeader.split(';').map(c => [c.split('=')[0].trim(), c.split('=')[1]]));
        const token = cookies['pal_session'];
        if (!token) return new Response("Unauthorized", { status: 401 });

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const username = payload.username.toLowerCase();

        // 2. Check if user is staff
        const userData = await env.USERS_KV.get(`user:${username}`);
        const user = userData ? JSON.parse(userData) : {};
        
        const staffRoles = ["Owner", "Admin", "Manager", "Moderator"];
        if (!staffRoles.includes(user.rank)) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }

        // 3. Get all bans
        const bansList = await env.USERS_KV.get("bans_list");
        const banIds = bansList ? JSON.parse(bansList) : [];
        
        const bans = [];
        for (const banId of banIds) {
            const banData = await env.USERS_KV.get(`ban:${banId}`);
            if (banData) {
                bans.push(JSON.parse(banData));
            }
        }

        return new Response(JSON.stringify({ bans }));

    } catch (e) {
        console.error("Get bans error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
