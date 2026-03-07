import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequestPost(context) {
    const { request, env } = context;

    const cookie = request.headers.get("Cookie") || "";
    const token = cookie.split('pal_session=')[1]?.split(';')[0];
    
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    try {
        const creatorData = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const { roomName, invitedUser } = await request.json();

        // 1. Create the Room
        const info = await env.DB.prepare(
            "INSERT INTO chat_rooms (room_name, creator_username) VALUES (?, ?)"
        ).bind(roomName || "New Chat", creatorData.username).run();

        const roomId = info.meta.last_row_id;

        // 2. Add the Creator to the room
        await env.DB.prepare(
            "INSERT INTO chat_members (room_id, username) VALUES (?, ?)"
        ).bind(roomId, creatorData.username).run();

        // 3. Add the Invited User (if provided)
        if (invitedUser) {
            const cleanInvited = invitedUser.toLowerCase().trim();
            await env.DB.prepare(
                "INSERT INTO chat_members (room_id, username) VALUES (?, ?)"
            ).bind(roomId, cleanInvited).run();
        }

        return new Response(JSON.stringify({ success: true, roomId }));

    } catch (e) {
        return new Response(JSON.stringify({ error: "Failed to create chat" }), { status: 500 });
    }
}