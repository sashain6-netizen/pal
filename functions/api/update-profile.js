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

        if (typeof updates.avatarUrl !== 'undefined') {
            const urlStr = String(updates.avatarUrl).trim();

            if (!urlStr) {
                avatarUrl = "/default-avatar.png";
            } else {
                try {
                    const url = new URL(urlStr);

                    if (!['http:', 'https:'].includes(url.protocol)) {
                        return new Response(JSON.stringify({ error: "Invalid URL protocol. Only HTTP and HTTPS are allowed." }), {
                            status: 400,
                            headers: { "Content-Type": "application/json" }
                        });
                    }

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

                        if (urlStr.toLowerCase().includes('.png') || contentType === 'image/png') {
                            const pngResponse = await fetch(urlStr, {
                                method: 'GET',
                                headers: { 'Range': 'bytes=0-8', 'User-Agent': 'Pal-Profile-Validator/1.0' }
                            });

                            if (pngResponse.ok) {
                                const buffer = await pngResponse.arrayBuffer();
                                const bytes = new Uint8Array(buffer);

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
        }

        const updatedUser = {
            ...user,
            avatarUrl: avatarUrl,

            displayName: (updates.displayName || "").trim().substring(0, 16),

                        bio: bioStr,
            themeColor: updates.themeColor || "#2563eb"
        };

        if (updates.accessories && typeof updates.accessories === 'object') {
            const validCategories = ['hats', 'glasses', 'mouths', 'face_accessories', 'backgrounds'];
            const validAccessoryKeys = {
                hats: ['none', 'cap', 'top_hat', 'wizard_hat', 'crown', 'beanie', 'pirate_hat'],
                glasses: ['none', 'sunglasses', 'regular_glasses', 'monocle', 'heart_glasses', 'star_glasses'],
                mouths: ['none', 'smile', 'big_smile', 'laugh', 'frown', 'surprised', 'tongue_out'],
                face_accessories: ['none', 'mustache', 'beard', 'blush', 'freckles', 'eye_patch', 'mask'],
                backgrounds: ['none', 'sparkles', 'hearts', 'stars']
            };

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
