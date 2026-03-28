import { verifyAndDecodeToken } from "./_jwt.js";

function parseCookiePalSession(cookieHeader) {
  const tokenPart = (cookieHeader || "").split(";").map(s => s.trim()).find(row => row.startsWith("pal_session="));
  return tokenPart ? tokenPart.split("=")[1] : null;
}

function isPremiumUser(premiumUsersRaw, username) {
  if (!premiumUsersRaw) return false;
  try {
    const premiumUsers = JSON.parse(premiumUsersRaw);
    const uname = (username || "").toLowerCase();
    if (Array.isArray(premiumUsers)) return premiumUsers.map(u => String(u).toLowerCase()).includes(uname);
    if (typeof premiumUsers === "object") return !!premiumUsers[uname] || !!premiumUsers[username.toLowerCase()];
  } catch { return false; }
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
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  try {
    const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
    const senderUsername = (payload.username || "").toLowerCase();
    if (!senderUsername) return new Response(JSON.stringify({ error: "Invalid Token" }), { status: 401 });

    const body = await request.json();
    const recipientUsername = String(body.recipientUsername || "").trim().toLowerCase();
    const xpVal = toNonNegInt(body.xpAmount) ?? 0;
    const currencyVal = toNonNegInt(body.currencyAmount) ?? 0;

    if (!recipientUsername || senderUsername === recipientUsername) {
      return new Response(JSON.stringify({ error: "Invalid recipient" }), { status: 400 });
    }
    if (xpVal === 0 && currencyVal === 0) {
      return new Response(JSON.stringify({ error: "No zero-value gifts" }), { status: 400 });
    }

    const senderCooldownKey = `cooldown:send:${senderUsername}`;
    if (await env.USERS_KV.get(senderCooldownKey)) {
      return new Response(JSON.stringify({ error: "Sender cooldown: Wait 10s" }), { status: 429 });
    }

    const dbResult = await env.DB.prepare(`
      INSERT INTO gift_locks (recipient, last_received)
      VALUES (?, CURRENT_TIMESTAMP)
      ON CONFLICT(recipient) DO UPDATE SET last_received = CURRENT_TIMESTAMP
      WHERE (strftime('%s', 'now') - strftime('%s', last_received)) > 30
    `).bind(recipientUsername).run();

    if (dbResult.meta.changes === 0) {
      return new Response(JSON.stringify({ error: "Recipient busy: Try again in 30s" }), { status: 429 });
    }

    const premiumData = await env.USERS_KV.get("pal_premium", { cacheTtl: 3600 });
    if (!isPremiumUser(premiumData, senderUsername)) {
      return new Response(JSON.stringify({ error: "Premium status required" }), { status: 403 });
    }

    const senderKey = `user:${senderUsername}`;
    const recipientKey = `user:${recipientUsername}`;
    const [rawSender, rawRecipient] = await Promise.all([
      env.USERS_KV.get(senderKey),
      env.USERS_KV.get(recipientKey)
    ]);

    if (!rawSender || !rawRecipient) {
      return new Response(JSON.stringify({ error: "User data not found" }), { status: 404 });
    }

    const sender = JSON.parse(rawSender);
    const recipient = JSON.parse(rawRecipient);

    if (currencyVal > (sender.currency || 0) || xpVal > (sender.xp || 0)) {
      return new Response(JSON.stringify({ error: "Insufficient funds" }), { status: 400 });
    }

    sender.currency = (sender.currency || 0) - currencyVal;
    sender.xp = (sender.xp || 0) - xpVal;
    recipient.currency = (recipient.currency || 0) + currencyVal;
    recipient.xp = (recipient.xp || 0) + xpVal;

    await Promise.all([
      env.USERS_KV.put(senderKey, JSON.stringify(sender)),
      env.USERS_KV.put(recipientKey, JSON.stringify(recipient)),
      env.USERS_KV.put(senderCooldownKey, "true", { expirationTtl: 60 })
    ]);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully gifted ${recipientUsername}!`
    }), { headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Server Error", details: err.message }), { status: 500 });
  }
}
