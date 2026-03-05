export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    // CHANGE THIS: from .get("username") to .get("id")
    const username = url.searchParams.get("id"); 

    if (!username) return new Response("Missing ID", { status: 400 });

    const rawData = await env.USERS_KV.get(`user:${username.toLowerCase()}`);
    if (!rawData) return new Response("User not found", { status: 404 });

    const user = JSON.parse(rawData);

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