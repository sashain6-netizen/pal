export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query) return new Response("No query", { status: 400 });

    // A list of public SearXNG instances from searx.space
    // If one stops working, just replace it with another from the list!
    const instances = [
      "https://searx.be",
      "https://searxng.site",
      "https://priv.au"
    ];
    
    // We'll use the first one for now
    const targetUrl = `${instances[0]}/search?q=${encodeURIComponent(query)}&format=json`;

    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MyPal/1.0",
          "Accept": "application/json"
        }
      });

      const data = await response.json();
      
      // Return just the results to your frontend
      return new Response(JSON.stringify(data.results), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Search failed" }), { status: 500 });
    }
  }
};