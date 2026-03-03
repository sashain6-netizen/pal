const encoder = new TextEncoder();

export async function createToken(username, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    username,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Expires in 24 hours
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  return `${data}.${encodedSignature}`;
}