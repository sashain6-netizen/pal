export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query) return new Response(JSON.stringify({ error: "No query" }), { status: 400 });

    // Updated list of instances that are currently more stable
    const instances = [
        "https://search.md0.net",
        "https://searx.work",
        "https://priv.au",
        "https://search.privacyideas.com"
    ];

    for (const instance of instances.sort(() => 0.5 - Math.random())) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

            const response = await fetch(`${instance}/search?q=${encodeURIComponent(query)}&format=json`, {
                headers: { "User-Agent": "Mozilla/5.0" },
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (response.ok) {
                const data = await response.json();
                const results = (data.results || []).slice(0, 15).map(item => ({
                    title: item.title,
                    url: item.url,
                    content: item.content || item.snippet || ""
                }));
                return new Response(JSON.stringify({ results }), {
                    headers: { "Content-Type": "application/json" }
                });
            }
        } catch (e) { continue; }
    }

    // FINAL FALLBACK: If SearXNG fails, don't 503. Use a basic fetch to keep the UI alive.
    return new Response(JSON.stringify({ 
        results: [{ title: "Search nodes busy", url: "#", content: "Please try again in a moment." }] 
    }), { headers: { "Content-Type": "application/json" }});
}