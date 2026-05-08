// backend/services/aiService.js
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:4000';
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN || '';

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  headers: {
    'x-internal-token': INTERNAL_TOKEN,
    'Content-Type': 'application/json'
  },
  timeout: 15_000
});

/**
 * استخراج المهارات من عنوان ووصف نصي
 * @param {string} title
 * @param {string} description
 * @returns {Promise<string[]>} قائمة canonical skill names
 */
async function extractSkillsFromText(title, description = '') {
  try {
    const { data } = await aiClient.post('/extract-skills', {
      title,
      description,
      useFuzzy: true   // نتركه مفعلاً لتحسين الالتقاط، يمكن تغييره لاحقاً
    });

    // data.skills: [{ canonical, rawMention, confidence, source }]
    const skillsList = data.skills.map(s => s.canonical);
    return [...new Set(skillsList)]; // إزالة التكرار
  } catch (error) {
    console.error('[AI Service] Skill extraction failed:', error.message);
    return []; // إذا فشل AI، نعيد مصفوفة فارغة ولن نخزن مهارات
  }
}
// أو المسار الصحيح

/**
 * تجميع المهارات الحقيقية لمستخدم معين بناءً على الخطوات المكتملة في مسار تعليمي
 * @param {number} userId
 * @param {number} learningPathId
 * @returns {Promise<string[]>} قائمة canonical skill names
 */
async function getUserSkillsFromSteps(userId, learningPathId) {
  // 1. جلب كل الخطوات المرتبطة بالـ LearningPath عبر الرودمابات
  const steps = await prisma.step.findMany({
    where: {
      roadmap: {
        learningPaths: { some: { learningPathId } }
      }
    },
    include: {
      stepProgress: { where: { userId } }   // تقدم المستخدم في كل خطوة
    }
  });

  const acquiredSkills = new Set();

  for (const step of steps) {
    const prog = step.stepProgress[0];
    // نعد الخطوة مكتملة إذا كانت completed = true أو نسبة التقدم 100
    if (prog && (prog.completed || prog.progressPercentage >= 100)) {
      if (step.skills && Array.isArray(step.skills)) {
        step.skills.forEach(skill => acquiredSkills.add(skill));
      }
    }
  }

  return [...acquiredSkills];
}

module.exports = { extractSkillsFromText,getUserSkillsFromSteps };