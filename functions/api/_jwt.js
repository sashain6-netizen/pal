const encoder = new TextEncoder();

// Helper to make Base64 URL-safe (removes +, /, and =)
function base64UrlEncode(str) {
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export async function createToken(username, secret) {
  const header = JSON.stringify({ alg: "HS256", typ: "JWT" });
  const payload = JSON.stringify({
    username,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), 
  });

  // 1. Encode parts using the URL-safe helper
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const data = `${encodedHeader}.${encodedPayload}`;

  // 2. Import the key
  const key = await crypto.subtle.importKey(
    "raw", 
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, 
    ["sign"]
  );

  // 3. Sign the data
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  
  // 4. Encode the signature
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return `${data}.${encodedSignature}`;
}