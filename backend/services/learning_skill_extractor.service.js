// backend/services/aiService.js
const axios = require('axios');
const prisma = require('../prismaClient'); // ← shared instance

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL || 'http://localhost:4000',
  headers: {
    'x-internal-token': process.env.INTERNAL_API_TOKEN || '',
    'Content-Type': 'application/json',
  },
  timeout: 120_000, // ← fix
});

// ── parseSkills هنا أو import من utils ──────────────────
function parseSkills(raw) {
  if (!raw) return [];
  if (Array.isArray(raw))
    return raw.map(s => String(s).toLowerCase().trim()).filter(Boolean);
  if (typeof raw === 'string') {
    if (raw.startsWith('[')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed))
          return parsed.map(s => String(s).toLowerCase().trim()).filter(Boolean);
      } catch (_) {}
    }
    return raw.split(',').map(s => s.toLowerCase().trim()).filter(Boolean);
  }
  return [];
}

async function extractSkillsFromText(title, description = '') {
  try {
    const { data } = await aiClient.post('/extract-skills', { title, description });
    return [...new Set(data.skills.map(s => s.canonical))];
  } catch (err) {
    console.error('[AI Service] extractSkills failed:', err.message);
    return [];
  }
}

async function getUserSkillsFromSteps(userId, learningPathId) {
  const steps = await prisma.step.findMany({
    where: {
      roadmap: {
        learningPaths: { some: { learningPathId } },
      },
    },
    include: {
      stepProgress: { where: { userId } },
    },
  });

  const acquired = new Set();
  for (const step of steps) {
    const prog = step.stepProgress[0];
    if (prog && (prog.completed || prog.progressPercentage >= 100)) {
      parseSkills(step?.skills).forEach(s => acquired.add(s)); // ← fix
    }
  }
  return [...acquired];
}

module.exports = { extractSkillsFromText, getUserSkillsFromSteps };