export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query) return new Response(JSON.stringify({ error: "No query" }), { status: 400 });

    try {
      // DuckDuckGo Instant Answer API
      const targetUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }
      });

      const data = await response.json();

      // DuckDuckGo puts results in "RelatedTopics"
      // We map them to match your frontend's 'title', 'url', 'content' format
      const results = (data.RelatedTopics || []).map(item => {
        // Some items are sub-groups, some are direct results
        return {
          title: item.Text ? item.Text.split(" - ")[0] : "Result",
          url: item.FirstURL || "#",
          content: item.Text || ""
        };
      }).filter(item => item.url !== "#"); // Remove empty results

      return new Response(JSON.stringify({ results }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: "DuckDuckGo is unreachable" }), { 
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  }
};