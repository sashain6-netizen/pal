export async function onRequestPost(context) {
    const { request, env } = context;
    const { targetId } = await request.json();

    const cookie = request.headers.get("Cookie") || "";
    const tokenPart = cookie.split("pal_session=")[1];
    if (!tokenPart) return new Response("Unauthorized", { status: 401 });

        const myPayload = JSON.parse(atob(tokenPart.split(".")[1]));
    const myId = myPayload.username.toLowerCase();
    const targetIdLower = targetId.toLowerCase();

    if (myId === targetIdLower) return new Response("Cannot follow yourself", { status: 400 });

    const [meRaw, themRaw] = await Promise.all([
        env.USERS_KV.get(`user:${myId}`),
        env.USERS_KV.get(`user:${targetIdLower}`)
    ]);

    if (!meRaw || !themRaw) return new Response("User not found", { status: 404 });

    let me = JSON.parse(meRaw);
    let them = JSON.parse(themRaw);

    if (!me.following) me.following = [];
    if (!them.notifications) them.notifications = [];

    const isAlreadyFollowing = me.following.includes(targetIdLower);

    if (isAlreadyFollowing) {
        // --- UNFOLLOW ---
        me.following = me.following.filter(id => id !== targetIdLower);
        them.followers = Math.max(0, (them.followers || 0) - 1);
    } else {
        // --- FOLLOW ---
        me.following.push(targetIdLower);
        them.followers = (them.followers || 0) + 1;

        them.notifications.unshift({
            id: Date.now().toString(),
            type: "follow",
            from: me.displayName || me.username,
            fromId: myId, 
            text: "started following you!",
            date: new Date().toISOString()
        });
    }

    await Promise.all([
        env.USERS_KV.put(`user:${myId}`, JSON.stringify(me)),
        env.USERS_KV.put(`user:${targetIdLower}`, JSON.stringify(them))
    ]);

    return new Response(JSON.stringify({ 
        success: true, 
        following: !isAlreadyFollowing,
        newCount: them.followers 
    }), {
        headers: { "Content-Type": "application/json" }
    });
}