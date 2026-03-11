import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequest(context) {
    const { request, env } = context;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const secret = env.JWT_SECRET; 

    // --- Helper: Verify Staff Rank via KV ---
    // We pass 'env' and 'secret' directly to avoid scope issues
    async function getStaffUser(request, env, secret) {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
        
        const token = authHeader.split(" ")[1];
        try {
            // Use your existing _jwt.js function
            const payload = await verifyAndDecodeToken(token, secret);
            
            // Logically force lowercase for the KV lookup
            const username = payload.username.toLowerCase();
            const kvData = await env.USERS_KV.get(`user:${username}`);
            
            if (!kvData) return null;

            const userData = JSON.parse(kvData);
            const allowedRanks = ['Owner', 'Admin', 'Moderator'];

            if (userData && allowedRanks.includes(userData.rank)) {
                return { username: payload.username, rank: userData.rank };
            }
            return null;
        } catch (e) {
            console.error("JWT Verification failed:", e.message);
            return null;
        }
    }

    // --- GET: Public News Feed ---
    if (request.method === "GET") {
        if (id) {
            const article = await env.DB.prepare("SELECT * FROM news_articles WHERE id = ?").bind(id).first();
            return article ? Response.json(article) : new Response("Not Found", { status: 404 });
        }
        const { results } = await env.DB.prepare("SELECT * FROM news_articles WHERE is_published = 1 ORDER BY created_at DESC").all();
        return Response.json(results);
    }

    // --- POST: Create News (Staff Only) ---
    if (request.method === "POST") {
        // Pass the env and secret here
        const user = await getStaffUser(request, env, secret);
        if (!user) return new Response("Unauthorized", { status: 401 });

        const data = await request.json();
        
        try {
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
        } catch (dbError) {
            return new Response("Database Error: " + dbError.message, { status: 500 });
        }
    }

    // --- DELETE: Remove News (Staff Only) ---
    if (request.method === "DELETE") {
        const user = await getStaffUser(request, env, secret);
        if (!user) return new Response("Unauthorized", { status: 401 });
        if (!id) return new Response("Missing ID", { status: 400 });

        await env.DB.prepare("DELETE FROM news_articles WHERE id = ?").bind(id).run();
        return new Response("Article Deleted", { status: 200 });
    }

    return new Response("Method Not Allowed", { status: 405 });
}