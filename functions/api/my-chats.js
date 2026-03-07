export async function onRequestGet(context) {
    const { request, env } = context;
    
    const cookie = request.headers.get("Cookie") || "";
    const session = cookie.split('pal_session=')[1]?.split(';')[0];
    if (!session) return new Response("Unauthorized", { status: 401 });

    const user = JSON.parse(await env.USERS_KV.get(`session:${session}`));

    // Join chat_members and chat_rooms to find where this user belongs
    const { results } = await env.DB.prepare(`
        SELECT r.id, r.room_name, r.creator_username, r.created_at 
        FROM chat_rooms r
        JOIN chat_members m ON r.id = m.room_id
        WHERE m.username = ?
        ORDER BY r.created_at DESC
    `).bind(user.username).all();

    return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
    });
}