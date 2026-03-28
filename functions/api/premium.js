if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const username = session.client_reference_id;

    const premiumData = await env.USERS_KV.get("pal_premium", { cacheTtl: 3600 });
    let premiumUsers = JSON.parse(premiumData || "[]");

    if (!premiumUsers.includes(username)) {
        premiumUsers.push(username.toLowerCase());
        await env.USERS_KV.put("pal_premium", JSON.stringify(premiumUsers));
    }
}
