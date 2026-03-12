import { verifyAndDecodeToken } from "./_jwt.js";

export async function onRequest(context) {
    const { request, env } = context;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const secret = env.JWT_SECRET; 

    // --- Helper: Verify Staff Rank via Cookies & USERS_KV ---
    async function getStaffUser(request, env, secret) {
        const cookieHeader = request.headers.get("Cookie") || "";
        if (!cookieHeader.includes("pal_session=")) return null;
        
        try {
            const token = cookieHeader.split("pal_session=")[1].split(";")[0];
            const payload = await verifyAndDecodeToken(token, secret);
            
            const username = payload.username.toLowerCase();
            const kvData = await env.USERS_KV.get(`user:${username}`);
            
            if (!kvData) return null;

            const userData = JSON.parse(kvData);
            const allowedRanks = ['Owner', 'Admin', 'Moderator'];

            if (userData && allowedRanks.includes(userData.rank)) {
                return { username: userData.username, rank: userData.rank };
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    // --- 1. GET: Fetch Article(s) ---
    if (request.method === "GET") {
        if (id) {
            const article = await env.DB.prepare("SELECT * FROM news_articles WHERE id = ?").bind(id).first();
            return article ? Response.json(article) : new Response("Not Found", { status: 404 });
        }
        const { results } = await env.DB.prepare("SELECT * FROM news_articles WHERE is_published = 1 ORDER BY created_at DESC").all();
        return Response.json(results);
    }

    // --- 2. PATCH: Update Article (Staff Only) ---
    if (request.method === "PATCH") {
        const user = await getStaffUser(request, env, secret);
        if (!user) return new Response("Unauthorized", { status: 401 });
        if (!id) return new Response("Missing Article ID", { status: 400 });

        const data = await request.json();
        
        try {
            const current = await env.DB.prepare("SELECT title, category FROM news_articles WHERE id = ?").bind(id).first();
            if (!current) return new Response("Not Found", { status: 404 });

            const finalTitle = data.title || current.title;
            const finalContent = data.content || "";
            const finalCategory = data.category || current.category;

            const result = await env.DB.prepare(
                "UPDATE news_articles SET title = ?, content = ?, category = ? WHERE id = ?"
            ).bind(finalTitle, finalContent, finalCategory, id).run();

            return Response.json({ success: true });
        } catch (e) {
            return new Response("Database Error: " + e.message, { status: 500 });
        }
    }

    // --- 3. POST: Create Article (Staff Only) ---
    if (request.method === "POST") {
        const user = await getStaffUser(request, env, secret);
        if (!user) return new Response("Unauthorized", { status: 401 });

        const data = await request.json();
        try {
            await env.DB.prepare(
                `INSERT INTO news_articles 
                (title, slug, content, author_name, author_rank, category, is_published) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`
            ).bind(
                data.title, data.slug, data.content, 
                user.username, user.rank, 
                data.category || 'General', 1
            ).run();

            return new Response("Article Created", { status: 201 });
        } catch (e) {
            return new Response("Database Error: " + e.message, { status: 500 });
        }
    }

    // --- 4. DELETE: Remove Article (Staff Only) ---
    if (request.method === "DELETE") {
        const user = await getStaffUser(request, env, secret);
        if (!user) return new Response("Unauthorized", { status: 401 });
        if (!id) return new Response("Missing ID", { status: 400 });

        await env.DB.prepare("DELETE FROM news_articles WHERE id = ?").bind(id).run();
        return new Response("Article Deleted", { status: 200 });
    }

    return new Response("Method Not Allowed", { status: 405 });
}