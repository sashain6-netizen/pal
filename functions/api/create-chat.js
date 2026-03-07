export async function onRequestPost(context) {
    const { request, env } = context;

    const cookie = request.headers.get("Cookie") || "";
    const session = cookie.split('pal_session=')[1]?.split(';')[0];
    if (!session) return new Response("Unauthorized", { status: 401 });

    try {
        const creatorData = JSON.parse(await env.USERS_KV.get(`session:${session}`));
        const { roomName, invitedUser } = await request.json();

        // 1. Create the Room
        const info = await env.DB.prepare(
            "INSERT INTO chat_rooms (room_name, creator_username) VALUES (?, ?)"
        ).bind(roomName || "New Chat", creatorData.username).run();

        const roomId = info.meta.last_row_id;

        // 2. Add the Creator to the room members
        await env.DB.prepare(
            "INSERT INTO chat_members (room_id, username) VALUES (?, ?)"
        ).bind(roomId, creatorData.username).run();

        // 3. Add the Invited User to the room members
        if (invitedUser) {
            await env.DB.prepare(
                "INSERT INTO chat_members (room_id, username) VALUES (?, ?)"
            ).bind(roomId, invitedUser.toLowerCase().trim()).run();
        }

        return new Response(JSON.stringify({ success: true, roomId }));

    } catch (e) {
        return new Response("Could not create chat", { status: 500 });
    }
}