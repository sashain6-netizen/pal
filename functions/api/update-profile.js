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
        if (typeof updates.avatarUrl !== 'undefined' && isPremium) {
            const urlStr = String(updates.avatarUrl).trim();
            
            // If empty string, revert to default avatar
            if (!urlStr) {
                avatarUrl = "/default-avatar.png";
            } else {
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
                    
                    // Enhanced PNG validation - fetch and check content
                    try {
                        const imageResponse = await fetch(urlStr, { 
                            method: 'HEAD',
                            headers: { 'User-Agent': 'Pal-Profile-Validator/1.0' }
                        });
                        
                        if (!imageResponse.ok) {
                            return new Response(JSON.stringify({ error: "Unable to access the image URL. Please check if the URL is valid and accessible." }), {
                                status: 400,
                                headers: { "Content-Type": "application/json" }
                            });
                        }
                        
                        const contentType = imageResponse.headers.get('content-type') || '';
                        if (!contentType.startsWith('image/')) {
                            return new Response(JSON.stringify({ error: "URL does not point to a valid image file." }), {
                                status: 400,
                                headers: { "Content-Type": "application/json" }
                            });
                        }
                        
                        // For PNG files, do additional validation
                        if (urlStr.toLowerCase().includes('.png') || contentType === 'image/png') {
                            // Fetch first few bytes to verify PNG signature
                            const pngResponse = await fetch(urlStr, { 
                                method: 'GET',
                                headers: { 'Range': 'bytes=0-8', 'User-Agent': 'Pal-Profile-Validator/1.0' }
                            });
                            
                            if (pngResponse.ok) {
                                const buffer = await pngResponse.arrayBuffer();
                                const bytes = new Uint8Array(buffer);
                                
                                // PNG signature: 89 50 4E 47 0D 0A 1A 0A
                                const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
                                const isValidPng = bytes.length >= 8 && 
                                    pngSignature.every((byte, index) => bytes[index] === byte);
                                
                                if (!isValidPng) {
                                    return new Response(JSON.stringify({ error: "The file is not a valid PNG image. Please use a genuine PNG file." }), {
                                        status: 400,
                                        headers: { "Content-Type": "application/json" }
                                    });
                                }
                            }
                        }
                        
                    } catch (fetchError) {
                        return new Response(JSON.stringify({ error: "Failed to validate the image URL. Please ensure it's accessible and a valid image." }), {
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
            }
        } else if (typeof updates.avatarUrl !== 'undefined' && !isPremium) {
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
