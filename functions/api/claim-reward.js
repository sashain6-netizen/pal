import { verifyAndDecodeToken } from './_jwt.js'; // Ensure this path is correct

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const cookieHeader = request.headers.get("Cookie") || "";
        
        // 1. IMPROVED COOKIE PARSING (Handles the spaces and semicolons correctly)
        const cookies = Object.fromEntries(
            cookieHeader.split(';').map(c => {
                const [key, ...v] = c.split('=');
                return [key.trim(), v.join('=')];
            })
        );

        // 2. MATCH YOUR LOGIN COOKIE NAME: 'pal_session'
        const token = cookies['pal_session']; 

        if (!token) {
            return new Response(JSON.stringify({ success: false, error: "Not logged in" }), { 
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 3. VERIFY JWT
        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const username = payload.username; // This is the lowercase version

        // 4. FETCH USER FROM KV
        const rawUser = await env.USERS_KV.get(`user:${username}`);
        if (!rawUser) {
            return new Response(JSON.stringify({ success: false, error: "User not found" }), { 
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        let user = JSON.parse(rawUser);

        // --- REWARD LOGIC ---
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const lastClaim = user.lastClaim || 0;

        if (now - lastClaim < oneDay) {
            return new Response(JSON.stringify({ success: false, error: "Too early!" }), { status: 400 });
        }

        // Streak check (Reset if > 48 hours)
        if (now - lastClaim > oneDay * 2) {
            user.streak = 1;
        } else {
            user.streak = (user.streak || 0) + 1;
        }

        const reward = 100 + (user.streak * 25);
        user.currency = (user.currency || 0) + reward;
        user.lastClaim = now;

        // 5. SAVE UPDATED USER
        await env.USERS_KV.put(`user:${username}`, JSON.stringify(user));

        return new Response(JSON.stringify({
            success: true,
            amount: reward,
            streak: user.streak,
            newTotal: user.currency
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: "Session expired or invalid" }), { 
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }
}