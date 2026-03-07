export async function onRequestPost(context) {
    const { request, env } = context;
    const { message, model } = await request.json();

    try {
        // 1. PAL AI (Uses Cloudflare Workers AI - Free/Cheap)
        if (model === 'pal-ai') {
            const aiRes = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages: [{ role: 'user', content: message }]
            });
            return new Response(JSON.stringify({ text: aiRes.response }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // 2. CHATGPT (Requires OPENAI_API_KEY in env)
        if (model === 'gpt-4o') {
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: message }]
                })
            });
            const data = await res.json();
            return new Response(JSON.stringify({ text: data.choices[0].message.content }));
        }

        // 3. GEMINI (Requires GEMINI_API_KEY in env)
        if (model === 'gemini-pro') {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${env.GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: message }] }]
                })
            });
            const data = await res.json();
            return new Response(JSON.stringify({ text: data.candidates[0].content.parts[0].text }));
        }

        return new Response(JSON.stringify({ error: "Model not found" }), { status: 404 });

    } catch (err) {
        return new Response(JSON.stringify({ text: "Error: " + err.message }), { status: 500 });
    }
}