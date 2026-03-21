import { verifyAndDecodeToken } from "./_jwt.js";

function parseCookiePalSession(cookieHeader) {
  // Cookie header looks like: "pal_session=...; other=..."
  const tokenPart = (cookieHeader || "")
    .split(";")
    .map(s => s.trim())
    .find(row => row.startsWith("pal_session="));
  if (!tokenPart) return null;
  return tokenPart.split("=")[1];
}

function isPremiumUser(premiumUsersRaw, username) {
  if (!premiumUsersRaw) return false;
  let premiumUsers;
  try {
    premiumUsers = JSON.parse(premiumUsersRaw);
  } catch {
    return false;
  }

  const uname = (username || "").toLowerCase();
  if (!uname) return false;

  if (Array.isArray(premiumUsers)) {
    return premiumUsers.map(u => String(u).toLowerCase()).includes(uname);
  }

  // In case it's stored as an object/map
  if (premiumUsers && typeof premiumUsers === "object") {
    // { [username]: true }
    return !!premiumUsers[uname] || !!premiumUsers[username];
  }

  return false;
}

function normalizeHexColor(hex) {
  if (typeof hex !== "string") return null;
  const v = hex.trim();
  if (!/^#([0-9a-fA-F]{3}){1,2}$/.test(v)) return null;
  return v;
}

function normalizeGlowAlpha(glowAlpha) {
  // Accept either 0..1 (float) or 0..100 (slider percent)
  const n = typeof glowAlpha === "string" ? Number(glowAlpha) : glowAlpha;
  if (!Number.isFinite(n)) return null;
  if (n >= 0 && n <= 1) return Math.max(0, Math.min(1, n));
  if (n >= 0 && n <= 100) return Math.max(0, Math.min(1, n / 100));
  return null;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const cookieHeader = request.headers.get("Cookie") || "";
  const token = parseCookiePalSession(cookieHeader);

  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
    const username = payload.username;
    if (!username) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const premiumData = await env.USERS_KV.get("pal_premium", { cacheTtl: 3600 });
    if (!isPremiumUser(premiumData, username)) {
      return new Response(JSON.stringify({ error: "Premium required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    const updates = await request.json();
    const forumColor = normalizeHexColor(updates.forumColor);
    const glowAlpha = normalizeGlowAlpha(updates.glowAlpha);

    if (!forumColor && glowAlpha === null) {
      return new Response(JSON.stringify({ error: "Provide forumColor and/or glowAlpha" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const userKey = `user:${username}`;
    const rawUser = await env.USERS_KV.get(userKey, { cacheTtl: 1800 });
    if (!rawUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const user = JSON.parse(rawUser);
    const nextUser = {
      ...user,
      forumColor: forumColor || user.forumColor || "#2563eb",
      premiumGlowAlpha: glowAlpha === null ? (user.premiumGlowAlpha ?? 0.8) : glowAlpha
    };

    await env.USERS_KV.put(userKey, JSON.stringify(nextUser));

    return new Response(JSON.stringify({ success: true, forumColor: nextUser.forumColor, premiumGlowAlpha: nextUser.premiumGlowAlpha }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

