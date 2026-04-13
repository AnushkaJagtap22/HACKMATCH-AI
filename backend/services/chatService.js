/**
 * AI Chat Assistant Service
 * =========================
 * Provides context-aware responses about profile improvement,
 * skill suggestions, role guidance, and team strategy.
 *
 * Uses OpenAI GPT if API key is set, falls back to rule-based responses.
 */

let OpenAI;
try {
  OpenAI = require('openai').default || require('openai').OpenAI;
} catch (_) {}

const openaiClient = process.env.OPENAI_API_KEY && OpenAI
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const SYSTEM_PROMPT = `You are HackMatch AI Assistant, an expert career coach and hackathon strategist embedded in the HackMatch platform.

Your role is to help developers:
1. Improve their profiles to attract better team matches
2. Identify skill gaps based on their current stack
3. Suggest what role they'd excel at in a hackathon team
4. Give actionable advice about team composition
5. Recommend skills to learn next

Be concise, practical, and encouraging. Use bullet points when listing items.
Base answers on the user's actual profile data provided. Keep responses under 200 words.
Never make up user data — only reference what is provided in the context.`;

/**
 * Rule-based fallback when no OpenAI key is configured.
 */
function ruleBasedResponse(message, userContext) {
  const msg = message.toLowerCase();
  const skills = userContext.skills || [];
  const level = userContext.experienceLevel || 'Beginner';
  const projects = userContext.projects?.length || 0;

  if (msg.includes('role') || msg.includes('what should i')) {
    const hasML = skills.some(s => ['pytorch', 'tensorflow', 'sklearn', 'langchain'].includes(s.toLowerCase()));
    const hasFrontend = skills.some(s => ['react', 'vue', 'angular', 'next.js'].includes(s.toLowerCase()));
    const hasBackend = skills.some(s => ['node.js', 'python', 'django', 'fastapi', 'express'].includes(s.toLowerCase()));
    const role = hasML ? 'ML/AI Engineer' : hasFrontend ? 'Frontend Developer' : hasBackend ? 'Backend Developer' : 'Fullstack Developer';
    return `Based on your skills, you'd excel as a **${role}**. In hackathons, focus on your strongest technologies to deliver maximum value within the time limit.`;
  }

  if (msg.includes('improve') || msg.includes('profile')) {
    const tips = [];
    if (!userContext.bio) tips.push('Add a bio describing your passion and goals');
    if (skills.length < 5) tips.push('Add more skills (aim for 8-12)');
    if (projects < 2) tips.push('Add at least 2 projects with GitHub links');
    if (!userContext.githubUsername) tips.push('Connect your GitHub username');
    if (!userContext.resumeUrl) tips.push('Upload your resume for better matching');
    if (tips.length === 0) return 'Your profile looks great! Toggle "Open to Team" to start getting matched.';
    return `Here's how to boost your profile completeness:\n${tips.map(t => `• ${t}`).join('\n')}`;
  }

  if (msg.includes('skill') || msg.includes('learn')) {
    const hasBackend = skills.some(s => s.toLowerCase().includes('python') || s.toLowerCase().includes('node'));
    const hasFrontend = skills.some(s => s.toLowerCase().includes('react') || s.toLowerCase().includes('vue'));
    if (hasFrontend && !hasBackend) return 'Since you know frontend, consider learning **Node.js** or **Python/FastAPI** to become fullstack — highly valued in hackathons.';
    if (hasBackend && !hasFrontend) return 'As a backend dev, learning **React** would make you fullstack and much more valuable in hackathons where frontend is often the bottleneck.';
    if (level === 'Beginner') return 'Focus on one stack deeply: React + Node.js is an excellent hackathon combo. Add PostgreSQL and you\'re ready to build anything.';
    return 'Consider adding **Docker** and **AWS basics** — deployment knowledge makes you the MVP in every hackathon team.';
  }

  if (msg.includes('team') || msg.includes('match')) {
    return `For the best matches:\n• Set "Open to Team" in your settings\n• Add clear skills and interests\n• Complete your profile (aim for 80%+)\n• Click "Match Me" on the dashboard to trigger AI team formation instantly.`;
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hey ${userContext.fullName?.split(' ')[0] || 'there'}! 👋 I'm your HackMatch AI assistant. I can help you improve your profile, suggest skills to learn, or explain how team matching works. What would you like to know?`;
  }

  return `Great question! Here are some tips based on your ${level} level with ${skills.length} skills:\n• Keep your profile updated — the AI uses it for matching\n• Projects with GitHub links score 30% higher\n• Sharing interests helps align you with compatible teammates\n\nAsk me about roles, skills to learn, or how to improve your profile!`;
}

/**
 * Main chat handler.
 * @param {string} message - User's message
 * @param {Object} userContext - Relevant user profile fields
 * @param {Array} history - Previous messages [{role, content}]
 */
async function chat(message, userContext, history = []) {
  // Try OpenAI first
  if (openaiClient) {
    try {
      const contextStr = JSON.stringify({
        name: userContext.fullName,
        skills: userContext.skills,
        experienceLevel: userContext.experienceLevel,
        bio: userContext.bio,
        projectCount: userContext.projects?.length,
        githubUsername: userContext.githubUsername,
        profileCompleteness: userContext.profileCompleteness,
        interests: userContext.interests,
        preferredRoles: userContext.preferredRoles,
      });

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: `User profile context: ${contextStr}` },
        ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: message },
      ];

      const response = await openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      });

      return {
        response: response.choices[0].message.content,
        source: 'openai',
      };
    } catch (err) {
      console.warn('OpenAI fallback:', err.message);
    }
  }

  // Rule-based fallback
  return {
    response: ruleBasedResponse(message, userContext),
    source: 'rule-based',
  };
}

module.exports = { chat };
