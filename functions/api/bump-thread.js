import { verifyAndDecodeToken } from "./_jwt.js";

function parseCookiePalSession(cookieHeader) {
  const tokenPart = (cookieHeader || "")
    .split(";")
    .map(s => s.trim())
    .find(row => row.startsWith("pal_session="));
  if (!tokenPart) return null;
  return tokenPart.split("=")[1];
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const cookieHeader = request.headers.get("Cookie") || "";
  const token = parseCookiePalSession(cookieHeader);
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

  try {
    const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
    const username = String(payload.username || "").toLowerCase();
    if (!username) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

    // --- NEW PREMIUM CHECK (KV BASED) ---
    // Fetch your specific KV key that holds the list of premium users
    // Adjust "premium_users_list" to match whatever key name you actually use
    const premiumListRaw = await env.USERS_KV.get("pal_premium");
    let isPremium = false;

    if (premiumListRaw) {
      const premiumUsers = JSON.parse(premiumListRaw);
      // Check if current username is in the list
      isPremium = Array.isArray(premiumUsers) && premiumUsers.includes(username);
    }

    if (!isPremium) {
      return new Response(JSON.stringify({ error: "Thread bumping is a Premium-only feature." }), { 
        status: 403, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const body = await request.json();
    const threadId = Number(body.threadId);
    if (!Number.isFinite(threadId)) return new Response(JSON.stringify({ error: "Invalid threadId" }), { status: 400, headers: { "Content-Type": "application/json" } });

    // Must be the thread creator (SQL check for thread authorship is still correct)
    const thread = await env.DB.prepare("SELECT id, creator_username FROM threads WHERE id = ?").bind(threadId).first();
    if (!thread) return new Response(JSON.stringify({ error: "Thread not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    if (String(thread.creator_username || "").toLowerCase() !== username) {
      return new Response(JSON.stringify({ error: "You can only bump your own threads." }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    // 24h cooldown per user
    const cooldownMs = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const lastRaw = await env.USERS_KV.get(`pal_thread_bump_last:${username}`);
    const last = lastRaw ? Number(lastRaw) : 0;
    const remaining = last ? Math.max(0, cooldownMs - (now - last)) : 0;
    if (remaining > 0) {
      return new Response(JSON.stringify({ error: "Too soon", cooldownMsRemaining: remaining }), { status: 429, headers: { "Content-Type": "application/json" } });
    }

    // Ensure bumps table exists in DB
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS thread_bumps (
        thread_id INTEGER PRIMARY KEY,
        bumped_at TEXT NOT NULL,
        bumped_by TEXT NOT NULL
      )
    `).run();

    await env.DB.prepare(`
      INSERT INTO thread_bumps (thread_id, bumped_at, bumped_by)
      VALUES (?, CURRENT_TIMESTAMP, ?)
      ON CONFLICT(thread_id) DO UPDATE SET bumped_at = CURRENT_TIMESTAMP, bumped_by = excluded.bumped_by
    `).bind(threadId, username).run();

    await env.USERS_KV.put(`pal_thread_bump_last:${username}`, String(now));

    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}