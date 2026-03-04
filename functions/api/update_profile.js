// You'll need a way to parse the JWT you made earlier
import { parseToken } from "./_jwt.js"; // You'll need to add a parse function to your _jwt.js

export async function onRequestPost(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie") || "";
    const token = cookieHeader.split('; ').find(row => row.trim().startsWith('pal_session='))?.split('=')[1];

    if (!token) return new Response("Unauthorized", { status: 401 });

    try {
        // 1. Get username from JWT
        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET); 
        const username = payload.username;

        const updates = await request.json();

        // 2. Get old data
        const rawData = await env.USERS_KV.get(username);
        const user = JSON.parse(rawData);

        // 3. Update fields
        const updatedUser = {
            ...user,
            displayName: updates.displayName.substring(0, 50),
            bio: updates.bio.substring(0, 160),
            themeColor: updates.themeColor
        };

        await env.USERS_KV.put(username, JSON.stringify(updatedUser));

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response("Invalid Session", { status: 401 });
    }
}