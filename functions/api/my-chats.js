export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        // 1. Extract Session
        const cookie = request.headers.get("Cookie") || "";
        const session = cookie.split('pal_session=')[1]?.split(';')[0];
        
        if (!session) {
            return new Response(JSON.stringify({ error: "Not logged in" }), { 
                status: 401, 
                headers: { "Content-Type": "application/json" } 
            });
        }

        // 2. Get User from KV
        const userData = await env.USERS_KV.get(`session:${session}`);
        if (!userData) {
            return new Response(JSON.stringify({ error: "Session expired" }), { 
                status: 401, 
                headers: { "Content-Type": "application/json" } 
            });
        }
        
        const user = JSON.parse(userData);

        // 3. Query D1
        // We use a JOIN to only show rooms where the user is a member
        const { results } = await env.DB.prepare(`
            SELECT r.id, r.room_name, r.creator_username, r.created_at 
            FROM chat_rooms r
            JOIN chat_members m ON r.id = m.room_id
            WHERE m.username = ?
            ORDER BY r.created_at DESC
        `).bind(user.username.toLowerCase()).all();

        return new Response(JSON.stringify(results || []), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        // This will tell you EXACTLY what happened in the Network tab
        return new Response(JSON.stringify({ error: e.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}