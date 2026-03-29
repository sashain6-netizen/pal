import { verifyAndDecodeToken } from "./_jwt.js";
import { ACCESSORY_CATALOG, grantEarnedAccessories, isAccessoryOwned } from "./_accessories.js";

export async function onRequestPost(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie") || "";
    const token = cookieHeader.split('; ').find(row => row.trim().startsWith('pal_session='))?.split('=')[1];

    if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET, env);
        const username = payload.username;
        const userKey = `user:${username}`;
        const rawUser = await env.USERS_KV.get(userKey);

        if (!rawUser) {
            return new Response(JSON.stringify({ error: "User not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        const user = JSON.parse(rawUser);
        const unlockResult = grantEarnedAccessories(user);
        user.ownedAccessories = unlockResult.ownedAccessories;

        const { category, accessoryKey } = await request.json();
        const item = ACCESSORY_CATALOG?.[category]?.[accessoryKey];

        if (!item) {
            return new Response(JSON.stringify({ error: "Invalid accessory" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (isAccessoryOwned(user.ownedAccessories, category, accessoryKey)) {
            return new Response(JSON.stringify({
                error: "Accessory already owned",
                ownedAccessories: user.ownedAccessories,
                currency: user.currency || 0
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (!item.price || item.price <= 0) {
            return new Response(JSON.stringify({ error: "This accessory is earned automatically and cannot be purchased." }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        if ((user.currency || 0) < item.price) {
            return new Response(JSON.stringify({
                error: "Insufficient funds",
                currency: user.currency || 0,
                price: item.price
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        user.currency = (user.currency || 0) - item.price;
        user.ownedAccessories[category] = [...new Set([...(user.ownedAccessories[category] || []), accessoryKey])];

        await env.USERS_KV.put(userKey, JSON.stringify(user));

        return new Response(JSON.stringify({
            success: true,
            currency: user.currency,
            ownedAccessories: user.ownedAccessories,
            purchased: { category, accessoryKey }
        }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message || "Failed to purchase accessory" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
