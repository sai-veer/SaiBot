import express from 'express';
import Chat from '../models/Chat.js';
import ChatSession from '../models/ChatSession.js';
import authMiddleware from '../middleware/authMiddleware.js';

import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();


const router = express.Router();

// 🔐 Protect all routes with auth middleware
router.use(authMiddleware);

// All route definitions below...

router.get('/sessions', async (req, res) => {
  const userId = req.userId; // Now available from JWT
  const sessions = await ChatSession.find({ userId });
  res.json(sessions);
});

router.post('/session', async (req, res) => {
  const userId = req.userId;
  const { name } = req.body;

  const newSession = await ChatSession.create({ userId, name });
  res.json(newSession);
});

router.put('/:id', async (req, res) => {
  const { name } = req.body;
  const session = await ChatSession.findByIdAndUpdate(req.params.id, { name }, { new: true });
  res.json(session);
});

router.delete('/:id', async (req, res) => {
  await ChatSession.findByIdAndDelete(req.params.id);
  await Chat.deleteMany({ sessionId: req.params.id });
  res.json({ success: true });
});

router.get('/:id', async (req, res) => {
  const messages = await Chat.find({ sessionId: req.params.id });
  res.json(messages);
});

router.post('/:id', async (req, res) => {
  const { message } = req.body;
  const sessionId = req.params.id;
  const userId = req.userId;

  // Save user message
  const userMsg = await Chat.create({
    sessionId,
    userId,
    sender: 'user',
    message
  });

let botReply = "⚠️ Could not generate a reply.";

try {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama3-8b-8192", // ✅ updated model
      messages: [{ role: "user", content: message }]
    })
  });

  const data = await response.json();

  if (data?.choices?.[0]?.message?.content) {
    botReply = data.choices[0].message.content.trim();
  } else if (data?.error?.message) {
    botReply = `⚠️ Groq API Error: ${data.error.message}`;
  } else {
    botReply = "🤖 No valid reply received.";
  }
} catch (err) {
  console.error("❌ Groq API call failed:", err);
}



  // Save bot message
  const botMsg = await Chat.create({
    sessionId,
    userId,
    sender: 'bot',
    message: botReply
  });

  res.json([userMsg, botMsg]);
});


router.delete('/:id/messages', async (req, res) => {
  await Chat.deleteMany({ sessionId: req.params.id });
  res.json({ success: true });
});

export default router;
