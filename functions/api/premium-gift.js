import { verifyAndDecodeToken } from "./_jwt.js";

// --- Helpers (No changes here) ---
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

  try {
    const cookieHeader = request.headers.get("Cookie") || "";
    const token = parseCookiePalSession(cookieHeader);
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized: No Token" }), { status: 401 });

    const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
    const senderUsername = (payload.username || "").toLowerCase();
    
    const body = await request.json();
    const recipientUsername = String(body.recipientUsername || "").trim().toLowerCase();
    const xpVal = toNonNegInt(body.xpAmount) ?? 0;
    const currencyVal = toNonNegInt(body.currencyAmount) ?? 0;

    // 1. Guards
    if (!recipientUsername || senderUsername === recipientUsername) {
      return new Response(JSON.stringify({ error: "Invalid recipient" }), { status: 400 });
    }

    // 2. Sender Cooldown (KV)
    const senderCooldownKey = `cooldown:send:${senderUsername}`;
    const senderLock = await env.USERS_KV.get(senderCooldownKey);
    if (senderLock) return new Response(JSON.stringify({ error: "Wait 10s" }), { status: 429 });

    // 3. Recipient Lock (SQL)
    // Simplified to ensure it doesn't crash if meta is weird
    const dbResult = await env.DB.prepare(`
      INSERT INTO gift_locks (recipient, last_received) 
      VALUES (?, CURRENT_TIMESTAMP)
      ON CONFLICT(recipient) DO UPDATE SET last_received = CURRENT_TIMESTAMP
      WHERE (strftime('%s', 'now') - strftime('%s', last_received)) > 30
    `).bind(recipientUsername).run();

    if (!dbResult.meta || dbResult.meta.changes === 0) {
      return new Response(JSON.stringify({ error: "Recipient busy (30s)" }), { status: 429 });
    }

    // 4. Premium Check
    const premiumData = await env.USERS_KV.get("pal_premium");
    if (!isPremiumUser(premiumData, senderUsername)) {
      return new Response(JSON.stringify({ error: "Premium status required" }), { status: 403 });
    }

    // 5. KV Fetch
    const senderKey = `user:${senderUsername}`;
    const recipientKey = `user:${recipientUsername}`;
    const [rawS, rawR] = await Promise.all([
      env.USERS_KV.get(senderKey),
      env.USERS_KV.get(recipientKey)
    ]);

    if (!rawS || !rawR) return new Response(JSON.stringify({ error: "User profile missing" }), { status: 404 });

    const sObj = JSON.parse(rawS);
    const rObj = JSON.parse(rawR);

    // 6. Math Logic
    const sCur = Number(sObj.currency ?? 0);
    const sXp = Number(sObj.xp ?? 0);

    if (currencyVal > sCur || xpVal > sXp) {
      return new Response(JSON.stringify({ error: "Insufficient funds" }), { status: 400 });
    }

    // Update balances
    sObj.currency = sCur - currencyVal;
    sObj.xp = sXp - xpVal;
    rObj.currency = Number(rObj.currency ?? 0) + currencyVal;
    rObj.xp = Number(rObj.xp ?? 0) + xpVal;

    // 7. Commit
    await Promise.all([
      env.USERS_KV.put(senderKey, JSON.stringify(sObj)),
      env.USERS_KV.put(recipientKey, JSON.stringify(rObj)),
      env.USERS_KV.put(senderCooldownKey, "true", { expirationTtl: 10 })
    ]);

    return new Response(JSON.stringify({ success: true }), { 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (err) {
    // THIS IS THE KEY: Log to wrangler tail so you can see it
    console.error("Critical Worker Error:", err.message, err.stack);
    
    return new Response(JSON.stringify({ 
      error: "Server Error", 
      details: err.message,
      note: "Check wrangler tail for full stack trace"
    }), { status: 500 });
  }
}