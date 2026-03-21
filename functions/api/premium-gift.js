import { verifyAndDecodeToken } from "./_jwt.js";

function parseCookiePalSession(cookieHeader) {
  const tokenPart = (cookieHeader || "")
    .split(";")
    .map(s => s.trim())
    .find(row => row.startsWith("pal_session="));
  return tokenPart ? tokenPart.split("=")[1] : null;
}

function isPremiumUser(premiumUsersRaw, username) {
  if (!premiumUsersRaw) return false;
  try {
    const premiumUsers = JSON.parse(premiumUsersRaw);
    const uname = (username || "").toLowerCase();
    if (!uname) return false;

    if (Array.isArray(premiumUsers)) {
      return premiumUsers.map(u => String(u).toLowerCase()).includes(uname);
    }
    if (typeof premiumUsers === "object") {
      return !!premiumUsers[uname] || !!premiumUsers[username];
    }
  } catch {
    return false;
  }
  return false;
}

function toNonNegInt(n) {
  const v = typeof n === "string" ? Number(n) : n;
  if (!Number.isFinite(v)) return null;
  const i = Math.floor(v);
  return i < 0 ? null : i;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const cookieHeader = request.headers.get("Cookie") || "";
  const token = parseCookiePalSession(cookieHeader);
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401, headers: { "Content-Type": "application/json" } 
    });
  }

  try {
    const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
    const senderUsername = payload.username;
    if (!senderUsername) throw new Error("Invalid token payload");

    const body = await request.json();
    const recipientUsername = String(body.recipientUsername || "").trim().toLowerCase();
    const xpVal = toNonNegInt(body.xpAmount) ?? 0;
    const currencyVal = toNonNegInt(body.currencyAmount) ?? 0;

    if (!recipientUsername) {
      return new Response(JSON.stringify({ error: "Recipient required" }), { status: 400 });
    }

    if (senderUsername.toLowerCase() === recipientUsername) {
      return new Response(JSON.stringify({ error: "You cannot gift yourself" }), { status: 400 });
    }

    if (xpVal === 0 && currencyVal === 0) {
      return new Response(JSON.stringify({ error: "Amount must be greater than 0" }), { status: 400 });
    }

    const premiumData = await env.USERS_KV.get("pal_premium", { cacheTtl: 3600 });
    if (!isPremiumUser(premiumData, senderUsername)) {
      return new Response(JSON.stringify({ error: "Premium status required to gift" }), { status: 403 });
    }

    const result = await env.DB.batch([

      env.DB.prepare(`
        UPDATE users 
        SET currency = currency - ?, xp = xp - ? 
        WHERE LOWER(username) = LOWER(?) AND currency >= ? AND xp >= ?
      `).bind(currencyVal, xpVal, senderUsername, currencyVal, xpVal),

      env.DB.prepare(`
        UPDATE users 
        SET currency = currency + ?, xp = xp + ? 
        WHERE LOWER(username) = ?
      `).bind(currencyVal, xpVal, recipientUsername),

      env.DB.prepare(`SELECT currency, xp FROM users WHERE LOWER(username) = ?`)
        .bind(recipientUsername)
    ]);

    if (result[0].meta.rows_written === 0) {
      return new Response(JSON.stringify({ error: "Insufficient funds or sender not found" }), { status: 400 });
    }

    if (result[1].meta.rows_written === 0) {

      return new Response(JSON.stringify({ error: "Recipient not found" }), { status: 404 });
    }

    const updatedRecipient = result[2].results[0];

    return new Response(JSON.stringify({
      success: true,
      recipientUsername,
      recipientCurrency: updatedRecipient.currency,
      recipientXp: updatedRecipient.xp
    }), { headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
}