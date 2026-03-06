export async function onRequestPost(context) {
    const { request, env } = context;
    const { targetId, from, text, type } = await request.json();

    const userKey = `user:${targetId.toLowerCase()}`;
    const rawData = await env.USERS_KV.get(userKey);
    if (!rawData) return new Response("User not found", { status: 404 });

    let user = JSON.parse(rawData);
    if (!user.notifications) user.notifications = [];

    // Add the new notification with a unique ID
    user.notifications.unshift({
        id: Date.now().toString(), // Unique ID for deleting
        from: from,
        text: text,
        type: type || "message",
        date: new Date().toISOString()
    });

    // Keep only the last 20 notifications so KV doesn't get too huge
    user.notifications = user.notifications.slice(0, 20);

    await env.USERS_KV.put(userKey, JSON.stringify(user));

    return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
    });
}