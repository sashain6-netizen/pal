import { Groq } from 'groq-sdk';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // 1. Accept 'history' from the frontend (an array of {role, content})
    const { userMessage, history = [] } = await request.json();

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
      - Forums: Public/Private threads.
      - Games: Large library; Full Screen/Windowed.
      - Apps: Categorized feature-rich tools.
      - Proxy: Private browsing tab.
      - AI Module: You (this assistant).
      - Contacts: Discord, Instagram, and YouTube links.

      ## 4. USER ECONOMY & SOCIAL
      - Currency: Earned via Daily Streaks.
      - XP & Levels: Increases via activity and Follower count.
      - Social Actions: Message, follow, and view public stats.

      # RESPONSE GUIDELINES
      - NEVER speculate.
      - Maximum 2 paragraphs per response.
    `;

    // 2. Format the Conversation History
    // We take the last 3 messages from the history provided by the frontend
    const limitedHistory = history.slice(-3);

    // 3. Construct the full message list for Groq
    const messages = [
      { role: "system", content: PAL_SYSTEM_PROMPT },
      ...limitedHistory,
      { role: "user", content: userMessage }
    ];

    // 4. Call Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
    });

    const aiResponse = chatCompletion.choices[0].message.content;

    // 5. Return the response
    return new Response(JSON.stringify({ 
      response: aiResponse 
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