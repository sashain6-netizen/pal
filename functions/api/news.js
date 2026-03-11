import { verifyAndDecodeToken } from "../_jwt.js";

export async function onRequest(context) {
    const { request, env } = context;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const secret = env.JWT_SECRET; 

    // --- Helper: Verify Staff Rank via KV ---
    async function getStaffUser(request) {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
        
        const token = authHeader.split(" ")[1];
        try {
            const payload = await verifyAndDecodeToken(token, secret);
            
            // Fetch user from KV (assuming namespace is bound as env.USERS_KV)
            const kvData = await env.USERS_KV.get(`user:${payload.username}`);
            if (!kvData) return null;

            const userData = JSON.parse(kvData);
            const allowedRanks = ['Owner', 'Admin', 'Moderator'];

            if (userData && allowedRanks.includes(userData.rank)) {
                return { username: payload.username, rank: userData.rank };
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    // --- GET: Public News Feed ---
    if (request.method === "GET") {
        if (id) {
            const article = await env.DB.prepare("SELECT * FROM news_articles WHERE id = ?").bind(id).first();
            return article ? Response.json(article) : new Response("Not Found", { status: 404 });
        }
        const { results } = await env.DB.prepare("SELECT * FROM news_articles ORDER BY created_at DESC").all();
        return Response.json(results);
    }

    // --- POST: Create News (Staff Only) ---
    if (request.method === "POST") {
        const user = await getStaffUser(request);
        if (!user) return new Response("Unauthorized", { status: 401 });

        const data = await request.json();
        await env.DB.prepare(
            "INSERT INTO news_articles (title, slug, content, author_name, author_rank) VALUES (?, ?, ?, ?, ?)"
        ).bind(data.title, data.slug, data.content, user.username, user.rank).run();

        return new Response("Article Created", { status: 201 });
    }

    // --- DELETE: Remove News (Staff Only) ---
    if (request.method === "DELETE") {
        const user = await getStaffUser(request);
        if (!user) return new Response("Unauthorized", { status: 401 });
        if (!id) return new Response("Missing ID", { status: 400 });

        await env.DB.prepare("DELETE FROM news_articles WHERE id = ?").bind(id).run();
        return new Response("Article Deleted", { status: 200 });
    }

    return new Response("Method Not Allowed", { status: 405 });
}