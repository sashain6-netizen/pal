import { verifyAndDecodeToken } from './_jwt.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // 1. Get User from JWT
        const cookieHeader = request.headers.get("Cookie") || "";
        const cookies = Object.fromEntries(cookieHeader.split(';').map(c => [c.split('=')[0].trim(), c.split('=')[1]]));
        const token = cookies['pal_session'];
        if (!token) return new Response("Unauthorized", { status: 401 });

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET, env);
        const bannerUsername = payload.username.toLowerCase();

        // 2. Get Ban Data from Request
        const { targetUsername, reason, duration } = await request.json();
        if (!targetUsername || !reason) {
            return new Response(JSON.stringify({ error: "Target username and reason are required" }), { status: 400 });
        }

        // 3. Check if banner has permission (staff only)
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
        const rankHierarchy = {
            "Owner": 3, "Admin": 2, "Manager": 2, "Moderator": 1, "Staff": 0,
            "Legend": -1, "Elite": -2, "Veteran": -3, "Contributor": -4,
            "Supporter": -5, "Active Member": -6, "Member": -7
        };

        if (banner.rank === "Owner" && target.rank === "Owner") {
            return new Response(JSON.stringify({ error: "Cannot ban another Owner" }), { status: 403 });
        }

        if (banner.rank !== "Owner" && rankHierarchy[target.rank] >= rankHierarchy[banner.rank]) {
            return new Response(JSON.stringify({ error: "Cannot ban users with equal or higher rank" }), { status: 403 });
        }

        // 6. Calculate ban expiration
        let banExpiration = null;

        // Moderators cannot issue permanent bans
        if (banner.rank === "Moderator" && (!duration || duration === "permanent")) {
            return new Response(JSON.stringify({ error: "Moderators cannot issue permanent bans" }), { status: 403 });
        }

        if (duration && duration !== "permanent") {
            let durationMs;

            const secondsMatch = duration.match(/^(\d+)seconds$/);
            if (secondsMatch) {
                const seconds = parseInt(secondsMatch[1]);
                if (seconds <= 0) {
                    return new Response(JSON.stringify({ error: "Duration must be greater than 0" }), { status: 400 });
                }
                durationMs = seconds * 1000;
            } else {
                const durationMap = {
                    "1hour":   1  * 60 * 60 * 1000,
                    "24hours": 24 * 60 * 60 * 1000,
                    "7days":   7  * 24 * 60 * 60 * 1000,
                    "30days":  30 * 24 * 60 * 60 * 1000
                };

                if (durationMap[duration]) {
                    durationMs = durationMap[duration];
                } else {
                    const customMatch = duration.match(/^(\d+)days$/);
                    if (customMatch) {
                        const days = parseInt(customMatch[1]);
                        if (days >= 1 && days <= 365) {
                            durationMs = days * 24 * 60 * 60 * 1000;
                        }
                    }
                }
            }

            if (!durationMs) {
                return new Response(JSON.stringify({ error: "Invalid duration format" }), { status: 400 });
            }

            const oneDayMs = 24  * 60 * 60 * 1000;
            const maxMs    = 365 * 24 * 60 * 60 * 1000;

            if (banner.rank === "Moderator" && durationMs > oneDayMs) {
                return new Response(JSON.stringify({ error: "Moderators can only ban users for up to 1 day" }), { status: 403 });
            }

            if (durationMs > maxMs) {
                return new Response(JSON.stringify({ error: "Maximum ban duration is 365 days" }), { status: 400 });
            }

            banExpiration = new Date(Date.now() + durationMs).toISOString();
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

        // 9. Add to user's ban records
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
        // 1. Efficient Cookie Parsing & Auth
        const cookieHeader = request.headers.get("Cookie") || "";
        const cookies = Object.fromEntries(cookieHeader.split(';').map(c => {
            const [key, ...v] = c.trim().split('=');
            return [key, v.join('=')];
        }));
        
        const token = cookies['pal_session'];
        if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET, env);
        const unbannerUsername = payload.username.toLowerCase();

        // 2. Validation
        const { banId, targetUsername } = await request.json();
        if (!targetUsername) {
            return new Response(JSON.stringify({ error: "Target username is required" }), { status: 400 });
        }
        const targetKey = targetUsername.toLowerCase();

        // 3. Permission & Rank Check
        const unbannerData = await env.USERS_KV.get(`user:${unbannerUsername}`);
        if (!unbannerData) return new Response(JSON.stringify({ error: "Staff profile not found" }), { status: 403 });
        
        const unbanner = JSON.parse(unbannerData);
        const staffRoles = ["Owner", "Admin", "Manager", "Moderator"];
        if (!staffRoles.includes(unbanner.rank)) {
            return new Response(JSON.stringify({ error: "Insufficient permissions" }), { status: 403 });
        }

        // 4. Fetch Ban Data (Optional for Admins, Required for Moderators)
        // We use a fall-through logic so Admins can unban even if the log is lost.
        const banDataStr = banId ? await env.USERS_KV.get(`ban:${banId}`) : null;
        const banData = banDataStr ? JSON.parse(banDataStr) : null;

        // 5. Hierarchy & Moderator Restriction Logic
        if (unbanner.rank === "Moderator") {
            if (!banData) {
                return new Response(JSON.stringify({ 
                    error: "Ban log missing. Moderators cannot force-unban without a record." 
                }), { status: 403 });
            }

            const oneDayMs = 24 * 60 * 60 * 1000;
            const banDate = new Date(banData.timestamp).getTime();
            const expiryDate = banData.banExpiration ? new Date(banData.banExpiration).getTime() : null;

            if (!expiryDate || (expiryDate - banDate) > (oneDayMs + 5000)) { // 5s grace for processing
                return new Response(JSON.stringify({ 
                    error: "Moderators cannot lift permanent or long-term bans." 
                }), { status: 403 });
            }
        }

        // 6. PRIMARY ACTION: Restore User Account (The "Source of Truth")
        const targetUserData = await env.USERS_KV.get(`user:${targetKey}`);
        if (targetUserData) {
            const targetUser = JSON.parse(targetUserData);
            targetUser.isBanned = false;
            // Clean up ban metadata
            delete targetUser.banReason;
            delete targetUser.banExpiration;
            delete targetUser.banDate;
            // Audit Log: Track who did it
            targetUser.lastUnbannedBy = unbannerUsername;
            targetUser.lastUnbannedAt = new Date().toISOString();
            
            await env.USERS_KV.put(`user:${targetKey}`, JSON.stringify(targetUser));
        }

        // 7. BACKGROUND CLEANUP: Prevent "Ghost Data"
        // We wrap these in a separate block to ensure the user is unbanned even if cleanup lags.
        const cleanupTasks = [];

        // Task A: Delete specific ban record
        if (banId) cleanupTasks.push(env.USERS_KV.delete(`ban:${banId}`));

        // Task B: Update Global List
        cleanupTasks.push((async () => {
            const listStr = await env.USERS_KV.get("bans_list");
            if (listStr) {
                const list = JSON.parse(listStr);
                const filtered = list.filter(id => id !== banId);
                await env.USERS_KV.put("bans_list", JSON.stringify(filtered));
            }
        })());

        // Task C: Update User's Ban History
        cleanupTasks.push((async () => {
            const histStr = await env.USERS_KV.get(`bans:${targetKey}`);
            if (histStr) {
                const hist = JSON.parse(histStr);
                const filtered = hist.filter(id => id !== banId);
                if (filtered.length === 0) {
                    await env.USERS_KV.delete(`bans:${targetKey}`);
                } else {
                    await env.USERS_KV.put(`bans:${targetKey}`, JSON.stringify(filtered));
                }
            }
        })());

        // Fire and forget cleanup or wait for all
        await Promise.all(cleanupTasks);

        return new Response(JSON.stringify({ 
            success: true, 
            message: `User ${targetUsername} successfully unbanned.` 
        }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        console.error("Critical Unban Error:", e);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
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

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET, env);
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
            if (banData) bans.push(JSON.parse(banData));
        }

        return new Response(JSON.stringify({ bans }));

    } catch (e) {
        console.error("Get bans error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}