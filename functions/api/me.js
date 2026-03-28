export async function onRequestGet(context) {
  const { request, env } = context;
  const cookieHeader = request.headers.get("Cookie") || "";

    if (!cookieHeader.includes("pal_session=")) {
    return new Response(JSON.stringify({ loggedIn: false }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const token = cookieHeader.split("pal_session=")[1].split(";")[0];
    const payload = JSON.parse(atob(token.split(".")[1]));
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
      avatarUrl: user.avatarUrl || "/default-avatar.png",
      isPremium: isPremium
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ loggedIn: false, error: err.message }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
