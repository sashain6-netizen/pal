export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/check-premium") {
      const username = url.searchParams.get("user");

      if (!username) {
        return Response.json({ isPremium: false }, { status: 400 });
      }

      try {
        const premiumData = await env.USERS_KV.get("pal_premium");

        if (!premiumData) {
          return Response.json({ isPremium: false });
        }

        const premiumUsers = JSON.parse(premiumData);

                const isPremium = Array.isArray(premiumUsers) && premiumUsers.includes(username);

        return Response.json({ isPremium }, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
          }
        });
      } catch (e) {
        return Response.json({ error: "Server Error", details: e.message }, { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
};
