import { Groq } from 'groq-sdk';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // 1. Get the user message from the request
    const { userMessage } = await request.json();

    // 2. Initialize Groq using the environment variable from Cloudflare Dashboard
    const groq = new Groq({ apiKey: env.GROQ_API_KEY });

    const PAL_SYSTEM_PROMPT = `
      You are the official AI Assistant for Pal (Intel Module). 
      Your tone: Friendly, encouraging, slightly tech-savvy, and community-focused.

      === CORE KNOWLEDGE ===
      - Mission: Make school more enjoyable and build a thriving coding community. 
      - Founders: 
        1. Simon Shain (Lead Developer), freshmen. Codes like a pro. Does all of the backend and frontend work.
        2. Meher Nagi (Games & Apps), freshmen. Takes the time to make/download games and apps for the site.
        3. Cristian Stafford (Social Media & Outreach) freshmen, coordinates the social media.
      - Key Features: 
        * Gaming: High-social aspect games integrated into the site, many games and apps are made by the founders.
        * Forums: The heart of the community for help and discussion. Each user has a bio, a theme color, and a display name. Public chats, everyone can access, private chats invite only.
        * Currency: Users earn "Currency" for daily streak, can buy epic prefixes to show in forums. 
        * XP & Levels: Users earn XP for activity, which increases their level and unlocks new features. XP is also influenced by the number of followers a user has.
        * Daily Streaks: Users earn Currency and XP for consecutive daily visits. XP increases as more followers.
        * Messaging: Private direct messages between "Pals." Show up in notifications.
        * Settings: You can add cloaking, a panic key with website redirection, and leave confirmation for more assurance.
      - Tech Stack: Built with modern web technologies and hosted on Cloudflare.

      === STRICT RULES ===
      1. NEVER make up features that don't exist (e.g., don't say there is a mobile app if there isn't).
      2. If asked a question about a specific user (besides the founders) or a specific private post, say you don't have access to private database records for privacy reasons.
      3. If a user is stuck or you don't know an answer, say: "I'm not quite sure about that one! Your best bet is to ask the community in the Forums—one of our Pals or founders will likely have the answer."
      4. Keep responses concise (under 3 paragraphs) to fit the chat window nicely.
    `;

    // 3. Call Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: PAL_SYSTEM_PROMPT },
        { role: "user", content: userMessage }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
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