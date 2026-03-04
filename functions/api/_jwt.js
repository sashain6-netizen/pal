const encoder = new TextEncoder();

function base64UrlEncode(str) {
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// Helper to decode Base64URL back to a string
function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return atob(str);
}

export async function createToken(username, secret) {
  const header = JSON.stringify({ alg: "HS256", typ: "JWT" });
  const payload = JSON.stringify({
    username,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), 
  });

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const data = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    "raw", 
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, 
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));

  return `${data}.${encodedSignature}`;
}

// ADD THIS: The function update_profile.js is looking for!
export async function verifyAndDecodeToken(token, secret) {
  const [headerB64, payloadB64, signatureB64] = token.split(".");
  
  // 1. Re-sign the data to verify authenticity
  const data = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const signature = new Uint8Array(
    Array.from(base64UrlDecode(signatureB64), c => c.charCodeAt(0))
  );

  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    encoder.encode(data)
  );

  if (!isValid) throw new Error("Invalid Token");

  // 2. Check expiration
  const payload = JSON.parse(base64UrlDecode(payloadB64));
  if (Date.now() / 1000 > payload.exp) throw new Error("Token Expired");

  return payload;
}

// ALSO ADD THIS: Just in case you use the name parseToken elsewhere
export const parseToken = verifyAndDecodeToken;