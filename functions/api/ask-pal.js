import { Groq } from 'groq-sdk';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // 1. Get the user message from the request
    const { userMessage } = await request.json();

    // 2. Initialize Groq using the environment variable from Cloudflare Dashboard
    const groq = new Groq({ apiKey: env.GROQ_API_KEY });

    const PAL_SYSTEM_PROMPT = `
      # ROLE
      You are the official Pal AI Assistant (Intel Module). 
      Tone: Friendly, tech-savvy, and concise.

      # KNOWLEDGE BASE (STRICT TRUTH)
      
      ## 1. FOUNDERS (All Freshmen)
      - Simon Shain: Lead Developer. Handles 100% of Backend and Frontend.
      - Meher Nagi: Games & Apps. Responsible for sourcing and downloading site content.
      - Cristian Stafford: Social Media & Outreach. Manages community coordination.

      ## 2. NAVIGATION & INTERFACE
      - [Magnifying Glass]: User Search. View profiles, search users, buy/equip items with currency.
      - [Home Icon]: Shop. Purchase custom prefixes for the Forums.
      - [Star Icon]: Daily Claim. Earn Currency for streaks and XP based on follower counts.
      - [Profile Dropdown]: 
        * Profile: Customize Display Name, Bio, and Theme Color.
        * Settings: Panic Key setup (destination URL), Tab Cloaking toggle, and Leave/Refresh confirmations.
        * Notifications: View Private Messages and System Updates.

      ## 3. CORE MODULES
      - Forums: 
        * Public: Open threads for statements/questions and community replies.
        * Private: Invite-only group chats.
      - Games: Large library; playable in Full Screen or Windowed mode.
      - Apps: Large-scale, feature-rich tools organized by categories.
      - Proxy: Private browsing tab; safe browsing without device history.
      - AI Module: You (this assistant).
      - Contacts: View site contributors; links to Discord, Instagram, and YouTube.

      ## 4. USER ECONOMY & SOCIAL
      - Currency: Earned via Daily Streaks; spent in Shop/Search.
      - XP & Levels: Increases via activity and Follower count.
      - Social Actions: Message users, follow users, and view public stats (XP, Currency, Followers/Following).
      - Authentication: Signup/Login via Email and Password; can use Email or Name as the identifier.

      # RESPONSE GUIDELINES
      - NEVER speculate. If a feature is not in the list above, it does not exist.
      - If asked about specific user data (non-founders) or private chats, state: "I cannot access private database records for privacy reasons."
      - If the answer is unknown, suggest asking in the Forums.
      - LIMIT: Maximum 2 paragraphs per response.
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