export async function onRequestPost(context) {
    const { request, env } = context;
    const { targetId, from, text, type } = await request.json();

    const userKey = `user:${targetId.toLowerCase()}`;
    const rawData = await env.USERS_KV.get(userKey);
    if (!rawData) return new Response("User not found", { status: 404 });

    let user = JSON.parse(rawData);
    if (!user.notifications) user.notifications = [];

    // Add the new notification with a unique ID
    // Add senderId to the unshift block in your Cloudflare Worker
    user.notifications.unshift({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        from: from,
        fromId: targetId,
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