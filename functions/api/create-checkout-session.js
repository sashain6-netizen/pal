import Stripe from 'stripe';

export async function onRequestPost(context) {
  const { request, env } = context;

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const cookieHeader = request.headers.get("Cookie") || "";
  if (!cookieHeader.includes("pal_session=")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const token = cookieHeader.split("pal_session=")[1].split(";")[0];
    const payload = JSON.parse(atob(token.split(".")[1]));
    const username = payload.username?.toLowerCase();

    const premiumData = await env.USERS_KV.get("pal_premium");
    const premiumUsers = JSON.parse(premiumData || "[]");

        if (premiumUsers.includes(username)) {
        return new Response(JSON.stringify({ error: "Already a premium member" }), { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Premium Membership',
              description: 'Golden glow, premium star, and priority search.',
            },
            unit_amount: 500, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      client_reference_id: username, 
      success_url: `${new URL(request.url).origin}/profile?id=${username}&status=success`,
      cancel_url: `${new URL(request.url).origin}/premium?status=cancel`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}