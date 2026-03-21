// This runs when Stripe confirms payment
if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const username = session.client_reference_id; // Pass the username here

    // Get current premium list
    const premiumData = await env.USERS_KV.get("pal_premium", { cacheTtl: 3600 });
    let premiumUsers = JSON.parse(premiumData || "[]");

    // Add user if not already there
    if (!premiumUsers.includes(username)) {
        premiumUsers.push(username.toLowerCase());
        await env.USERS_KV.put("pal_premium", JSON.stringify(premiumUsers));
    }
}