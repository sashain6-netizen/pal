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
        const deleterUsername = payload.username.toLowerCase();

        // 2. Get Target Username from Request
        const { targetUsername } = await request.json();
        if (!targetUsername) {
            return new Response(JSON.stringify({ error: "Target username is required" }), { status: 400 });
        }

        // 3. Check if deleter is owner
        const deleterData = await env.USERS_KV.get(`user:${deleterUsername}`);
        const deleter = deleterData ? JSON.parse(deleterData) : {};
        
        if (deleter.rank !== "Owner") {
            return new Response(JSON.stringify({ error: "Only owners can delete users" }), { status: 403 });
        }

        // 4. Check if target user exists
        const targetData = await env.USERS_KV.get(`user:${targetUsername.toLowerCase()}`);
        if (!targetData) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const target = JSON.parse(targetData);

        // 5. Prevent deleting other owners
        if (target.rank === "Owner") {
            return new Response(JSON.stringify({ error: "Cannot delete another owner" }), { status: 403 });
        }

        // 6. Delete user data from KV
        await env.USERS_KV.delete(`user:${targetUsername.toLowerCase()}`);

        // 7. Remove from premium list if applicable
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

        // 8. Delete user's threads and posts
        await env.DB.prepare("DELETE FROM thread_posts WHERE creator_username = ?").bind(targetUsername.toLowerCase()).run();
        await env.DB.prepare("DELETE FROM threads WHERE creator_username = ?").bind(targetUsername.toLowerCase()).run();

        // 9. Remove from other users' following lists
        const allUsers = await env.USERS_KV.list({ prefix: "user:" });
        for (const { key } of allUsers.keys) {
            const userData = await env.USERS_KV.get(key);
            if (userData) {
                const user = JSON.parse(userData);
                if (user.following && user.following.includes(targetUsername)) {
                    user.following = user.following.filter(u => u !== targetUsername);
                    await env.USERS_KV.put(key, JSON.stringify(user));
                }
            }
        }

        return new Response(JSON.stringify({ success: true, message: `User ${targetUsername} has been deleted` }));

    } catch (e) {
        console.error("Delete user error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
