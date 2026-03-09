export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query) return new Response(JSON.stringify({ error: "No query" }), { status: 400 });

    const instances = [
      "https://searx.be",
      "https://search.mdosch.de",
      "https://searx.priv.pw",
      "https://search.ononoki.org",
      "https://searx.perennialte.ch",
      "https://priv.au"
    ];

    // Shuffle instances for better reliability
    const shuffled = instances.sort(() => 0.5 - Math.random());

    for (let instance of shuffled) {
      try {
        const targetUrl = `${instance}/search?q=${encodeURIComponent(query)}&format=json`;
        
        const response = await fetch(targetUrl, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/json"
          },
          signal: AbortSignal.timeout(4000) // Slightly faster timeout
        });

        const contentType = response.headers.get("content-type");

        if (response.ok && contentType && contentType.includes("application/json")) {
          const data = await response.json();
          
          // Verify we actually got a results array
          if (data && data.results) {
             return new Response(JSON.stringify(data), {
                headers: { 
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*" 
                }
             });
          }
        }
        // If we reach here, this instance returned HTML or bad data. 
        // Throwing an error here triggers the 'catch' which 'continues' the loop.
        throw new Error("Invalid response");

      } catch (e) {
        console.log(`Skipping ${instance}: ${e.message}`);
        continue; 
      }
    }

    return new Response(JSON.stringify({ error: "All nodes busy" }), { 
      status: 503,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};