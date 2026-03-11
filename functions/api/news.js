export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // 1. GET: Fetching Articles
    if (request.method === "GET") {
      if (id) {
        // Fetch specific article
        const article = await env.DB.prepare("SELECT * FROM news_articles WHERE id = ?").bind(id).first();
        return Response.json(article);
      } else {
        // Fetch all for /latest
        const { results } = await env.DB.prepare("SELECT id, title, author_name, created_at FROM news_articles WHERE is_published = 1 ORDER BY created_at DESC").all();
        return Response.json(results);
      }
    }

    // 2. POST: Creating Articles (Admin/Mod/Owner Only logic)
    if (request.method === "POST") {
      const data = await request.json();
      
      // Simple Security: In a real app, verify their JWT/Session rank here
      const allowedRanks = ['Admin', 'Moderator', 'Owner'];
      if (!allowedRanks.includes(data.author_rank)) {
        return new Response("Unauthorized", { status: 401 });
      }

      await env.DB.prepare(
        "INSERT INTO news_articles (title, slug, content, author_name, author_rank) VALUES (?, ?, ?, ?, ?)"
      ).bind(data.title, data.slug, data.content, data.author_name, data.author_rank).run();

      return new Response("Article Created!", { status: 201 });
    }
  }
};