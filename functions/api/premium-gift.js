import { verifyAndDecodeToken } from "./_jwt.js";

function parseCookiePalSession(cookieHeader) {
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

  if (premiumUsers && typeof premiumUsers === "object") {
    return !!premiumUsers[uname] || !!premiumUsers[username];
  }

  return false;
}

function toNonNegInt(n) {
  const v = typeof n === "string" ? Number(n) : n;
  if (!Number.isFinite(v)) return null;
  const i = Math.floor(v);
  if (i < 0) return null;
  return i;
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
    const senderUsername = payload.username;
    if (!senderUsername) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const body = await request.json();
    const recipientUsernameRaw = body.recipientUsername;
    const xpToGift = toNonNegInt(body.xpAmount);
    const currencyToGift = toNonNegInt(body.currencyAmount);

    const recipientUsername = String(recipientUsernameRaw || "").trim().toLowerCase();
    if (!recipientUsername) {
      return new Response(JSON.stringify({ error: "Recipient username required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if ((xpToGift ?? 0) === 0 && (currencyToGift ?? 0) === 0) {
      return new Response(JSON.stringify({ error: "Provide xpAmount and/or currencyAmount (> 0)" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const xpVal = xpToGift ?? 0;
    const currencyVal = currencyToGift ?? 0;

    // Basic anti-abuse caps (adjust if you want).
    if (currencyVal > 100000 || xpVal > 1000000) {
      return new Response(JSON.stringify({ error: "Gift amounts too large" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const premiumData = await env.USERS_KV.get("pal_premium", { cacheTtl: 3600 });
    if (!isPremiumUser(premiumData, senderUsername)) {
      return new Response(JSON.stringify({ error: "Premium required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    const senderKey = `user:${senderUsername}`;
    const recipientKey = `user:${recipientUsername}`;

    const [rawSender, rawRecipient] = await Promise.all([
      env.USERS_KV.get(senderKey, { cacheTtl: 1800 }),
      env.USERS_KV.get(recipientKey, { cacheTtl: 1800 })
    ]);

    if (!rawSender) {
      return new Response(JSON.stringify({ error: "Sender not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!rawRecipient) {
      return new Response(JSON.stringify({ error: "Recipient not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const senderUser = JSON.parse(rawSender);
    const recipientUser = JSON.parse(rawRecipient);

    const senderCurrency = Number(senderUser.currency || 0);
    const senderXp = Number(senderUser.xp || 0);

    if (currencyVal > senderCurrency || xpVal > senderXp) {
      return new Response(JSON.stringify({ error: "Insufficient funds to gift" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    senderUser.currency = senderCurrency - currencyVal;
    senderUser.xp = senderXp - xpVal;

    recipientUser.currency = Number(recipientUser.currency || 0) + currencyVal;
    recipientUser.xp = Number(recipientUser.xp || 0) + xpVal;

    await Promise.all([
      env.USERS_KV.put(senderKey, JSON.stringify(senderUser)),
      env.USERS_KV.put(recipientKey, JSON.stringify(recipientUser))
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        recipientUsername,
        recipientCurrency: recipientUser.currency,
        recipientXp: recipientUser.xp
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

