export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query) {
        return new Response(JSON.stringify({ error: "No query" }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    // A list of reliable 2026 public SearXNG instances
    const instances = [
        "https://search.rhscz.eu",
        "https://search.inetol.net",
        "https://search.indst.eu",
        "https://searx.work"
    ];

    // Pick a random instance to avoid rate limits
    const selectedInstance = instances[Math.floor(Math.random() * instances.length)];

    try {
        // format=json is the key here. We also specify engines for better results.
        const targetUrl = `${selectedInstance}/search?q=${encodeURIComponent(query)}&format=json&engines=google,bing,duckduckgo,wikipedia`;
        
        const response = await fetch(targetUrl, {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "application/json"
            }
        });

        if (!response.ok) throw new Error(`Instance ${selectedInstance} returned ${response.status}`);

        const data = await response.json();
        
        // SearXNG returns results in a 'results' array.
        // We map them to the keys your frontend expects: title, url, content.
        const results = (data.results || []).map(item => ({
            title: item.title || "Untitled Result",
            url: item.url || "#",
            content: item.content || item.snippet || "No description available."
        }));

        return new Response(JSON.stringify({ results }), {
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            }
        });

    } catch (e) {
        console.error("Search Error:", e.message);
        return new Response(JSON.stringify({ 
            error: "Search failed", 
            details: e.message 
        }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}