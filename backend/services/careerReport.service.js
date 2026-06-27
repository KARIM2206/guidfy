// backend/services/careerReport.service.js
const axios = require('axios');
const prisma = require('../prismaClient');
const { getRecommendationForSkill } = require('./careerRecommendations');

// Since recommend.service.js is not cleanly exporting getUserSkillsFromProgress,
// we will duplicate that precise logic here to ensure it works cleanly.
function parseSkills(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(s => String(s).toLowerCase().trim()).filter(Boolean);
  if (typeof raw === 'string') {
    if (raw.startsWith('[')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(s => String(s).toLowerCase().trim()).filter(Boolean);
      } catch (_) {}
    }
    return raw.split(',').map(s => s.toLowerCase().trim()).filter(Boolean);
  }
  return [];
}

async function getAcquiredSkills(userId) {
  const acquired = new Set();

  // 1. Completed Steps
  const completedStepProgress = await prisma.userStepProgress.findMany({
    where: { userId, completed: true },
    select: { step: { select: { skills: true } } },
  });
  
  for (const { step } of completedStepProgress) {
    parseSkills(step?.skills).forEach(s => acquired.add(s));
  }

  // 2. Completed Lessons
  const completedLessonProgress = await prisma.userLessonProgress.findMany({
    where: { userId, completed: true },
    select: { lesson: { select: { skills: true } } },
  });
  
  for (const { lesson } of completedLessonProgress) {
    parseSkills(lesson?.skills).forEach(s => acquired.add(s));
  }

  return [...acquired];
}

const CAREER_REQUIREMENTS = {
  "frontend": ["html", "css", "javascript", "react", "next.js", "tailwind", "typescript", "git"],
  "backend": ["node.js", "express", "sql", "mongodb", "docker", "api design", "git", "javascript"],
  "full stack": ["html", "css", "javascript", "react", "node.js", "sql", "docker", "git"],
  "data science": ["python", "pandas", "numpy", "sql", "machine learning", "scikit-learn"],
  "ai/ml": ["python", "tensorflow", "pytorch", "machine learning", "neural networks", "pandas"],
  "devops": ["linux", "docker", "kubernetes", "aws", "ci/cd", "terraform", "bash"],
  "mobile": ["react native", "javascript", "git", "mobile ui"]
};

async function getCareerMatch(skills) {
  try {
    // Send to existing local AI engine
    const response = await axios.post('http://127.0.0.1:5050/predict', {
      experience: "beginner",
      education: "bachelor",
      skills: skills,
      interest: ""
    }, { timeout: 10000 });

    const data = response.data;
    if (data && data.top_paths && data.top_paths.length > 0) {
      const topMatch = data.top_paths[0];
      return {
        career: topMatch.path,
        score: Math.round(topMatch.confidence * 100)
      };
    }
  } catch (error) {
    console.error("[CareerReportService] Failed to contact AI engine, using fallback logic.", error.message);
  }

  // Fallback Logic if AI engine is down
  let bestCareer = "Software Engineer";
  let bestScore = 0;

  for (const [career, required] of Object.entries(CAREER_REQUIREMENTS)) {
    const matchCount = required.filter(req => skills.includes(req)).length;
    const score = Math.round((matchCount / required.length) * 100);
    if (score > bestScore) {
      bestScore = score;
      bestCareer = career.charAt(0).toUpperCase() + career.slice(1);
    }
  }

  return { career: bestCareer, score: bestScore || 10 };
}

function calculateMissingSkills(career, acquiredSkills) {
  const careerKey = Object.keys(CAREER_REQUIREMENTS).find(k => career.toLowerCase().includes(k));
  if (!careerKey) return ["General Programming", "Algorithms", "System Design"];

  const required = CAREER_REQUIREMENTS[careerKey];
  const missing = required.filter(req => !acquiredSkills.includes(req));
  return missing.length > 0 ? missing : ["Advanced Topics"];
}

async function getRoadmapCompletion(userId) {
  const progress = await prisma.userRoadmapProgress.aggregate({
    where: { userId },
    _avg: { progressPercentage: true }
  });
  return progress._avg.progressPercentage || 0;
}

async function generateAnalysis(userId) {
  const skills = await getAcquiredSkills(userId);
  const matchInfo = await getCareerMatch(skills);
  const missingSkills = calculateMissingSkills(matchInfo.career, skills);
  const roadmapAvg = await getRoadmapCompletion(userId);

  // Score is a weighted combination of their match score (60%) and their roadmap progress (40%)
  const readinessScore = Math.min(100, Math.round((matchInfo.score * 0.6) + (roadmapAvg * 0.4)));

  return {
    career: matchInfo.career,
    matchScore: matchInfo.score,
    readinessScore,
    acquiredSkills: skills,
    missingSkills
  };
}

module.exports = { generateAnalysis };
