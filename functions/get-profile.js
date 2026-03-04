// /functions/api/get-profile.js
import { verifyAndDecodeToken } from "./_jwt.js"; // Ensure this matches your JWT helper name

export async function onRequestGet(context) {
    const { request, env } = context;
    
    // 1. Extract the token from the Cookie header
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
        // 2. Verify JWT and get username
        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET); 
        const username = payload.username;

        // 3. Fetch user data from KV
        const rawData = await env.USERS_KV.get(username);
        
        if (!rawData) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const user = JSON.parse(rawData);

        // 4. Return the data (excluding sensitive info like passwords)
        const profileData = {
            username: user.username,
            displayName: user.displayName || "",
            bio: user.bio || "",
            themeColor: user.themeColor || "#2563eb"
        };

        return new Response(JSON.stringify(profileData), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid Session" }), { 
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }
}