export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const username = url.searchParams.get("username");

    if (!username) return new Response("Missing username", { status: 400 });

    const rawData = await env.USERS_KV.get(`user:${username}`);
    if (!rawData) return new Response("User not found", { status: 404 });

    const user = JSON.parse(rawData);

    // IMPORTANT: Only return public info. Never send email, hash, or salt!
    const publicData = {
        username: user.username,
        displayName: user.displayName || user.username,
        bio: user.bio || "",
        avatar: user.avatarUrl || "/default-avatar.png",
        themeColor: user.themeColor || "#2563eb",
        rank: user.rank || "Member",
        xp: user.xp || 0,
        currency: user.currency || 0,
        followersCount: user.followers || 0,
        followingCount: Array.isArray(user.following) ? user.following.length : 0
    };

    return new Response(JSON.stringify(publicData), {
        headers: { "Content-Type": "application/json" }
    });
}