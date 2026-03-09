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

    // A larger list of varied instances
    const instances = [
        "https://searx.be",
        "https://priv.au",
        "https://searx.work",
        "https://baresearch.org",
        "https://search.indst.eu"
    ];

    // Shuffle the list so we don't all hit the same one first
    const shuffled = instances.sort(() => 0.5 - Math.random());

    // Try each instance until one works
    for (const instance of shuffled) {
        try {
            const targetUrl = `${instance}/search?q=${encodeURIComponent(query)}&format=json`;
            
            const response = await fetch(targetUrl, {
                method: "GET",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    "Accept": "application/json"
                },
                signal: AbortSignal.timeout(3000) // Don't wait more than 3s per instance
            });

            if (response.ok) {
                const data = await response.json();
                const results = (data.results || []).map(item => ({
                    title: item.title || "Untitled",
                    url: item.url || "#",
                    content: item.content || item.snippet || ""
                }));

                return new Response(JSON.stringify({ results }), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
            }
        } catch (e) {
            console.log(`Instance ${instance} failed, trying next...`);
            continue; // Move to the next instance in the loop
        }
    }

    // If we get here, all instances failed
    return new Response(JSON.stringify({ error: "All search nodes are currently busy. Please try again in 10 seconds." }), { 
        status: 503,
        headers: { "Content-Type": "application/json" }
    });
}