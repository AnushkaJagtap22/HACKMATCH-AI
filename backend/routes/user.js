const express = require('express');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/users — discover public profiles ─────────────────
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      skills,
      level,
      lookingForTeam,
      page = 1,
      limit = 12,
      search,
    } = req.query;

    const filter = { isPublic: true };

    if (skills) {
      const skillArr = skills.split(',').map(s => s.trim());
      filter.skills = { $in: skillArr };
    }
    if (level) filter.experienceLevel = level;
    if (lookingForTeam === 'true') filter.lookingForTeam = true;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    // Exclude self from results
    if (req.user) filter._id = { $ne: req.user._id };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('fullName username avatar bio skills experienceLevel lookingForTeam preferredRoles location createdAt')
        .sort({ lookingForTeam: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        hasMore: skip + users.length < total,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ── GET /api/users/suggested — AI placeholder ─────────────────
router.get('/suggested', protect, async (req, res) => {
  try {
    const me = await User.findById(req.user._id);

    // Basic skill-based matching (placeholder for future AI)
    const suggested = await User.find({
      _id: { $ne: req.user._id },
      isPublic: true,
      lookingForTeam: true,
      skills: { $in: me.skills || [] },
      experienceLevel: me.experienceLevel,
    })
      .select('fullName username avatar bio skills experienceLevel location')
      .limit(6);

    res.json({ suggested, note: 'AI-powered matching coming soon' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

module.exports = router;
