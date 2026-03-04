import { verifyAndDecodeToken } from "./_jwt.js"; 

export async function onRequestPost(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie") || "";
    const token = cookieHeader.split('; ').find(row => row.trim().startsWith('pal_session='))?.split('=')[1];

    if (!token) return new Response("Unauthorized", { status: 401 });

    try {
    const payload = await verifyAndDecodeToken(token, env.JWT_SECRET); 
    const username = payload.username;

    const updates = await request.json();

    // 1. Get old data
    const rawData = await env.USERS_KV.get(username);
    // FALLBACK: If rawData is null, start with a basic object
    const user = rawData ? JSON.parse(rawData) : { username: username }; 

    // 2. Update fields with safety fallbacks (|| "") 
    // This prevents .substring() from crashing if the field is missing
    const updatedUser = {
        ...user,
        avatarUrl: user.avatarUrl || "/default-avatar.png",
        displayName: (updates.displayName || "").substring(0, 50),
        bio: (updates.bio || "").substring(0, 160),
        themeColor: updates.themeColor || "#2563eb"
    };

    // 3. Save back to KV
    await env.USERS_KV.put(username, JSON.stringify(updatedUser));

    return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
    });
} catch (err) {
    return new Response("Error: " + err.message, { status: 500 });
}
}