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

function safeParseJson(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function loadPot(env) {
  const raw = await env.USERS_KV.get("pal_jackpot_pot");
  const parsed = safeParseJson(raw, null);
  if (parsed && typeof parsed.pot === "number") {
    return { pot: parsed.pot, updatedAt: parsed.updatedAt || Date.now() };
  }
  return { pot: 0, updatedAt: Date.now() };
}

async function pickRandomWinnerUsername(env) {
  const raw = await env.USERS_KV.get("all_users_index");
  const list = safeParseJson(raw, []);
  if (!Array.isArray(list) || list.length === 0) return null;
  const i = Math.floor(Math.random() * list.length);
  return list[i];
}

export async function onRequestGet(context) {
  const { env } = context;
  const potState = await loadPot(env);
  const lastWinnerRaw = await env.USERS_KV.get("pal_jackpot_last_winner");
  const lastWinner = safeParseJson(lastWinnerRaw, null);

  return new Response(
    JSON.stringify({
      pot: potState.pot,
      updatedAt: potState.updatedAt,
      lastWinner
    }),
    { headers: { "Content-Type": "application/json" } }
  );
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

    const premiumData = await env.USERS_KV.get("pal_premium");
    if (!isPremiumUser(premiumData, username)) {
      return new Response(JSON.stringify({ error: "Premium required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Economy tuning knobs
    const spinCost = 50; // currency units
    const winChance = 0.02; // 2% per spin
    const cooldownMs = 10 * 60 * 1000; // 10 minutes per user

    const rawLastSpin = await env.USERS_KV.get(`pal_jackpot_last_spin:${username.toLowerCase()}`);
    const lastSpinTs = rawLastSpin ? Number(rawLastSpin) : 0;
    const now = Date.now();
    const remaining = lastSpinTs ? Math.max(0, cooldownMs - (now - lastSpinTs)) : 0;
    if (remaining > 0) {
      return new Response(JSON.stringify({ error: "Too soon", cooldownMsRemaining: remaining }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      });
    }

    const userKey = `user:${username}`;
    const rawUser = await env.USERS_KV.get(userKey);
    if (!rawUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const user = JSON.parse(rawUser);
    const currency = Number(user.currency || 0);
    if (currency < spinCost) {
      return new Response(JSON.stringify({ error: "Insufficient currency for a spin" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const potState = await loadPot(env);
    const potBefore = potState.pot;

    // Charge spinner + grow pot
    user.currency = currency - spinCost;
    const potAfterSpin = potBefore + spinCost;

    let didWin = false;
    let winnerUsername = null;
    let winAmount = 0;
    const shouldWin = Math.random() < winChance;

    if (shouldWin) {
      didWin = true;
      winnerUsername = await pickRandomWinnerUsername(env);
      winnerUsername = winnerUsername || username.toLowerCase();
      winAmount = potAfterSpin;

      const spinnerUsername = String(username).toLowerCase();
      const winnerLower = String(winnerUsername).toLowerCase();

      // If the spinner is the winner, credit only the in-memory `user`
      // (otherwise we'd overwrite the credited amount when we later save `userKey`).
      if (winnerLower === spinnerUsername) {
        user.currency = Number(user.currency || 0) + winAmount;
      } else {
        // Credit winner
        const winnerKey = `user:${winnerUsername}`;
        const rawWinner = await env.USERS_KV.get(winnerKey);
        if (rawWinner) {
          const winnerUser = JSON.parse(rawWinner);
          winnerUser.currency = Number(winnerUser.currency || 0) + winAmount;
          await env.USERS_KV.put(winnerKey, JSON.stringify(winnerUser));
        } else {
          // If something is inconsistent, fall back to crediting the spinner
          user.currency = Number(user.currency || 0) + winAmount;
        }
      }
    }

    await env.USERS_KV.put(userKey, JSON.stringify(user));

    const nextPot = didWin ? 0 : potAfterSpin;
    await env.USERS_KV.put("pal_jackpot_pot", JSON.stringify({ pot: nextPot, updatedAt: now }));
    await env.USERS_KV.put(`pal_jackpot_last_spin:${username.toLowerCase()}`, String(now));

    if (didWin) {
      await env.USERS_KV.put(
        "pal_jackpot_last_winner",
        JSON.stringify({ username: winnerUsername, amount: winAmount, timestamp: now })
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        didWin,
        winnerUsername,
        winAmount,
        spinCost,
        potBefore,
        potAfter: nextPot
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

