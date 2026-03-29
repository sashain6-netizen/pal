import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequestGet(context) {
  const { request, env } = context;

  const cookieHeader = request.headers.get("Cookie") || "";
  const token = cookieHeader
    .split('; ')
    .find(row => row.trim().startsWith('pal_session='))
    ?.split('=')[1];

  if (!token) {
    return new Response(JSON.stringify({ loggedIn: false }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const payload = await verifyAndDecodeToken(token, env.JWT_SECRET, env);
    const username = payload.username?.toLowerCase();

    const userKey = `user:${username}`;
    const rawData = await env.USERS_KV.get(userKey, { cacheTtl: 1800 });
    const user = rawData ? JSON.parse(rawData) : null;

    if (!user) {
      return new Response(JSON.stringify({ loggedIn: false }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    const premiumData = await env.USERS_KV.get("pal_premium", { cacheTtl: 3600 });
    const premiumUsers = premiumData ? JSON.parse(premiumData) : [];
    const isPremium = Array.isArray(premiumUsers) && premiumUsers.includes(user.username);

    return new Response(JSON.stringify({
      loggedIn: true,
      username: user.username,
      displayName: user.displayName,
      rank: user.rank || "Member",
      themeColor: user.themeColor || "#2563eb",
      avatar: user.avatarUrl || "/default-avatar.png",
      isPremium: isPremium,
      accessories: user.accessories || {
        hats: 'none',
        glasses: 'none',
        mouths: 'none',
        face_accessories: 'none',
        backgrounds: 'none'
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ loggedIn: false, error: err.message }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
