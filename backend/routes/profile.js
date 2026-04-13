const express = require('express');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { parseResume } = require('../services/resumeParser');
const { buildSkillVector } = require('../services/matchingEngine');

const router = express.Router();

['uploads/avatars', 'uploads/resumes'].forEach(dir => {
  const full = path.join(__dirname, '..', dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

// ── GET /api/profile ──────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ── PUT /api/profile ──────────────────────────────────────────
router.put('/', protect, [
  body('fullName').optional().trim().isLength({ min: 2, max: 60 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('skills').optional().isArray(),
  body('experienceLevel').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const allowed = [
      'fullName', 'bio', 'skills', 'interests', 'experienceLevel', 'location',
      'website', 'githubUsername', 'linkedinUrl', 'twitterHandle',
      'isPublic', 'lookingForTeam', 'preferredRoles', 'username',
    ];

    const updates = {};
    const unsets = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'username' && String(req.body[field]).trim() === '') {
          unsets[field] = 1;
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    if (updates.skills) {
      updates.skills = [...new Set(updates.skills.map(s => s.trim()).filter(Boolean))];
      // Recompute skill vector for AI matching
      updates.skillVector = buildSkillVector(updates.skills);
    }

    if (updates.username) {
      const existing = await User.findOne({ username: updates.username, _id: { $ne: req.user._id } });
      if (existing) return res.status(409).json({ error: 'Username already taken' });
    }

    // Update lastActive timestamp
    updates.lastActive = new Date();

    const updateQuery = { $set: updates };
    if (Object.keys(unsets).length > 0) {
      updateQuery.$unset = unsets;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateQuery,
      { new: true, runValidators: false }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated', user: user.toSafeObject() });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ── POST /api/profile/avatar ──────────────────────────────────
router.post('/avatar', protect, (req, res) => {
  upload.single('avatar')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const user = await User.findById(req.user._id);

      if (user.avatar && user.avatar.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      user.avatar = avatarUrl;
      user.lastActive = new Date();
      await user.save({ validateBeforeSave: false });

      res.json({ message: 'Avatar uploaded', avatarUrl, user: user.toSafeObject() });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save avatar' });
    }
  });
});

// ── POST /api/profile/resume — Upload + auto-parse ────────────
router.post('/resume', protect, (req, res) => {
  upload.single('resume')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
      const resumeUrl = `/uploads/resumes/${req.file.filename}`;
      const filePath = path.join(__dirname, '..', 'uploads', 'resumes', req.file.filename);

      const user = await User.findById(req.user._id);

      // Delete old resume
      if (user.resumeUrl && user.resumeUrl.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', user.resumeUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // Parse the PDF
      const parsed = await parseResume(filePath);

      user.resumeUrl = resumeUrl;
      user.lastActive = new Date();

      if (parsed.success) {
        user.resumeParsedData = {
          extractedSkills: parsed.extractedSkills,
          extractedExperience: parsed.extractedExperience,
          extractedProjects: parsed.extractedProjects,
          parsedAt: parsed.parsedAt,
        };

        // Auto-merge extracted skills (non-destructive)
        if (parsed.extractedSkills?.length) {
          const existingSkills = new Set((user.skills || []).map(s => s.toLowerCase()));
          const newSkills = parsed.extractedSkills.filter(s => !existingSkills.has(s.toLowerCase()));
          user.skills = [...(user.skills || []), ...newSkills].slice(0, 20);
          user.skillVector = buildSkillVector(user.skills);
        }
      }

      await user.save({ validateBeforeSave: false });

      res.json({
        message: 'Resume uploaded and parsed',
        resumeUrl,
        parsed: parsed.success ? {
          extractedSkills: parsed.extractedSkills,
          extractedExperience: parsed.extractedExperience,
          extractedProjects: parsed.extractedProjects,
          newSkillsAdded: parsed.extractedSkills?.length || 0,
        } : null,
        parseError: parsed.success ? null : parsed.error,
        user: user.toSafeObject(),
      });
    } catch (e) {
      console.error('Resume upload error:', e);
      res.status(500).json({ error: 'Failed to save resume' });
    }
  });
});

// ── POST /api/profile/projects ────────────────────────────────
router.post('/projects', protect, [
  body('title').trim().notEmpty().withMessage('Title required').isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const user = await User.findById(req.user._id);
    if (user.projects.length >= 20) return res.status(400).json({ error: 'Maximum 20 projects allowed' });

    const { title, description, githubUrl, liveUrl, techStack, featured } = req.body;
    user.projects.push({ title, description, githubUrl, liveUrl, techStack: techStack || [], featured: featured || false });
    await user.save();

    res.status(201).json({ message: 'Project added', user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add project' });
  }
});

// ── PUT /api/profile/projects/:projectId ─────────────────────
router.put('/projects/:projectId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const project = user.projects.id(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const { title, description, githubUrl, liveUrl, techStack, featured } = req.body;
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (githubUrl !== undefined) project.githubUrl = githubUrl;
    if (liveUrl !== undefined) project.liveUrl = liveUrl;
    if (techStack !== undefined) project.techStack = techStack;
    if (featured !== undefined) project.featured = featured;

    await user.save();
    res.json({ message: 'Project updated', user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// ── DELETE /api/profile/projects/:projectId ───────────────────
router.delete('/projects/:projectId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.projects = user.projects.filter(p => p._id.toString() !== req.params.projectId);
    await user.save();
    res.json({ message: 'Project deleted', user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ── GET /api/profile/:username (public) ──────────────────────
router.get('/:username', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const query = { isPublic: true };
    if (mongoose.Types.ObjectId.isValid(req.params.username)) {
      query.$or = [
        { username: req.params.username },
        { _id: req.params.username }
      ];
    } else {
      query.username = req.params.username;
    }

    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ error: 'Profile not found' });
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ── POST /api/profile/:id/outreach ────────────────────────────
router.post('/:id/outreach', protect, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot send outreach to yourself" });
    }
    
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const sender = await User.findById(req.user._id);

    // Notify the target user
    await targetUser.addNotification(
      'invitation',
      'Team Outreach Request',
      `${sender.fullName} wants you to be a part of their team!`,
      { senderId: sender._id, senderName: sender.fullName }
    );

    const { notifyUser } = require('../services/socketManager');
    notifyUser(targetUser._id, 'notification', {
      type: 'invitation',
      title: 'Team Outreach Request',
      message: `${sender.fullName} wants you to be a part of their team!`
    });

    res.json({ success: true, message: 'Outreach message sent successfully' });
  } catch (err) {
    console.error('Outreach error:', err);
    res.status(500).json({ error: 'Failed to send outreach' });
  }
});

module.exports = router;
