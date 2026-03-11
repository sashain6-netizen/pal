export async function onRequest(context) {
    const { request, env } = context;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // 1. GET: Fetching Articles
    if (request.method === "GET") {
        if (id) {
            // Fetch specific article
            const article = await env.DB.prepare("SELECT * FROM news_articles WHERE id = ?")
                .bind(id)
                .first();
            
            if (!article) {
                return new Response("Article not found", { status: 404 });
            }
            return Response.json(article);
        } else {
            // Fetch all for the /latest hub
            const { results } = await env.DB.prepare(
                "SELECT id, title, author_name, created_at FROM news_articles WHERE is_published = 1 ORDER BY created_at DESC"
            ).all();
            return Response.json(results);
        }
    }

    // 2. POST: Creating Articles
    if (request.method === "POST") {
        try {
            const data = await request.json();
            
            // Authorization Check
            const allowedRanks = ['Admin', 'Moderator', 'Owner'];
            if (!allowedRanks.includes(data.author_rank)) {
                return new Response("Unauthorized", { status: 401 });
            }

            // Insert into D1
            await env.DB.prepare(
                "INSERT INTO news_articles (title, slug, content, author_name, author_rank) VALUES (?, ?, ?, ?, ?)"
            ).bind(data.title, data.slug, data.content, data.author_name, data.author_rank).run();

            return new Response("Article Created!", { status: 201 });
        } catch (err) {
            return new Response("Error processing request", { status: 400 });
        }
    }

    return new Response("Method not allowed", { status: 405 });
}