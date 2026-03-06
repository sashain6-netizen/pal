export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.toLowerCase().trim();

    // 1. Validation check immediately
    if (!query) {
        return new Response(JSON.stringify([]), { 
            headers: { "Content-Type": "application/json" } 
        });
    }

    try {
        // 2. Fetch the "Master List" from KV
        const allUsersRaw = await env.USERS_KV.get("all_users_index") || "[]";
        const allUsers = JSON.parse(allUsersRaw);

        // 3. Filter for EXACT match only (as requested)
        const matches = allUsers.filter(username => 
            username.toLowerCase() === query
        );

        // 4. Get basic data for those matches
        const results = await Promise.all(matches.map(async (username) => {
            const userData = await env.USERS_KV.get(`user:${username}`);
            if (!userData) return null;
            const user = JSON.parse(userData);
            
            return {
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl || "/default-avatar.png",
                prefix: user.currentPrefix || "",
                themeColor: user.themeColor || "#2563eb"
            };
        }));

        return new Response(JSON.stringify(results.filter(r => r !== null)), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        // Log the error to your Cloudflare console
        console.error(e);
        return new Response(JSON.stringify({ error: "Search failed", details: e.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}