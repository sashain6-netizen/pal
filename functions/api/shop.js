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
    // --- COMMON (500 - 2,000) ---
    "VIP":      { price: 500,   label: "👑", name: "VIP" },
    "STAR":     { price: 600,   label: "⭐", name: "Rising Star" },
    "CHERRY":   { price: 700,   label: "🍒", name: "Sweet" },
    "LEAF":     { price: 800,   label: "🍃", name: "Nature Child" },
    "CLOVER":   { price: 900,   label: "🍀", name: "Lucky" },
    "COOL":     { price: 1000,  label: "😎", name: "Cool Cat" },
    "PIZZA":    { price: 1100,  label: "🍕", name: "Party Time" },
    "HEART":    { price: 1200,  label: "💖", name: "Lovely" },
    "GHOST":    { price: 1500,  label: "👻", name: "Specter" },
    "ALIEN":    { price: 1800,  label: "👽", name: "Visitor" },
    "MOON":     { price: 2000,  label: "🌙", name: "Night Owl" },

    // --- ELITE (2,500 - 9,500) ---
    "PRO":      { price: 2500,  label: "⚡", name: "Pro Skill" },
    "ROCKET":   { price: 3000,  label: "🚀", name: "Fast Lane" },
    "MONEY":    { price: 3500,  label: "💸", name: "Big Spender" },
    "OG":       { price: 4000,  label: "💀", name: "Original" },
    "WIZARD":   { price: 4500,  label: "🧙", name: "Arcane" },
    "SHIELD":   { price: 5000,  label: "🛡️", name: "Guardian" },
    "ICE":      { price: 6000,  label: "🧊", name: "Cold Blooded" },
    "SNAKE":    { price: 7000,  label: "🐍", name: "Serpent" },
    "NINJA":    { price: 8000,  label: "🥷", name: "Shadow Walker" },
    "TIGER":    { price: 9500,  label: "🐅", name: "Predator" },

    // --- LEGENDARY (10,000 - 35,000) ---
    "DEMON":    { price: 12000, label: "👹", name: "Demon Mode" },
    "CRYSTAL":  { price: 14000, label: "🔮", name: "Oracle" },
    "ROBOT":    { price: 16000, label: "🤖", name: "Automaton" },
    "GALAXY":   { price: 18000, label: "🌌", name: "Space Traveler" },
    "PEARL":    { price: 20000, label: "🐚", name: "Abyssal" },
    "WOLF":     { price: 22000, label: "🐺", name: "Lone Wolf" },
    "DRAGON":   { price: 25000, label: "🐉", name: "Dragon Lord" },
    "CROWN_V":  { price: 30000, label: "💎👑", name: "Royal Blood" },
    "KNIGHT":   { price: 35000, label: "⚔️🛡️", name: "Champion" },

    // --- MYTHIC (40,000 - 95,000) ---
    "PHOENIX":  { price: 45000, label: "🔥🐦🔥", name: "Eternal Phoenix" },
    "STORM":    { price: 50000, label: "⛈️⚡⛈️", name: "Tempest" },
    "VOID":     { price: 60000, label: "🌑🌀", name: "The Void" },
    "SAMURAI":  { price: 70000, label: "👺🗡️", name: "Ronin" },
    "AURORA":   { price: 80000, label: "🌈✨", name: "Northern Light" },
    "AURA":     { price: 85000, label: "✨💎✨", name: "Diamond Aura" },
    "REAPER":   { price: 95000, label: "⚖️💀⌛", name: "Soul Taker" },

    // --- EXOTIC (100,000 - 250,000) ---
    "GOD":      { price: 150000,label: "🌌🔱🌌", name: "God Emperor" },
    "SOLAR":    { price: 175000,label: "☀️🔥☀️", name: "Solar Deity" },
    "NEBULA":   { price: 200000,label: "🔮💫🌌", name: "Nebula Walker" },
    "CHRONO":   { price: 250000,label: "⏳🕰️🌀", name: "Time Master" },

    // --- THE DIVINE TIER (300,000 - 500,000) ---
    "UNIVERSE": { price: 300000,label: "⭐🪐☄️", name: "Universalist" },
    "ANGELIC":  { price: 350000,label: "🪽🔱🪽", name: "Seraphim" },
    "ETERNAL":  { price: 400000,label: "♾️💎♾️", name: "Absolute" },
    "PAL_GOD":  { price: 500000,label: "💠👑💠", name: "Pal Creator" }
};

    if (request.method === "POST") {
        const { itemId, action } = await request.json();
        const item = shopItems[itemId];

        if (!item) return new Response(JSON.stringify({ error: "Invalid Item" }), { status: 400 });

        // --- EQUIP LOGIC ---
        if (action === "equip") {
            if (!user.ownedPrefixes.includes(itemId)) {
                return new Response(JSON.stringify({ error: "You don't own this!" }), { status: 400 });
            }
            
            // SAVE THE EMOJI LABEL, NOT THE ID
            user.currentPrefix = item.label; 
            
            await env.USERS_KV.put(userKey, JSON.stringify(user));
            return new Response(JSON.stringify({ success: true, user }));
        }

        // --- PURCHASE LOGIC ---
        if (user.ownedPrefixes.includes(itemId)) return new Response(JSON.stringify({ error: "Already owned" }), { status: 400 });
        if ((user.currency || 0) < item.price) return new Response(JSON.stringify({ error: "Insufficient funds" }), { status: 400 });

        user.currency -= item.price;
        user.ownedPrefixes.push(itemId);
        
        // SAVE THE EMOJI LABEL HERE TOO
        user.currentPrefix = item.label; 
        
        await env.USERS_KV.put(userKey, JSON.stringify(user));
        return new Response(JSON.stringify({ success: true, user }));
    }

    return new Response(JSON.stringify({ user, shopItems }), {
        headers: { "Content-Type": "application/json" }
    });
}