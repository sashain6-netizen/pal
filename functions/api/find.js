export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Get the search query from your URL (e.g., /find?q=apples)
    const query = url.searchParams.get("q");
    if (!query) {
      return new Response("Please provide a query.", { status: 400 });
    }

    // 2. Define the Target (Using DuckDuckGo HTML version as an example)
    const targetUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    // 3. Set up Headers to look like a real browser (Crucial to avoid blocks)
    const modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    modifiedHeaders.set("Accept-Language", "en-US,en;q=0.9");

    try {
      // 4. Perform the fetch to the internet
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: modifiedHeaders,
      });

      // 5. Return the result to your visitor
      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "text/html",
          "Access-Control-Allow-Origin": "*", // Allows your website to read the data
        },
      });
    } catch (e) {
      return new Response("Proxy Error: " + e.message, { status: 500 });
    }
  },
};