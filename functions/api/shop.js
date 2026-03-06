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
    // --- COMMON (500 - 1,500) ---
        "VIP":    { price: 500,   label: "👑", name: "VIP" },
        "STAR":   { price: 800,   label: "⭐", name: "Rising Star" },
        "COOL":   { price: 1200,  label: "😎", name: "Cool Cat" },
        "GHOST":  { price: 1500,  label: "👻", name: "Specter" },

        // --- ELITE (2,500 - 8,000) ---
        "PRO":    { price: 2500,  label: "⚡", name: "Pro Skill" },
        "OG":     { price: 4000,  label: "💀", name: "Original" },
        "ICE":    { price: 6000,  label: "🧊", name: "Cold Blooded" },
        "NINJA":  { price: 8000,  label: "🥷", name: "Shadow Walker" },

        // --- LEGENDARY (10,000 - 25,000) ---
        "DEMON":  { price: 12000, label: "👹", name: "Demon Mode" },
        "GALAXY": { price: 18000, label: "🌌", name: "Space Traveler" },
        "DRAGON": { price: 25000, label: "🐉", name: "Dragon Lord" },

        // --- MYTHIC / SUPER RARE (40,000 - 100,000+) ---
        "PHOENIX":{ price: 45000, label: "🔥🐦🔥", name: "Eternal Phoenix" },
        "VOID":   { price: 60000, label: "🌑🌀", name: "The Void" },
        "AURA":   { price: 85000, label: "✨💎✨", name: "Diamond Aura" },
        "GOD":    { price: 150000,label: "🌌🔱🌌", name: "God Emperor" }
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