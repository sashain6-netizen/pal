import { verifyAndDecodeToken } from "./_jwt.js";

function parseCookiePalSession(cookieHeader) {
  const tokenPart = (cookieHeader || "")
    .split(";")
    .map(s => s.trim())
    .find(row => row.startsWith("pal_session="));
  return tokenPart ? tokenPart.split("=")[1] : null;
}

function safeParseJson(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function isPremiumUser(premiumUsersRaw, username) {
  const premiumUsers = safeParseJson(premiumUsersRaw, null);
  if (!premiumUsers || !username) return false;
  const uname = username.toLowerCase();

    if (Array.isArray(premiumUsers)) {
    return premiumUsers.some(u => String(u).toLowerCase() === uname);
  }
  return !!(premiumUsers[uname] || premiumUsers[username]);
}

async function loadPot(env) {
  const raw = await env.USERS_KV.get("pal_jackpot_pot");
  const parsed = safeParseJson(raw, { pot: 0 });
  return {
    pot: Number(parsed.pot) || 0,
    updatedAt: parsed.updatedAt || Date.now()
  };
}

export async function onRequestGet(context) {
  const { env } = context;
  const potState = await loadPot(env);
  const lastWinner = safeParseJson(await env.USERS_KV.get("pal_jackpot_last_winner"), null);

  return new Response(JSON.stringify({ ...potState, lastWinner }), {
    headers: { "Content-Type": "application/json" }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const now = Date.now();

  const token = parseCookiePalSession(request.headers.get("Cookie"));
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  try {
    const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
    const username = payload.username;
    if (!username) return new Response(JSON.stringify({ error: "Invalid Session" }), { status: 401 });

    const premiumData = await env.USERS_KV.get("pal_premium");
    if (!isPremiumUser(premiumData, username)) {
      return new Response(JSON.stringify({ error: "Premium required" }), { status: 403 });
    }

    const userLower = username.toLowerCase();
    const lastSpinTs = Number(await env.USERS_KV.get(`pal_jackpot_last_spin:${userLower}`)) || 0;
    const cooldownMs = 10 * 60 * 1000;
    const remaining = Math.max(0, cooldownMs - (now - lastSpinTs));

        if (remaining > 0) {
      return new Response(JSON.stringify({ error: "Too soon", cooldownMsRemaining: remaining }), { status: 429 });
    }

    const userKey = `user:${username}`;
    const userData = safeParseJson(await env.USERS_KV.get(userKey), null);
    if (!userData) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

    const spinCost = 50;
    const currentCurrency = Number(userData.currency) || 0;
    if (currentCurrency < spinCost) {
      return new Response(JSON.stringify({ error: "Insufficient funds" }), { status: 400 });
    }

    const winChance = 0.02;
    const potState = await loadPot(env);
    const potAfterFee = potState.pot + spinCost;

        const didWin = Math.random() < winChance;
    let winAmount = 0;

    userData.currency = currentCurrency - spinCost;

    if (didWin) {
      winAmount = potAfterFee;
      userData.currency += winAmount;
    }

    const nextPot = didWin ? 0 : potAfterFee;

    await Promise.all([
      env.USERS_KV.put(userKey, JSON.stringify(userData)),
      env.USERS_KV.put("pal_jackpot_pot", JSON.stringify({ pot: nextPot, updatedAt: now })),
      env.USERS_KV.put(`pal_jackpot_last_spin:${userLower}`, String(now))
    ]);

    if (didWin) {
      await env.USERS_KV.put("pal_jackpot_last_winner", JSON.stringify({
        username: username,
        amount: winAmount,
        timestamp: now
      }));
    }

    return new Response(JSON.stringify({
      success: true,
      didWin,
      newBalance: userData.currency,
      winAmount,
      potAfter: nextPot,
      cooldownMs: cooldownMs
    }), { headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), { status: 500 });
  }
}
