export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query) return new Response("No query", { status: 400 });

    // Try these instances in order. If one fails, it moves to the next.
    const instances = [
      "https://searx.work",
      "https://search.mdosch.de",
      "https://searx.be",
      "https://priv.au"
    ];

    for (let instance of instances) {
      try {
        const targetUrl = `${instance}/search?q=${encodeURIComponent(query)}&format=json`;
        
        const response = await fetch(targetUrl, {
          method: "GET",
          headers: {
            // This header is vital to avoid being blocked as a bot
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/json"
          },
          // Short timeout so we don't wait forever on a dead instance
          signal: AbortSignal.timeout(5000) 
        });

        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.text(); // Get as text first to verify
            return new Response(data, {
              headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
              }
            });
          }
        }
      } catch (e) {
        console.log(`Instance ${instance} failed, trying next...`);
        continue; // Try the next instance in the list
      }
    }

    return new Response(JSON.stringify({ error: "All search instances are busy. Please try again in a minute." }), { 
      status: 503,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};