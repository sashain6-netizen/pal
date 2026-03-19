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
  // TIER 1: STARTER (0 - 5k)
  none: { id: "none", name: "None", price: 0 },
  float: { id: "float", name: "Float", price: 0 },
  pulse: { id: "pulse", name: "Pulse", price: 0 },
  wiggle: { id: "wiggle", name: "Wiggle", price: 1500 },
  stretch: { id: "stretch", name: "Stretch", price: 3000 },
  bounce: { id: "bounce", name: "Bounce", price: 5000 },

  // TIER 2: ADVANCED (7k - 25k)
  tilt: { id: "tilt", name: "Tilt", price: 7500 },
  shimmer: { id: "shimmer", name: "Shimmer", price: 12000 },
  blur: { id: "blur", name: "Haze", price: 18000 },
  scanner: { id: "scanner", name: "Scanner", price: 25000 },

  // TIER 3: ELITE (35k - 75k)
  glitch: { id: "glitch", name: "Glitch", price: 35000 },
  jello: { id: "jello", name: "Jello", price: 45000 },
  ghosting: { id: "ghosting", name: "Ghosting", price: 60000 },
  neon: { id: "neon", name: "Neon", price: 75000 },

  // TIER 4: LEGENDARY (90k - 175k)
  rainbow: { id: "rainbow", name: "Rainbow", price: 90000 },
  earthquake: { id: "earthquake", name: "Earthquake", price: 115000 },
  vortex: { id: "vortex", name: "Vortex", price: 140000 },
  plasma: { id: "plasma", name: "Plasma", price: 175000 },

  // TIER 5: MYTHIC (200k - 300k)
  gold: { id: "gold", name: "Gold", price: 220000 },
  matrix: { id: "matrix", name: "Matrix", price: 260000 },
  godly: { id: "godly", name: "Godly", price: 300000 }
};

const PREMIUM_DEFAULTS = ["none", "float", "pulse"];

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;

  const cookieHeader = request.headers.get("Cookie") || "";
  const token = parseCookiePalSession(cookieHeader);
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  try {
    const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
    const uname = String(payload.username || "").toLowerCase();
    if (!uname) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const userKey = `user:${uname}`;
    const rawUser = await env.USERS_KV.get(userKey);
    if (!rawUser) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    const user = safeParseJson(rawUser, {});

    const premiumData = await env.USERS_KV.get("pal_premium");
    const premium = isPremium(premiumData, uname);

    // --- GET METHOD ---
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

    // --- POST METHOD ---
    if (method === "POST") {
      const body = await request.json();
      const action = body.action;

      if (action === "set") {
        if (!premium) return new Response(JSON.stringify({ error: "Premium required" }), { status: 403 });

        // Update Caption
        if (body.postCaption !== undefined) {
          const captionStr = String(body.postCaption || "");
          if (captionStr.length > 100) return new Response(JSON.stringify({ error: "Caption too long" }), { status: 400 });
          user.postCaption = captionStr;
        }

        // Update Animation
        if (body.postAnimation !== undefined) {
          const anim = String(body.postAnimation || "none").toLowerCase();
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

      if (action === "purchase") {
        if (!premium) return new Response(JSON.stringify({ error: "Premium required" }), { status: 403 });
        
        const itemId = String(body.itemId || "").toLowerCase();
        const item = SHOP[itemId];
        if (!item) return new Response(JSON.stringify({ error: "Invalid item" }), { status: 400 });
        
        const owned = Array.isArray(user.ownedAnimations) ? user.ownedAnimations : ["none"];
        if (owned.includes(itemId)) return new Response(JSON.stringify({ error: "Already owned" }), { status: 400 });

        const balance = Number(user.currency || 0);
        if (balance < item.price) return new Response(JSON.stringify({ error: "Insufficient funds" }), { status: 400 });

        user.currency = balance - item.price;
        user.ownedAnimations = [...owned, itemId];
        
        await env.USERS_KV.put(userKey, JSON.stringify(user));
        return new Response(JSON.stringify({ success: true, currency: user.currency }));
      }

      return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), { status: 500 });
  }
}