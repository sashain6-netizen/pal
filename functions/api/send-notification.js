export async function onRequestPost(context) {
    const { request, env } = context;
    // 1. Add 'fromId' to the destructuring here
    const { targetId, from, fromId, text, type } = await request.json();

    const userKey = `user:${targetId.toLowerCase()}`;
    const rawData = await env.USERS_KV.get(userKey);
    if (!rawData) return new Response("User not found", { status: 404 });

    let user = JSON.parse(rawData);
    if (!user.notifications) user.notifications = [];

    user.notifications.unshift({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        from: from,
        // 2. Change this from targetId to fromId
        fromId: fromId, 
        text: text,
        type: type || "message",
        date: new Date().toISOString()
    });

    user.notifications = user.notifications.slice(0, 20);
    await env.USERS_KV.put(userKey, JSON.stringify(user));

    return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
    });
}