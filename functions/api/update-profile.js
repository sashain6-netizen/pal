import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequestPost(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie") || "";
    const token = cookieHeader.split('; ').find(row => row.trim().startsWith('pal_session='))?.split('=')[1];

    if (!token) return new Response("Unauthorized", { status: 401 });

    try {
        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET, env);
        const username = payload.username;

        const baseBioMaxLen = 200;
        const premiumBioMaxLen = baseBioMaxLen * 5;
        const premiumData = await env.USERS_KV.get("pal_premium", { cacheTtl: 3600 });
        let isPremium = false;
        if (premiumData) {
            try {
                const premiumUsers = JSON.parse(premiumData);
                const uname = String(username || "").toLowerCase();
                if (Array.isArray(premiumUsers)) {
                    isPremium = premiumUsers.map(u => String(u).toLowerCase()).includes(uname);
                } else if (premiumUsers && typeof premiumUsers === "object") {
                    isPremium = !!premiumUsers[uname];
                }
            } catch {}
        }
        const bioMaxLen = isPremium ? premiumBioMaxLen : baseBioMaxLen;

        const kvKey = `user:${username}`;

        const updates = await request.json();

        const rawData = await env.USERS_KV.get(kvKey, { cacheTtl: 1800 });

        const user = rawData ? JSON.parse(rawData) : {
            username: username,
            xp: 0,
            rank: "Member",
            currency: 0
        };

        const bioStr = String(updates.bio || "");
        if (bioStr.length > bioMaxLen) {
            return new Response(JSON.stringify({ error: `Bio exceeds ${bioMaxLen} characters` }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        let avatarUrl = user.avatarUrl || "/default-avatar.png";
        
        // Handle avatar URL updates for premium users
        if (updates.avatarUrl && isPremium) {
            const urlStr = String(updates.avatarUrl).trim();
            
            // Validate URL format
            try {
                const url = new URL(urlStr);
                
                // Only allow HTTP/HTTPS protocols
                if (!['http:', 'https:'].includes(url.protocol)) {
                    return new Response(JSON.stringify({ error: "Invalid URL protocol. Only HTTP and HTTPS are allowed." }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                
                // Basic file extension check for common image formats
                const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
                const hasImageExtension = imageExtensions.some(ext => 
                    url.pathname.toLowerCase().endsWith(ext)
                );
                
                if (!hasImageExtension && !url.hostname.includes('imgur.com') && !url.hostname.includes('discord.com') && !url.hostname.includes('cdn.discordapp.com')) {
                    return new Response(JSON.stringify({ error: "URL must point to a valid image file (jpg, png, gif, webp, bmp, svg)" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                
                avatarUrl = urlStr;
                
            } catch (urlError) {
                return new Response(JSON.stringify({ error: "Invalid URL format" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }
        } else if (updates.avatarUrl && !isPremium) {
            return new Response(JSON.stringify({ error: "Premium membership required to set custom profile picture" }), {
                status: 403,
                headers: { "Content-Type": "application/json" }
            });
        }

        const updatedUser = {
            ...user,
            avatarUrl: avatarUrl,

            displayName: (updates.displayName || "").trim().substring(0, 16),

                        bio: bioStr,
            themeColor: updates.themeColor || "#2563eb"
        };

        await env.USERS_KV.put(kvKey, JSON.stringify(updatedUser));

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response("Error: " + err.message, { status: 500 });
    }
}
