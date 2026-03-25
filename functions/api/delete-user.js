import { verifyAndDecodeToken } from './_jwt.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const cookieHeader = request.headers.get("Cookie") || "";
        const cookies = Object.fromEntries(cookieHeader.split(';').map(c => [c.split('=')[0].trim(), c.split('=')[1]]));
        const token = cookies['pal_session'];
        if (!token) return new Response("Unauthorized", { status: 401 });

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET, env);
        const deleterUsername = payload.username.toLowerCase();

        const { targetUsername } = await request.json();
        if (!targetUsername) {
            return new Response(JSON.stringify({ error: "Target username is required" }), { status: 400 });
        }

        const deleterData = await env.USERS_KV.get(`user:${deleterUsername}`);
        const deleter = deleterData ? JSON.parse(deleterData) : {};

                if (deleter.rank !== "Owner") {
            return new Response(JSON.stringify({ error: "Only owners can delete users" }), { status: 403 });
        }

        const targetData = await env.USERS_KV.get(`user:${targetUsername.toLowerCase()}`);
        if (!targetData) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const target = JSON.parse(targetData);

        if (target.rank === "Owner") {
            return new Response(JSON.stringify({ error: "Cannot delete another owner" }), { status: 403 });
        }

        await env.USERS_KV.delete(`user:${targetUsername.toLowerCase()}`);

        const premiumData = await env.USERS_KV.get("pal_premium");
        if (premiumData) {
            const premiumList = JSON.parse(premiumData);
            if (Array.isArray(premiumList)) {
                const index = premiumList.indexOf(targetUsername);
                if (index > -1) {
                    premiumList.splice(index, 1);
                    await env.USERS_KV.put("pal_premium", JSON.stringify(premiumList));
                }
            } else if (premiumList[targetUsername]) {
                delete premiumList[targetUsername];
                await env.USERS_KV.put("pal_premium", JSON.stringify(premiumList));
            }
        }

        await env.DB.prepare("DELETE FROM thread_posts WHERE creator_username = ?").bind(targetUsername.toLowerCase()).run();
        await env.DB.prepare("DELETE FROM threads WHERE creator_username = ?").bind(targetUsername.toLowerCase()).run();

        const allUsers = await env.USERS_KV.list({ prefix: "user:" });
        for (const { key } of allUsers.keys) {
            const userData = await env.USERS_KV.get(key);
            if (userData) {
                const user = JSON.parse(userData);
                let updated = false;

                if (user.following && user.following.includes(targetUsername)) {
                    user.following = user.following.filter(u => u !== targetUsername);
                    updated = true;
                }

                if (user.followers && typeof user.followers === 'number' && user.followers > 0) {
                    user.followers -= 1;
                    updated = true;
                }

                                if (updated) {
                    await env.USERS_KV.put(key, JSON.stringify(user));
                }
            }
        }

        const userBans = await env.USERS_KV.get(`bans:${targetUsername.toLowerCase()}`);
        if (userBans) {
            const bans = JSON.parse(userBans);
            for (const banId of bans) {
                await env.USERS_KV.delete(`ban:${banId}`);
            }
            await env.USERS_KV.delete(`bans:${targetUsername.toLowerCase()}`);
        }

        const reportsList = await env.USERS_KV.get("reports_list");
        if (reportsList) {
            const reports = JSON.parse(reportsList);
            const reportsToDelete = [];

                        for (const reportId of reports) {
                const reportData = await env.USERS_KV.get(`report:${reportId}`);
                if (reportData) {
                    const report = JSON.parse(reportData);
                    if (report.reporterUsername === targetUsername.toLowerCase()) {
                        reportsToDelete.push(reportId);
                        await env.USERS_KV.delete(`report:${reportId}`);
                    }
                }
            }

                        if (reportsToDelete.length > 0) {
                const updatedReports = reports.filter(id => !reportsToDelete.includes(id));
                await env.USERS_KV.put("reports_list", JSON.stringify(updatedReports));
            }
        }

        const allUsersIndex = await env.USERS_KV.get("all_users_index");
        if (allUsersIndex) {
            const index = JSON.parse(allUsersIndex);
            const updatedIndex = index.filter(username => username !== targetUsername.toLowerCase());
            await env.USERS_KV.put("all_users_index", JSON.stringify(updatedIndex));
        }

        return new Response(JSON.stringify({ success: true, message: `User ${targetUsername} has been deleted` }));

    } catch (e) {
        console.error("Delete user error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
