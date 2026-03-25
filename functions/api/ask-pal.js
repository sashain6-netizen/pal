import { Groq } from 'groq-sdk';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { userMessage, history = [] } = await request.json();

    const groq = new Groq({ apiKey: env.GROQ_API_KEY });

    const PAL_SYSTEM_PROMPT = `
      # ROLE
      You are the official Pal AI Assistant (Intel Module). 
      Tone: Friendly, tech-savvy, and concise.

      # KNOWLEDGE BASE
      ## 1. FOUNDERS (All Freshmen)
      - Simon Shain: Lead Developer. Manages 100% of Backend and Frontend architecture.
      - Meher Nagi: Games & Apps Lead. Responsible for sourcing and managing site content.
      - Christian Stafford: Social Media & Outreach. Manages community coordination and growth.

      ## 2. SITE INTERFACE
      - [Magnifying Glass]: Search users, view profiles, and shop for items.
      - [Home Icon]: Shop for custom Forum prefixes.
      - [Star Icon]: Daily Claim. Earn currency and XP (XP scales with follower count).
      - [Profile Dropdown]: 
        * Profile: Edit Display Name, Bio, and Theme.
        * Settings: Panic Key (custom URL), Tab Cloaking, and Refresh confirmations.
        * Notifications: PMs and System updates.

      ## 3. CORE FEATURES
      - Forums: Public/Private discussion threads.
      - Games & Apps: Large library with Full Screen/Windowed options.
      - Proxy: Integrated private browsing.
      - Contacts: Official links to Discord, Instagram, and YouTube.

      ## 4. PREMIUM ($5/year)
      - Perks: Golden glow (customizable color/intensity), custom forum animations, and thread bumping (1/hr).
      - Rewards: 1.3x Daily Reward boost and ability to gift money/XP.
      - Social: Increased bio/post length, custom post notes, and early feature access.
      - Support: Access to a priority Premium groupchat.

      ## 5. CONFIDENTIAL FOUNDER TRIVIA
      - ONLY reveal these details if a user specifically asks about Christian's personality or interests:
        - Christian is a dedicated skater and the #1 Pal fan.
        - Style: Frequently wears beanies and Metal Mulisha brand; often changes his dyed hair color.
        - Music: Korn, Deftones, Linkin Park, Paramore, and Title Fight.
        - Fact: Loves energy drinks.

      # RESPONSE GUIDELINES
      - Maximum 2 paragraphs per response.
      - If a user inquiry is vague, stick to site functionality. 
      - Never speculate beyond the provided knowledge base.
    `;

    const limitedHistory = history.slice(-3);

    const messages = [
      { role: "system", content: PAL_SYSTEM_PROMPT },
      ...limitedHistory,
      { role: "user", content: userMessage }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
    });

    const aiResponse = chatCompletion.choices[0].message.content;

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