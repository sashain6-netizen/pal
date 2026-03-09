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

    try {
        const targetUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
        
        const response = await fetch(targetUrl, {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            }
        });

        const data = await response.json();
        const results = [];

        // 1. Check for the main Abstract (Primary Result)
        if (data.AbstractText && data.AbstractURL) {
            results.push({
                title: data.Heading || "Summary",
                url: data.AbstractURL,
                content: data.AbstractText
            });
        }

        // 2. Map RelatedTopics (Supporting Results)
        if (data.RelatedTopics) {
            data.RelatedTopics.forEach(item => {
                // Direct topic
                if (item.FirstURL && item.Text) {
                    results.push({
                        title: item.Text.split(" - ")[0],
                        url: item.FirstURL,
                        content: item.Text
                    });
                } 
                // Nested categories
                else if (item.Topics) {
                    item.Topics.forEach(sub => {
                        if (sub.FirstURL) {
                            results.push({
                                title: sub.Text.split(" - ")[0],
                                url: sub.FirstURL,
                                content: sub.Text
                            });
                        }
                    });
                }
            });
        }

        return new Response(JSON.stringify({ results }), {
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: "API connection failed", details: e.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}