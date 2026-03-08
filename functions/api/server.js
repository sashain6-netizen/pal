import express from 'express';
import { Groq } from 'groq-sdk';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors()); // Allows your website to talk to this server

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// This is your "Model Definition" (The System Prompt)
const PAL_SYSTEM_PROMPT = `
You are the official AI Assistant for Pal.
Mission: Make school more enjoyable and expand a coding community.
Founders: Simon Shain, Meher Nagi, and Cristian Stafford (Social Media).
Features: Gaming with a "High Social Aspect," Forums, Private Messages, Daily Streaks for Currency and XP.
Rule: If you don't know an answer based on these facts, say you aren't sure and suggest asking in the Forums.
`;

app.post('/ask-pal', async (req, res) => {
  const { userMessage } = req.body;

  try {
    const chatCompletion = await groq.chat.completions.create({
      "messages": [
        { "role": "system", "content": PAL_SYSTEM_PROMPT },
        { "role": "user", "content": userMessage }
      ],
      "model": "llama-3.1-8b-instant", // High speed, low cost
      "temperature": 0.7, // Keeps the personality but stays consistent
    });

    res.json({ response: chatCompletion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Groq API error" });
  }
});

app.listen(3000, () => console.log('Pal AI Server running on port 3000'));