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

    const shopItems = {
        "VIP": { price: 500, label: "👑", name: "VIP Status" },
        "OG": { price: 1000, label: "💀", name: "OG Status" },
        "PRO": { price: 2500, label: "⚡", name: "Pro Skill" },
        "FIRE": { price: 5000, label: "🔥", name: "On Fire" }
    };

    if (request.method === "POST") {
        const { itemId, action } = await request.json(); // Added 'action'
        const item = shopItems[itemId];

        if (!item) return new Response(JSON.stringify({ error: "Invalid Item" }), { status: 400 });

        // --- EQUIP LOGIC ---
        if (action === "equip") {
            if (!user.ownedPrefixes.includes(itemId)) {
                return new Response(JSON.stringify({ error: "You don't own this!" }), { status: 400 });
            }
            user.currentPrefix = itemId;
            await env.USERS_KV.put(userKey, JSON.stringify(user));
            return new Response(JSON.stringify({ success: true, user }));
        }

        // --- PURCHASE LOGIC ---
        if (user.ownedPrefixes.includes(itemId)) return new Response(JSON.stringify({ error: "Already owned" }), { status: 400 });
        if ((user.currency || 0) < item.price) return new Response(JSON.stringify({ error: "Insufficient funds" }), { status: 400 });

        user.currency -= item.price;
        user.ownedPrefixes.push(itemId);
        user.currentPrefix = itemId; 
        
        await env.USERS_KV.put(userKey, JSON.stringify(user));
        return new Response(JSON.stringify({ success: true, user }));
    }

    return new Response(JSON.stringify({ user, shopItems }), {
        headers: { "Content-Type": "application/json" }
    });
}