import { verifyAndDecodeToken } from "./_jwt.js";

function parseCookiePalSession(cookieHeader) {
  const tokenPart = (cookieHeader || "")
    .split(";")
    .map(s => s.trim())
    .find(row => row.startsWith("pal_session="));
  return tokenPart ? tokenPart.split("=")[1] : null;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const cookieHeader = request.headers.get("Cookie") || "";
  const token = parseCookiePalSession(cookieHeader);

  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  try {
    const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
    const username = String(payload.username || "").toLowerCase();
    if (!username) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const premiumListRaw = await env.USERS_KV.get("pal_premium");
    let isPremium = false;
    if (premiumListRaw) {
      const premiumUsers = JSON.parse(premiumListRaw);
      isPremium = Array.isArray(premiumUsers) ? premiumUsers.includes(username) : !!premiumUsers[username];
    }

    if (!isPremium) {
      return new Response(JSON.stringify({ error: "Premium-only feature." }), { status: 403 });
    }

    const cooldownMs = 60 * 60 * 1000;
    const now = Date.now();
    const lastRaw = await env.USERS_KV.get(`pal_thread_bump_last:${username}`);
    const remaining = lastRaw ? Math.max(0, cooldownMs - (now - Number(lastRaw))) : 0;

    if (remaining > 0) {
      return new Response(JSON.stringify({ error: "Too soon", cooldownMsRemaining: remaining }), { status: 429 });
    }

    const body = await request.json();
    const threadId = Number(body.threadId);

        const thread = await env.DB.prepare("SELECT creator_username FROM threads WHERE id = ?").bind(threadId).first();
    if (!thread) return new Response(JSON.stringify({ error: "Thread not found" }), { status: 404 });

        if (String(thread.creator_username || "").toLowerCase() !== username) {
      return new Response(JSON.stringify({ error: "You can only bump your own threads." }), { status: 403 });
    }

    await env.DB.prepare(`
      UPDATE threads 
      SET last_activity_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(threadId).run();

    await env.USERS_KV.put(`pal_thread_bump_last:${username}`, String(now));

    return new Response(JSON.stringify({ success: true }), { 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), { status: 500 });
  }
}