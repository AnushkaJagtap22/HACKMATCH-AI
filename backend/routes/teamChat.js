const express = require('express');
const { protect } = require('../middleware/auth');
const TeamChat = require('../models/TeamChat');
const User = require('../models/User');
const { notifyTeam } = require('../services/socketManager');

const router = express.Router();

// ── GET /api/team-chat/history/:teamId — Get history ──
router.get('/history/:teamId', protect, async (req, res) => {
  try {
    const { teamId } = req.params;
    const user = await User.findById(req.user._id);

    if (user.currentTeamId !== teamId) {
      return res.status(403).json({ error: 'You are not a member of this team' });
    }

    let chat = await TeamChat.findOne({ teamId });
    if (!chat) {
      chat = await TeamChat.create({ teamId, messages: [] });
    }

    res.json({ messages: chat.messages });
  } catch (err) {
    console.error('Fetch team chat error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ── POST /api/team-chat/send — Send text ──
router.post('/send', protect, async (req, res) => {
  try {
    const { teamId, text } = req.body;
    const user = await User.findById(req.user._id);

    if (user.currentTeamId !== teamId) {
      return res.status(403).json({ error: 'You are not a member of this team' });
    }

    if (!text?.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const newMessage = {
      senderId: req.user._id,
      senderName: user.fullName,
      text: text.trim(),
    };

    const chat = await TeamChat.findOneAndUpdate(
      { teamId },
      { $push: { messages: newMessage } },
      { new: true, upsert: true }
    );

    const addedMessage = chat.messages[chat.messages.length - 1];

    // Emit real-time message
    notifyTeam(teamId, 'team_message', addedMessage);

    res.json({ success: true, message: addedMessage });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
