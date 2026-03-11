import { verifyAndDecodeToken } from "./_jwt.js";

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
            const kvData = await env.USERS_KV.get(`user:${payload.username.toLowerCase()}`);
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
        
        // Filter to only show published posts for the public feed
        const { results } = await env.DB.prepare(
            "SELECT * FROM news_articles WHERE is_published = 1 ORDER BY created_at DESC"
        ).all();
        return Response.json(results);
    }

    // --- POST: Create News (Staff Only) ---
    if (request.method === "POST") {
        const user = await getStaffUser(request);
        if (!user) return new Response("Unauthorized", { status: 401 });

        const data = await request.json();
        
        // Added 'category' and 'is_published' to the INSERT
        // 'id' is typically AUTOINCREMENT and 'created_at' is usually DEFAULT CURRENT_TIMESTAMP in D1
        await env.DB.prepare(
            `INSERT INTO news_articles 
            (title, slug, content, author_name, author_rank, category, is_published) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            data.title, 
            data.slug, 
            data.content, 
            user.username, 
            user.rank, 
            data.category || 'General', 
            data.is_published ?? 1
        ).run();

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