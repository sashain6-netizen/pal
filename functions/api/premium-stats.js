import { verifyAndDecodeToken } from './_jwt.js';

export async function onRequestGet(context) {
    const { request, env } = context;

    try {
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

        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const username = payload.username.toLowerCase();

        const userData = await env.USERS_KV.get(`user:${username}`);
        const user = userData ? JSON.parse(userData) : {};

                const staffRoles = ["Owner", "Admin", "Manager", "Moderator"];
        if (!staffRoles.includes(user.rank)) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }

        const premiumData = await env.USERS_KV.get("pal_premium", { cacheTtl: 3600 });
        const premiumUsers = premiumData ? JSON.parse(premiumData) : [];

        return new Response(JSON.stringify({ 
            count: premiumUsers.length,
            users: premiumUsers 
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("Premium stats error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
