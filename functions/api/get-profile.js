import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequestGet(context) {
    const { request, env } = context;
    
    const cookieHeader = request.headers.get("Cookie") || "";
    const token = cookieHeader
        .split('; ')
        .find(row => row.trim().startsWith('pal_session='))
        ?.split('=')[1];

    if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { 
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET); 
        const username = payload.username;

        const rawData = await env.USERS_KV.get(`user:${username}`);
        
        if (!rawData) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const user = JSON.parse(rawData);

        const profileData = {
            username: user.username,
            displayName: user.displayName || "",
            bio: user.bio || "",
            themeColor: user.themeColor || "#2563eb",
            // ADD THIS LINE: Use the user's uploaded avatar OR fallback to the default
            avatar: user.avatarUrl || "/default-avatar.png" 
        };

        return new Response(JSON.stringify(profileData), {
            headers: { 
                "Content-Type": "application/json",
                "Cache-Control": "no-store" // Ensures the UI reflects changes immediately
            }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid Session" }), { 
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }
}