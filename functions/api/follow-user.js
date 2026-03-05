export async function onRequestPost(context) {
    const { request, env } = context;
    const { targetId } = await request.json();

    // 1. Get My ID from Cookie/Session
    const cookie = request.headers.get("Cookie") || "";
    const tokenPart = cookie.split("pal_session=")[1];
    if (!tokenPart) return new Response("Unauthorized", { status: 401 });
    const myPayload = JSON.parse(atob(tokenPart.split(".")[1]));
    const myId = myPayload.username.toLowerCase();

    // 2. Update MY "Following" list
    const meRaw = await env.USERS_KV.get(`user:${myId}`);
    let me = JSON.parse(meRaw);
    if (!me.following) me.following = [];
    
    if (me.following.includes(targetId)) {
        return new Response("Already following", { status: 400 });
    }
    
    me.following.push(targetId);
    await env.USERS_KV.put(`user:${myId}`, JSON.stringify(me));

    // 3. Update THEIR "Followers" count & Notifications
    const themRaw = await env.USERS_KV.get(`user:${targetId.toLowerCase()}`);
    let them = JSON.parse(themRaw);
    
    them.followers = (them.followers || 0) + 1; // INCREMENT
    
    if (!them.notifications) them.notifications = [];
    them.notifications.unshift({
        id: Date.now().toString(),
        type: "follow",
        from: me.displayName || myId,
        text: "started following you!",
        date: new Date().toISOString()
    });

    await env.USERS_KV.put(`user:${targetId.toLowerCase()}`, JSON.stringify(them));

    return new Response(JSON.stringify({ success: true, newCount: them.followers }));
}