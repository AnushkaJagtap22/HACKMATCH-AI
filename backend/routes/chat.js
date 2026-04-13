const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const { chat } = require('../services/chatService');

const router = express.Router();

// In-memory conversation history per user session (cleared on restart)
const conversationHistory = new Map();

// ── POST /api/chat — Send a message to the AI assistant ──────────
router.post('/', protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message required' });
    if (message.length > 500) return res.status(400).json({ error: 'Message too long (max 500 chars)' });

    // Load user context for AI
    const user = await User.findById(req.user._id)
      .select('fullName skills interests experienceLevel bio projects githubUsername profileCompleteness preferredRoles resumeUrl');

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get/init conversation history for this user
    const userId = req.user._id.toString();
    if (!conversationHistory.has(userId)) conversationHistory.set(userId, []);
    const history = conversationHistory.get(userId);

    // Get AI response
    const result = await chat(message, user.toObject(), history);

    // Update history (keep last 10 exchanges)
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: result.response });
    if (history.length > 20) history.splice(0, 2);
    conversationHistory.set(userId, history);

    res.json({
      response: result.response,
      source: result.source,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Chat service temporarily unavailable' });
  }
});

// ── DELETE /api/chat/history — Clear conversation ─────────────────
router.delete('/history', protect, (req, res) => {
  conversationHistory.delete(req.user._id.toString());
  res.json({ message: 'Conversation cleared' });
});

module.exports = router;
