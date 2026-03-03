export async function onRequestGet(context) {
  // We return a response that clears the 'pal_session' cookie
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Content-Type": "application/json",
      // Setting Max-Age to 0 and an expired date forces the browser to delete it
      "Set-Cookie": "pal_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
  });
}