export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.toLowerCase().trim();

    const matches = allUsers.filter(username => 
        username.toLowerCase() === query
    );
    if (!query) return new Response(JSON.stringify([]), { status: 400 });

    try {
        // 1. Fetch the "Master List" of usernames
        // You should update this list every time someone signs up!
        const allUsersRaw = await env.USERS_KV.get("all_users_index") || "[]";
        const allUsers = JSON.parse(allUsersRaw);

        // 2. Filter for matches (starts with or includes)
        const matches = allUsers.filter(username => 
            username.toLowerCase().includes(query)
        ).slice(0, 5); // Limit to top 5 results

        // 3. Get basic data for those matches (Display Name + Avatar)
        const results = await Promise.all(matches.map(async (username) => {
            const userData = await env.USERS_KV.get(`user:${username}`);
            if (!userData) return null;
            const user = JSON.parse(userData);
            return {
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl || "/default-avatar.png",
                prefix: user.currentPrefix || ""
            };
        }));

        return new Response(JSON.stringify(results.filter(r => r !== null)), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: "Search failed" }), { status: 500 });
    }
}