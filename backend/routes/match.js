const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const { generateTeams, rebalanceTeam, scoreTeam } = require('../services/matchingEngine');
const { notifyUser } = require('../services/socketManager');

const router = express.Router();

// ── POST /api/match — Run AI matching for the requesting user ─────
router.post('/', protect, async (req, res) => {
  try {
    const { teamSize = 4 } = req.body;

    // 1. Load the requester's full profile
    const requester = await User.findById(req.user._id);
    if (!requester) return res.status(404).json({ error: 'User not found' });

    if (!requester.skills?.length) {
      return res.status(400).json({
        error: 'Please add at least one skill to your profile before matching.',
      });
    }

    // 2. Fetch real candidates from DB — public users, not self
    const candidates = await User.find({
      _id: { $ne: req.user._id },
      isPublic: true,
      skills: { $exists: true, $not: { $size: 0 } },
    })
      .select('fullName username skills interests experienceLevel projects avatar bio teamHistory profileCompleteness lookingForTeam preferredRoles')
      .sort({ lastActive: -1 })
      .limit(50)
      .lean();

    if (candidates.length < 1) {
      return res.status(400).json({
        error: 'Not enough users in the pool yet. Invite teammates to join!',
      });
    }

    // 3. Run the matching engine
    const teams = generateTeams(requester.toObject(), candidates, Math.min(teamSize, 5));

    if (!teams.length) {
      return res.status(400).json({ error: 'Could not generate teams. Try adding more skills.' });
    }

    // 4. Save top team to requester's history
    const topTeam = teams[0];
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        teamHistory: {
          $each: [{
            teamId: topTeam.teamId,
            members: topTeam.members.map(m => ({ userId: m.userId, name: m.name, role: m.role })),
            score: topTeam.score,
            explanation: topTeam.explanation,
            breakdown: topTeam.breakdown,
            leader: topTeam.leader,
          }],
          $position: 0,
          $slice: 10,
        },
      },
    });

    // 5. Notify the requester via WebSocket
    notifyUser(req.user._id, 'team_matched', {
      type: 'team_match',
      title: 'Team Found!',
      message: `AI matched you with ${topTeam.members.map(m => m.name).join(', ')}`,
      score: topTeam.scorePercent,
    });

    // 6. Save notification to DB
    const userDoc = await User.findById(req.user._id);
    await userDoc.addNotification(
      'team_match',
      'AI Team Match Found!',
      `Your optimal team: ${topTeam.members.map(m => m.name).join(', ')} — ${topTeam.scorePercent}% compatibility`,
      { teamId: topTeam.teamId }
    );

    res.json({
      success: true,
      teams,
      candidatesPoolSize: candidates.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Match error:', err);
    res.status(500).json({ error: 'Matching failed. Please try again.' });
  }
});

// ── GET /api/match/history — Get user's past team suggestions ─────
router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('teamHistory');
    res.json({ history: user?.teamHistory || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch match history' });
  }
});

// ── POST /api/match/rebalance — Suggest improvements to a team ───
router.post('/rebalance', protect, async (req, res) => {
  try {
    const { teamId, memberIds } = req.body;
    if (!memberIds?.length) return res.status(400).json({ error: 'memberIds required' });

    const requester = await User.findById(req.user._id).lean();
    const currentMembers = await User.find({ _id: { $in: memberIds } }).lean();

    // Find new candidates not in current team
    const existingIds = [req.user._id.toString(), ...memberIds];
    const newCandidates = await User.find({
      _id: { $nin: existingIds },
      isPublic: true,
      skills: { $exists: true, $not: { $size: 0 } },
    })
      .select('fullName skills experienceLevel projects teamHistory')
      .limit(20)
      .lean();

    const suggestions = rebalanceTeam(currentMembers, newCandidates, requester);

    res.json({ suggestions, teamId });
  } catch (err) {
    console.error('Rebalance error:', err);
    res.status(500).json({ error: 'Rebalance failed' });
  }
});

// ── POST /api/match/accept — Accept a team match ─────────────────
router.post('/accept', protect, async (req, res) => {
  try {
    const { teamId } = req.body;
    await User.updateOne(
      { _id: req.user._id, 'teamHistory.teamId': teamId },
      { $set: { 'teamHistory.$.status': 'accepted', currentTeamId: teamId } }
    );
    res.json({ success: true, message: 'Team accepted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept team' });
  }
});

// ── POST /api/match/reject — Reject a team match ─────────────────
router.post('/reject', protect, async (req, res) => {
  try {
    const { teamId } = req.body;
    await User.updateOne(
      { _id: req.user._id, 'teamHistory.teamId': teamId },
      { $set: { 'teamHistory.$.status': 'rejected' } }
    );
    res.json({ success: true, message: 'Team rejected — run matching again for new suggestions' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject team' });
  }
});

module.exports = router;
