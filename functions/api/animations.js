import { verifyAndDecodeToken } from "./_jwt.js";

function parseCookiePalSession(cookieHeader) {
  const tokenPart = (cookieHeader || "")
    .split(";")
    .map(s => s.trim())
    .find(row => row.startsWith("pal_session="));
  if (!tokenPart) return null;
  return tokenPart.split("=")[1];
}

function safeParseJson(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function isPremium(premiumUsersRaw, username) {
  const premiumUsers = safeParseJson(premiumUsersRaw, null);
  const uname = String(username || "").toLowerCase();
  if (!uname) return false;
  if (Array.isArray(premiumUsers)) return premiumUsers.map(u => String(u).toLowerCase()).includes(uname);
  if (premiumUsers && typeof premiumUsers === "object") return !!premiumUsers[uname] || !!premiumUsers[username];
  return false;
}

const SHOP = {
  float: { id: "float", name: "Float", price: 0 },
  pulse: { id: "pulse", name: "Pulse", price: 0 },

  wiggle: { id: "wiggle", name: "Wiggle", price: 1500 },
  stretch: { id: "stretch", name: "Stretch", price: 2500 },
  bounce: { id: "bounce", name: "Bounce", price: 5000 },
  swing: { id: "swing", name: "Swing", price: 7500 },
  tilt: { id: "tilt", name: "Tilt", price: 10000 },
  
  blur: { id: "blur", name: "Blur", price: 20000 },
  glitch: { id: "glitch", name: "Glitch", price: 30000 },
  jello: { id: "jello", name: "Jello", price: 40000 },
  ghosting: { id: "ghosting", name: "Ghosting", price: 55000 },

  rainbow: { id: "rainbow", name: "Rainbow", price: 75000 },
  neon: { id: "neon", name: "Neon", price: 90000 },
  earthquake: { id: "earthquake", name: "Earthquake", price: 110000 },
  squeeze: { id: "squeeze", name: "Squeeze", price: 135000 },

  fire: { id: "fire", name: "Fire", price: 200000 },
  gold: { id: "gold", name: "Gold", price: 225000 },
  matrix: { id: "matrix", name: "Matrix", price: 250000 },
  vortex: { id: "vortex", name: "Vortex", price: 275000 },
  godly: { id: "godly", name: "Godly", price: 300000 }
};

const PREMIUM_DEFAULTS = ["none", "float", "pulse"];

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;

  const cookieHeader = request.headers.get("Cookie") || "";
  const token = parseCookiePalSession(cookieHeader);
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

  try {
    const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
    const username = payload.username;
    const uname = String(username || "").toLowerCase();
    if (!uname) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

    const userKey = `user:${uname}`;
    const rawUser = await env.USERS_KV.get(userKey);
    if (!rawUser) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    const user = safeParseJson(rawUser, {});

    const premiumData = await env.USERS_KV.get("pal_premium");
    const premium = isPremium(premiumData, uname);

    const owned = Array.isArray(user.ownedAnimations) ? user.ownedAnimations : [];
    const validAnimations = new Set([...owned, ...PREMIUM_DEFAULTS, "none"]);

    if (animation !== undefined) {
        const anim = String(animation || "none");
        if (!validAnimations.has(anim)) {
            return new Response(JSON.stringify({ error: `Animation '${anim}' not owned.` }), { status: 400 });
        }
        user.postAnimation = anim;
    }

    if (method === "GET") {
      const owned = Array.isArray(user.ownedAnimations) ? user.ownedAnimations : ["none"];
      const current = String(user.postAnimation || "none");
      const caption = String(user.postCaption || "");
      return new Response(JSON.stringify({
        premium,
        ownedAnimations: owned,
        currentAnimation: current,
        postCaption: caption,
        shop: Object.values(SHOP)
      }), { headers: { "Content-Type": "application/json" } });
    }

    if (method === "POST") {
      const body = await request.json();
      const action = body.action;

      // 1. ACTION: SET (Saving selected animation and caption)
      if (action === "set") {
        if (!premium) return new Response(JSON.stringify({ error: "Premium required" }), { status: 403 });

        const caption = body.postCaption;
        const animation = body.postAnimation;

        // Update Caption if provided
        if (caption !== undefined) {
          const captionStr = String(caption || "");
          if (captionStr.length > 100) {
            return new Response(JSON.stringify({ error: "Caption max is 100 characters." }), { status: 400 });
          }
          user.postCaption = captionStr;
        }

        // Update Animation if provided
        if (animation !== undefined) {
          const anim = String(animation || "none").toLowerCase();
          
          // Combine everything the user is ALLOWED to use
          const owned = Array.isArray(user.ownedAnimations) ? user.ownedAnimations : [];
          const validSet = new Set([...owned, ...PREMIUM_DEFAULTS, "none"]);

          if (!validSet.has(anim)) {
            return new Response(JSON.stringify({ error: `Animation '${anim}' not owned.` }), { status: 400 });
          }
          user.postAnimation = anim;
        }

        await env.USERS_KV.put(userKey, JSON.stringify(user));
        return new Response(JSON.stringify({ success: true }));
      }

      // 2. ACTION: PURCHASE (Buying from the shop)
      if (action === "purchase") {
        if (!premium) return new Response(JSON.stringify({ error: "Premium required" }), { status: 403 });
        
        const itemId = String(body.itemId || "").toLowerCase();
        const item = SHOP[itemId];
        
        if (!item) return new Response(JSON.stringify({ error: "Invalid item" }), { status: 400 });
        
        // Check if already owned or free
        const owned = Array.isArray(user.ownedAnimations) ? user.ownedAnimations : ["none"];
        if (owned.includes(itemId) || PREMIUM_DEFAULTS.includes(itemId)) {
            return new Response(JSON.stringify({ error: "Already owned" }), { status: 400 });
        }

        const balance = Number(user.currency || 0);
        if (balance < item.price) {
            return new Response(JSON.stringify({ error: "Insufficient funds" }), { status: 400 });
        }

        // Deduct money and add to owned list
        user.currency = balance - item.price;
        user.ownedAnimations = [...owned, itemId];
        
        await env.USERS_KV.put(userKey, JSON.stringify(user));
        return new Response(JSON.stringify({ 
            success: true, 
            currency: user.currency, 
            ownedAnimations: user.ownedAnimations 
        }));
      }

      return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

