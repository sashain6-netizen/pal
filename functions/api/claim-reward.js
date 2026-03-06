import { verifyAndDecodeToken } from './_jwt.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // 1. Get the JWT from the cookies
        const cookieHeader = request.headers.get("Cookie") || "";
        const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
        const token = cookies['auth_token']; // Use whatever name your cookie has

        if (!token) {
            return new Response(JSON.stringify({ success: false, error: "Not logged in" }), { status: 401 });
        }

        // 2. Verify the JWT using your secret
        const payload = await verifyAndDecodeToken(token, env.JWT_SECRET);
        const username = payload.username;

        // 3. Fetch the user from KV using the username from the JWT
        const rawUser = await env.USERS_KV.get(`user:${username}`);
        if (!rawUser) {
            return new Response(JSON.stringify({ success: false, error: "User not found in database" }), { status: 404 });
        }

        let user = JSON.parse(rawUser);

        // 4. Daily Reward Logic
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const lastClaim = user.lastClaim || 0;

        if (now - lastClaim < oneDay) {
            return new Response(JSON.stringify({ success: false, error: "Too early! Try again later." }), { status: 400 });
        }

        // Streak & Reward Calculation
        if (now - lastClaim > oneDay * 2) {
            user.streak = 1;
        } else {
            user.streak = (user.streak || 0) + 1;
        }

        const rewardAmount = 100 + (user.streak * 20);
        user.currency = (user.currency || 0) + rewardAmount;
        user.lastClaim = now;

        // 5. Save back to KV
        await env.USERS_KV.put(`user:${username}`, JSON.stringify(user));

        return new Response(JSON.stringify({
            success: true,
            amount: rewardAmount,
            streak: user.streak,
            newTotal: user.currency
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        // This catches "Invalid Token Signature" or "Token Expired"
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 401 });
    }
}