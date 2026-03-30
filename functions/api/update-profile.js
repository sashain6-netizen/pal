import { verifyAndDecodeToken } from "./_jwt.js";
import { getValidAccessoryKeys, grantEarnedAccessories, isAccessoryOwned } from "./_accessories.js";

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
        const unlockResult = grantEarnedAccessories(user);
        user.ownedAccessories = unlockResult.ownedAccessories;

        const bioStr = String(updates.bio || "");
        if (bioStr.length > bioMaxLen) {
            return new Response(JSON.stringify({ error: `Bio exceeds ${bioMaxLen} characters` }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        let avatarUrl = user.avatarUrl || "/default-avatar.png";

        if (typeof updates.avatarUrl !== 'undefined') {
            const urlStr = String(updates.avatarUrl).trim();

            if (!urlStr) {
                avatarUrl = "/default-avatar.png";
            } else {
                try {
                    const url = new URL(urlStr);

                    if (!['http:', 'https:'].includes(url.protocol)) {
                        return new Response(JSON.stringify({ error: "Invalid URL protocol." }), {
                            status: 400,
                            headers: { "Content-Type": "application/json" }
                        });
                    }

                    try {
                        const imageResponse = await fetch(urlStr, {
                            method: 'HEAD', 
                            headers: { 'User-Agent': 'Pal-Profile-Validator/1.0' },
                            redirect: 'follow'
                        });

                        if (!imageResponse.ok) {
                            throw new Error("Link unreachable");
                        }

                        const contentType = imageResponse.headers.get('content-type') || '';
                        
                        if (!contentType.startsWith('image/')) {
                            return new Response(JSON.stringify({ error: "URL does not point to a valid image." }), {
                                status: 400,
                                headers: { "Content-Type": "application/json" }
                            });
                        }

                        avatarUrl = urlStr;

                    } catch (fetchError) {
                        return new Response(JSON.stringify({ error: "Could not verify image URL. Ensure the link is public." }), {
                            status: 400,
                            headers: { "Content-Type": "application/json" }
                        });
                    }

                } catch (urlError) {
                    return new Response(JSON.stringify({ error: "Invalid URL format" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }
            }
        }

        const updatedUser = {
            ...user,
            avatarUrl: avatarUrl,

            displayName: (updates.displayName || "").trim().substring(0, 16),

                        bio: bioStr,
            themeColor: updates.themeColor || "#2563eb"
        };

        if (updates.accessories && typeof updates.accessories === 'object') {
            const validCategories = ['hats', 'glasses', 'mouths', 'face_accessories'];
            const validAccessoryKeys = getValidAccessoryKeys();

            const validatedAccessories = {};

            for (const [category, accessoryKey] of Object.entries(updates.accessories)) {
                if (!validCategories.includes(category)) {
                    return new Response(JSON.stringify({ error: `Invalid accessory category: ${category}` }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                if (!validAccessoryKeys[category].includes(accessoryKey)) {
                    return new Response(JSON.stringify({ error: `Invalid accessory key "${accessoryKey}" for category "${category}"` }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                if (!isAccessoryOwned(user.ownedAccessories, category, accessoryKey)) {
                    return new Response(JSON.stringify({ error: `You have not unlocked "${accessoryKey}" in ${category} yet.` }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                validatedAccessories[category] = accessoryKey;
            }

            updatedUser.accessories = validatedAccessories;
        }

        await env.USERS_KV.put(kvKey, JSON.stringify(updatedUser));

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response("Error: " + err.message, { status: 500 });
    }
}
