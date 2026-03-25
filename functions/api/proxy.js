export async function onRequest(context) {
    const urlString = new URL(context.request.url).searchParams.get("url");

    if (!urlString) {
        return new Response("No URL provided", { status: 400 });
    }

    try {
        const response = await fetch(urlString, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,webp,*/*;q=0.8"
            }
        });

        if (!response.ok) throw new Error(`Target returned ${response.status}`);

        let html = await response.text();
        const targetUrl = new URL(urlString);
        const origin = targetUrl.origin;

        html = html.replace("<head>", `<head><base href="${origin}/">`);

        return new Response(html, {
            headers: {
                "Content-Type": "text/html;charset=UTF-8",
                "Access-Control-Allow-Origin": "*",
                "X-Frame-Options": "ALLOWALL", 
                "Content-Security-Policy": "frame-ancestors *"
            }
        });

    } catch (e) {
        return new Response(`Proxy Error: ${e.message}`, { status: 500 });
    }
}