import { verifyAndDecodeToken } from './_jwt.js';

export async function onRequest(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(cookieHeader.split(';').map(c => [c.split('=')[0].trim(), c.split('=')[1]]));
    const token = cookies['pal_session'];

    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    
    const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
    const userKey = `user:${payload.username}`;
    let user = JSON.parse(await env.USERS_KV.get(userKey));

    // --- INITIALIZE MISSING FIELDS ---
    let changed = false;
    if (user.currentPrefix === undefined) { user.currentPrefix = ""; changed = true; }
    if (!user.ownedPrefixes) { user.ownedPrefixes = []; changed = true; }
    if (changed) await env.USERS_KV.put(userKey, JSON.stringify(user));

    const shopItems = {
        "VIP": { price: 500, label: "👑 VIP" },
        "OG": { price: 1000, label: "💀 OG" },
        "PRO": { price: 2500, label: "⚡ PRO" }
    };

    // HANDLE PURCHASE (POST)
    if (request.method === "POST") {
        const { itemId } = await request.json();
        const item = shopItems[itemId];

        if (!item) return new Response(JSON.stringify({ error: "Invalid Item" }), { status: 400 });
        if (user.ownedPrefixes.includes(itemId)) return new Response(JSON.stringify({ error: "Already owned" }), { status: 400 });
        if ((user.currency || 0) < item.price) return new Response(JSON.stringify({ error: "Too poor!" }), { status: 400 });

        user.currency -= item.price;
        user.ownedPrefixes.push(itemId);
        user.currentPrefix = itemId; // Auto-equip on buy
        
        await env.USERS_KV.put(userKey, JSON.stringify(user));
        return new Response(JSON.stringify({ success: true, user }));
    }

    // HANDLE DATA FETCH (GET)
    return new Response(JSON.stringify({ user, shopItems }), {
        headers: { "Content-Type": "application/json" }
    });
}