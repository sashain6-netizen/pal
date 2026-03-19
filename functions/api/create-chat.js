import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequestPost(context) {
    const { request, env } = context;

    const cookie = request.headers.get("Cookie") || "";
    const token = cookie.split('pal_session=')[1]?.split(';')[0];
    
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    try {
        const creatorData = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const myUsername = creatorData.username.toLowerCase();
        
        // Use 'invitedUsers' (the array from your new frontend)
        const { roomName, invitedUsers } = await request.json();

        const roomNameStr = String(roomName || "");
        const baseMaxLen = 1000;
        const premiumMaxLen = baseMaxLen * 5;

        const premiumData = await env.USERS_KV.get("pal_premium");
        let isPremium = false;
        if (premiumData) {
            try {
                const premiumUsers = JSON.parse(premiumData);
                const uname = String(myUsername || "").toLowerCase();
                if (Array.isArray(premiumUsers)) {
                    isPremium = premiumUsers.map(u => String(u).toLowerCase()).includes(uname);
                } else if (premiumUsers && typeof premiumUsers === "object") {
                    isPremium = !!premiumUsers[uname];
                }
            } catch {}
        }

        const maxLen = isPremium ? premiumMaxLen : baseMaxLen;
        if (roomNameStr.trim() && roomNameStr.trim().length > maxLen) {
            return new Response(JSON.stringify({ error: `Max ${maxLen} characters for private chat room name.` }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 1. Create the Room
        const roomResult = await env.DB.prepare(
            "INSERT INTO chat_rooms (room_name, creator_username) VALUES (?, ?)"
        ).bind(roomNameStr.trim() || "New Chat", myUsername).run();

        const roomId = roomResult.meta.last_row_id;

        // 2. Prepare the batch of participants
        // We use a Set to make sure we don't accidentally add the same person twice
        const participants = new Set([myUsername]);
        if (Array.isArray(invitedUsers)) {
            invitedUsers.forEach(u => participants.add(u.toLowerCase().trim()));
        }

        // 3. Create a Batch of inserts for chat_members
        const stmt = env.DB.prepare("INSERT INTO chat_members (room_id, username) VALUES (?, ?)");
        const batch = Array.from(participants).map(user => stmt.bind(roomId, user));

        // Execute all inserts at once for better performance
        await env.DB.batch(batch);

        return new Response(JSON.stringify({ success: true, roomId }));

    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: "Failed to create chat" }), { status: 500 });
    }
}