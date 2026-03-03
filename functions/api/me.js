export async function onRequestGet(context) {
  const cookie = context.request.headers.get("Cookie");
  if (!cookie || !cookie.includes("pal_session=")) {
    return new Response(JSON.stringify({ loggedIn: false }), { status: 200 });
  }

  // In a full version, you would verify the JWT signature here.
  // For now, we'll extract the username from the cookie string.
  const token = cookie.split("pal_session=")[1].split(";")[0];
  const payload = JSON.parse(atob(token.split(".")[1]));

  return new Response(JSON.stringify({ 
    loggedIn: true, 
    username: payload.username 
  }), { headers: { "Content-Type": "application/json" } });
}