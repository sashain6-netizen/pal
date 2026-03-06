export async function onRequestPost(context) {
    const { env, request } = context;
    
    // 1. Get user session (Standard auth check)
    // Replace this with your actual user identification logic
    const userId = "user_id_from_session"; 

    const rawUser = await env.USERS_KV.get(`user:${userId}`);
    if (!rawUser) return new Response("User not found", { status: 404 });

    let user = JSON.parse(rawUser);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const lastClaim = user.lastClaim || 0;

    // Prevention: Check if 24 hours have passed
    if (now - lastClaim < oneDay) {
        return new Response(JSON.stringify({ error: "Too early" }), { status: 400 });
    }

    // Streak Logic: Reset if missed more than 48 hours
    if (now - lastClaim > oneDay * 2) {
        user.streak = 1;
    } else {
        user.streak = (user.streak || 0) + 1;
    }

    // Math: Base 100 + (streak * 25)
    const amount = 100 + (user.streak * 25);
    user.currency = (user.currency || 0) + amount;
    user.lastClaim = now;

    await env.USERS_KV.put(`user:${userId}`, JSON.stringify(user));

    return new Response(JSON.stringify({
        success: true,
        amount,
        streak: user.streak,
        newTotal: user.currency
    }), { headers: { "Content-Type": "application/json" } });
}