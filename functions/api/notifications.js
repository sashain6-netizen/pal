export async function onRequest(context) {
    const { request, env } = context;
    const cookie = request.headers.get("Cookie") || "";
    const tokenPart = cookie.split("pal_session=")[1];

    if (!tokenPart) return new Response(JSON.stringify([]), { status: 401 });

    try {
        const token = tokenPart.split(";")[0];
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userKey = `user:${payload.username.toLowerCase()}`;
        
        const rawData = await env.USERS_KV.get(userKey);
        if (!rawData) return new Response(JSON.stringify([]), { status: 404 });

        let user = JSON.parse(rawData);

        // Handle POST (Delete or Clear All)
        if (request.method === "POST") {
            const { notifId, clearAll } = await request.json();

            if (clearAll === true) {
                user.notifications = [];
            } else if (notifId !== undefined) {
                user.notifications = (user.notifications || []).filter(n => 
                    String(n.id) !== String(notifId)
                );
            }

            await env.USERS_KV.put(userKey, JSON.stringify(user));
            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Handle GET (Fetch)
        return new Response(JSON.stringify(user.notifications || []), {
            headers: { "Content-Type": "application/json" }
        });
        
    } catch (e) {
        // Return the error message so you can see what went wrong in the toast
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}