/**
 * AI Matching Engine
 * ==================
 * Pure Node.js implementation — no Python dependency.
 * Uses cosine similarity on skill vectors + multi-dimensional scoring.
 *
 * Score = w1*complementarity + w2*experienceBalance + w3*diversity + w4*interestAlignment
 */

const { v4: uuidv4 } = require('uuid');

// ── Skill taxonomy for vectorization ─────────────────────────────
const SKILL_CATEGORIES = {
  frontend:   ['react', 'vue', 'angular', 'next.js', 'svelte', 'typescript', 'javascript', 'html', 'css', 'tailwind', 'figma', 'ui', 'ux'],
  backend:    ['node.js', 'express', 'python', 'django', 'fastapi', 'java', 'spring', 'go', 'rust', 'php', 'ruby', 'rails', 'graphql', 'rest'],
  ml_ai:      ['pytorch', 'tensorflow', 'sklearn', 'huggingface', 'langchain', 'llm', 'rag', 'nlp', 'computer vision', 'machine learning', 'deep learning', 'openai', 'embeddings'],
  data:       ['sql', 'postgresql', 'mongodb', 'mysql', 'redis', 'kafka', 'spark', 'pandas', 'dbt', 'elasticsearch', 'bigquery'],
  devops:     ['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'terraform', 'linux', 'nginx', 'github actions'],
  mobile:     ['react native', 'flutter', 'swift', 'kotlin', 'android', 'ios', 'dart'],
  blockchain: ['solidity', 'web3', 'ethereum', 'smart contracts', 'defi', 'nft'],
  design:     ['figma', 'ux', 'ui design', 'prototyping', 'user research', 'sketch', 'adobe xd'],
};

const CATEGORY_KEYS = Object.keys(SKILL_CATEGORIES);

// ── Experience level encoding ──────────────────────────────────────
const EXP_LEVELS = { Beginner: 1, Intermediate: 2, Advanced: 3 };

// ── Roles determined by skill categories ──────────────────────────
const CATEGORY_TO_ROLE = {
  frontend: 'Frontend Developer',
  backend: 'Backend Developer',
  ml_ai: 'ML/AI Engineer',
  data: 'Data Engineer',
  devops: 'DevOps Engineer',
  mobile: 'Mobile Developer',
  blockchain: 'Blockchain Developer',
  design: 'UX Designer',
};

/**
 * Build a normalized skill vector for a user profile.
 * Vector has one dimension per category (0..1 score).
 */
function buildSkillVector(skills = []) {
  const normalized = skills.map(s => s.toLowerCase().trim());
  return CATEGORY_KEYS.map(cat => {
    const catSkills = SKILL_CATEGORIES[cat];
    const matches = normalized.filter(s => catSkills.some(cs => s.includes(cs) || cs.includes(s)));
    return Math.min(matches.length / Math.max(catSkills.length * 0.3, 1), 1);
  });
}

/**
 * Cosine similarity between two vectors.
 */
function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length) return 0;
  const dot = a.reduce((sum, v, i) => sum + v * (b[i] || 0), 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

/**
 * Determine primary role for a user based on their skill categories.
 */
function assignRole(skills = []) {
  const vec = buildSkillVector(skills);
  const maxIdx = vec.indexOf(Math.max(...vec));
  return CATEGORY_TO_ROLE[CATEGORY_KEYS[maxIdx]] || 'Fullstack Developer';
}

/**
 * Get skill categories a user belongs to.
 */
function getUserCategories(skills = []) {
  const normalized = skills.map(s => s.toLowerCase().trim());
  return CATEGORY_KEYS.filter(cat => {
    const catSkills = SKILL_CATEGORIES[cat];
    return normalized.some(s => catSkills.some(cs => s.includes(cs) || cs.includes(s)));
  });
}

/**
 * Score a team composition.
 * Returns { total, breakdown, explanation }
 */
function scoreTeam(members, requester) {
  const all = [requester, ...members];

  // ── 1. Skill Complementarity ─────────────────
  // High score when team covers many categories with little overlap
  const allCats = new Set();
  const catCounts = {};
  all.forEach(m => {
    const cats = getUserCategories(m.skills || []);
    cats.forEach(c => {
      allCats.add(c);
      catCounts[c] = (catCounts[c] || 0) + 1;
    });
  });
  const totalCoverage = allCats.size / CATEGORY_KEYS.length;
  const redundancy = Object.values(catCounts).reduce((s, v) => s + Math.max(0, v - 1), 0) /
    Math.max(Object.values(catCounts).reduce((s, v) => s + v, 0), 1);
  const complementarity = Math.min(totalCoverage * (1 - redundancy * 0.4), 1);

  // ── 2. Experience Balance ─────────────────────
  const levels = all.map(m => EXP_LEVELS[m.experienceLevel] || 1);
  const avg = levels.reduce((s, v) => s + v, 0) / levels.length;
  const std = Math.sqrt(levels.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / levels.length);
  // Ideal: some variation (std 0.5–1.0), avg around 2
  const expBalance = Math.max(0, 1 - Math.abs(std - 0.7) * 0.5) * Math.max(0, 1 - Math.abs(avg - 2) * 0.3);

  // ── 3. Skill Diversity ────────────────────────
  const diversity = allCats.size >= 3 ? Math.min(allCats.size / 5, 1) : allCats.size / 3;

  // ── 4. Interest Alignment ─────────────────────
  const allInterests = all.flatMap(m => (m.interests || []).map(i => i.toLowerCase()));
  const interestSet = new Set(allInterests);
  const sharedCount = allInterests.length - interestSet.size;
  const alignment = allInterests.length > 0
    ? Math.min(sharedCount / allInterests.length + 0.3, 1)
    : 0.5;

  // ── Weighted total ────────────────────────────
  const w1 = 0.35, w2 = 0.25, w3 = 0.25, w4 = 0.15;
  const total = w1 * complementarity + w2 * expBalance + w3 * diversity + w4 * alignment;

  // ── Natural language explanation ──────────────
  const coveredCats = [...allCats].map(c => CATEGORY_TO_ROLE[c] || c).slice(0, 4);
  const levelNames = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };
  const levelMix = [...new Set(levels.map(l => levelNames[Math.round(l)]))].join(' + ');

  const explanation = `This team achieves ${coveredCats.join(', ')} coverage. ` +
    `Experience mix: ${levelMix}. ` +
    `Skill diversity score: ${Math.round(diversity * 100)}%. ` +
    (sharedCount > 0 ? `Shared interests detected, boosting collaboration potential.` :
      'Complementary skill sets minimize overlap and maximize output.');

  return {
    total: Math.round(total * 100) / 100,
    breakdown: {
      complementarity: Math.round(complementarity * 100),
      experienceBalance: Math.round(expBalance * 100),
      diversity: Math.round(diversity * 100),
      interestAlignment: Math.round(alignment * 100),
    },
    explanation,
    coveredCategories: [...allCats],
  };
}

