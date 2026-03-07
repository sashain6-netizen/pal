export async function onRequest(context) {
  const { request } = context;
  
  // 1. Get the target URL from the query string (e.g., /api/proxy?url=https://api.example.com)
  const { searchParams } = new URL(request.url);
  let targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "Missing 'url' parameter" }), { status: 400 });
  }

  try {
    // 2. Forward the request to the target
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : null
    });

    // 3. Return the response back to your frontend
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allows your site to read the data
        "Content-Type": response.headers.get("Content-Type") || "application/json"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Proxy failed", details: err.message }), { status: 500 });
  }
}