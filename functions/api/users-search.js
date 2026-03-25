import { verifyAndDecodeToken } from './_jwt.js'; 

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.toLowerCase().trim();

    if (!query || query.length < 1) return new Response("[]");

    try {
        const cookieHeader = request.headers.get("Cookie") || "";
        const token = cookieHeader.split('pal_session=')[1]?.split(';')[0];
        let currentUser = "";

                if (token) {
            try {
                const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
                currentUser = payload.username.toLowerCase();
            } catch (e) {  }
        }

        const allUsers = JSON.parse(await env.USERS_KV.get("all_users_index", { cacheTtl: 3600 }) || "[]");
        if (!allUsers.length) return new Response("[]");

        const matches = allUsers
            .filter(username => {
                const name = username.toLowerCase();
                return name.startsWith(query) && name !== currentUser;
            })
            .slice(0, 5)
            .map(username => ({ username }));

        return new Response(JSON.stringify(matches), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response("[]");
    }
}