/**
 * Select team leader using heuristics:
 * - Experience level (40%)
 * - Project count (30%)
 * - Skill diversity (20%)
 * - Has led before (10%)
 */
function selectLeader(members) {
  const scores = members.map(m => {
    const expScore = (EXP_LEVELS[m.experienceLevel] || 1) / 3;
    const projectScore = Math.min((m.projects?.length || 0) / 5, 1);
    const diversityScore = Math.min(getUserCategories(m.skills || []).length / 4, 1);
    const historyScore = (m.teamHistory?.some(t => t.status === 'accepted') ? 1 : 0) * 0.5;
    const total = 0.4 * expScore + 0.3 * projectScore + 0.2 * diversityScore + 0.1 * historyScore;
    return { member: m, score: total };
  });

  scores.sort((a, b) => b.score - a.score);
  const winner = scores[0]?.member;
  if (!winner) return null;

  const reasons = [];
  if (EXP_LEVELS[winner.experienceLevel] === 3) reasons.push('Advanced experience level');
  if ((winner.projects?.length || 0) >= 3) reasons.push('strong project portfolio');
  if (getUserCategories(winner.skills || []).length >= 3) reasons.push('broad skill coverage');
  if (!reasons.length) reasons.push('highest overall leadership score');

  return {
    userId: winner._id,
    name: winner.fullName,
    reason: reasons.join(', '),
  };
}

/**
 * Generate optimal team combinations from a pool of candidates.
 * Uses combinatorial search (up to 20 combos for performance).
 *
 * @param {Object} requester - The user requesting the match
 * @param {Array} candidates - Array of other users
 * @param {number} teamSize - Target team size (including requester)
 * @returns {Array} Top 3 team suggestions
 */
function generateTeams(requester, candidates, teamSize = 4) {
  const maxMembers = Math.min(teamSize - 1, candidates.length);
  if (maxMembers < 1) return [];

  // Generate combinations
  const combinations = [];
  const getCombinations = (arr, k) => {
    if (k === 0) return [[]];
    return arr.flatMap((v, i) =>
      getCombinations(arr.slice(i + 1), k - 1).map(c => [v, ...c])
    );
  };

  // Limit candidates to avoid O(n!) blowup — take top 12 by profile completeness
  const sortedCandidates = [...candidates]
    .sort((a, b) => (b.profileCompleteness || 0) - (a.profileCompleteness || 0))
    .slice(0, 12);

  const combos = getCombinations(sortedCandidates, Math.min(maxMembers, 3));

  const scored = combos.map(members => {
    const scored = scoreTeam(members, requester);
    const leader = selectLeader([requester, ...members]);
    const teamId = uuidv4();

    return {
      teamId,
      members: members.map(m => ({
        userId: m._id,
        name: m.fullName,
        role: assignRole(m.skills),
        experienceLevel: m.experienceLevel,
        skills: m.skills?.slice(0, 6),
        avatar: m.avatar,
        username: m.username,
      })),
      requesterRole: assignRole(requester.skills),
      score: scored.total,
      scorePercent: Math.round(scored.total * 100),
      breakdown: scored.breakdown,
      explanation: scored.explanation,
      coveredCategories: scored.coveredCategories,
      leader,
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

/**
 * Rebalance: suggest improved composition if a member leaves or new user joins.
 */
function rebalanceTeam(currentMembers, newCandidates, requester) {
  const improved = [];

  currentMembers.forEach((leaving, idx) => {
    const remaining = currentMembers.filter((_, i) => i !== idx);
    newCandidates.forEach(candidate => {
      const newTeam = [...remaining, candidate];
      const oldScore = scoreTeam(currentMembers, requester).total;
      const newScore = scoreTeam(newTeam, requester).total;
      if (newScore > oldScore + 0.05) {
        improved.push({
          removeUserId: leaving._id,
          removeName: leaving.fullName,
          addUserId: candidate._id,
          addName: candidate.fullName,
          scoreDelta: Math.round((newScore - oldScore) * 100),
          newScore: Math.round(newScore * 100),
          reason: `Replacing ${leaving.fullName} with ${candidate.fullName} improves skill coverage by ${Math.round((newScore - oldScore) * 100)} points.`,
        });
      }
    });
  });

  return improved.sort((a, b) => b.scoreDelta - a.scoreDelta).slice(0, 3);
}

module.exports = { generateTeams, scoreTeam, selectLeader, assignRole, buildSkillVector, rebalanceTeam };
