export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.toLowerCase().trim();

    if (!query) {
        return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
    }

    try {
        // Fetch Master List AND Premium List
        const [allUsersRaw, premiumRaw] = await Promise.all([
            env.USERS_KV.get("all_users_index"),
            env.USERS_KV.get("pal_premium", { cacheTtl: 3600 })
        ]);

        const allUsers = JSON.parse(allUsersRaw || "[]");
        const premiumUsers = JSON.parse(premiumRaw || "[]");

        const matches = allUsers.filter(username => username.toLowerCase() === query);

        const results = await Promise.all(matches.map(async (username) => {
            const userData = await env.USERS_KV.get(`user:${username}`, { cacheTtl: 1800 });
            if (!userData) return null;
            const user = JSON.parse(userData);
            
            return {
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl || "/default-avatar.png",
                prefix: user.currentPrefix || "",
                themeColor: user.themeColor || "#2563eb",
                // ADD THIS FLAG
                isPremium: premiumUsers.includes(username.toLowerCase()) 
            };
        }));

        return new Response(JSON.stringify(results.filter(r => r !== null)), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: "Search failed" }), { status: 500 });
    }
}