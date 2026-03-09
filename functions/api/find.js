export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query) return new Response(JSON.stringify({ error: "No query" }), { status: 400 });

    // A large, rotated list of public SearXNG instances
    const instances = [
      "https://searx.be",
      "https://search.mdosch.de",
      "https://searx.priv.pw",
      "https://searx.work",
      "https://search.ononoki.org",
      "https://searx.orion-belt.net",
      "https://search.privacytools.io",
      "https://searx.sethforprivacy.com",
      "https://searx.perennialte.ch",
      "https://priv.au",
      "https://searxng.site",
      "https://baresearch.org",
      "https://search.sapti.me",
      "https://searx.rhscz.eu",
      "https://search.disroot.org"
    ];

    // Shuffle the list so we don't hit the same first instance every time
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
          // If a server takes > 5s, it's too slow; move to next
          signal: AbortSignal.timeout(5000) 
        });

        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.text();
            
            // Success! Return the data to the frontend
            return new Response(data, {
              headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
              }
            });
          }
        }
      } catch (e) {
        // If this instance fails, the loop continues to the next one automatically
        console.log(`Failed instance: ${instance}`);
        continue; 
      }
    }

    // If the loop finishes and nothing worked
    return new Response(JSON.stringify({ error: "All search nodes are currently busy. Try again in a moment." }), { 
      status: 503,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};