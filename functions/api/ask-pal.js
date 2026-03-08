import { Groq } from 'groq-sdk';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // 1. Get the user message from the request
    const { userMessage } = await request.json();

    // 2. Initialize Groq using the environment variable from Cloudflare Dashboard
    const groq = new Groq({ apiKey: env.GROQ_API_KEY });

    const PAL_SYSTEM_PROMPT = `
      You are the official AI Assistant for Pal.
      Mission: Make school more enjoyable and expand a coding community.
      Founders: Simon Shain, Meher Nagi, and Cristian Stafford.
      Features: Gaming, Forums, Private Messages, Daily Streaks.
      Rule: If unsure, suggest asking in the Forums.
    `;

    // 3. Call Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: PAL_SYSTEM_PROMPT },
        { role: "user", content: userMessage }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
    });

    // 4. Return the response
    return new Response(JSON.stringify({ 
      response: chatCompletion.choices[0].message.content 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Groq API error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}