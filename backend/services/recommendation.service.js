const axios = require('axios');

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL || 'http://localhost:4000',
  headers: { 'x-internal-token': process.env.INTERNAL_API_TOKEN || '' },
  timeout: 320_000,
});

/**
 * تجميع المهارات الحقيقية للمستخدم من الخطوات والدروس المكتملة
 * @param {number} userId
 * @param {import('@prisma/client').PrismaClient} prisma
 * @returns {Promise<string[]>}
 */
async function getUserSkillsFromProgress(userId, prisma) {
  const acquiredSkills = new Set();

  // جلب الخطوات المكتملة
  const completedSteps = await prisma.userStepProgress.findMany({
    where: { userId, completed: true },
    select: { step: { select: { skills: true } } }
  });

  for (const { step } of completedSteps) {
    if (step.skills && Array.isArray(step.skills)) {
      step.skills.forEach(skill => acquiredSkills.add(skill));
    }
  }

  // جلب الدروس المكتملة (اختياري لزيادة الدقة)
  const completedLessons = await prisma.userLessonProgress.findMany({
    where: { userId, completed: true },
    select: { lesson: { select: { skills: true } } }
  });

  for (const { lesson } of completedLessons) {
    if (lesson.skills && Array.isArray(lesson.skills)) {
      lesson.skills.forEach(skill => acquiredSkills.add(skill));
    }
  }

  return [...acquiredSkills];
}

/**
 * جلب الـ recommendations لمستخدم معين
 * @param {number} userId
 * @param {import('@prisma/client').PrismaClient} prisma
 */
async function getRecommendations(userId, prisma) {
  // ── 1. جلب LP enrollments ─────────────────────────────────────────────
  const enrollments = await prisma.userLearningPath.findMany({
    where: { userId },
    include: { learningPath: { select: { id: true, title: true } } },
    orderBy: { enrolledAt: 'desc' },
  });

  if (!enrollments.length) {
    return { recommendations: [], reason: 'no_enrollment' };
  }

  const bestEnrollment = enrollments[0];
  const lpId = bestEnrollment.learningPathId;

  // ── 2. حساب المهارات الحقيقية ─────────────────────────────────────────
  const realSkills = await getUserSkillsFromProgress(userId, prisma);

  // ── 3. حساب progress (اختياري، يمكن إرساله للـ AI) ──────────────────
  const [completedSteps, totalSteps] = await Promise.all([
    prisma.userStepProgress.count({
      where: { userId, completed: true }
    }),
    prisma.step.count({
      where: {
        roadmap: {
          learningPaths: { some: { learningPathId: lpId } }
        }
      }
    })
  ]);

  const MAX_STEPS = Math.max(totalSteps, 1);
  const progressPct = Math.min(100, (completedSteps / MAX_STEPS) * 100);

  // ── 4. جلب الـ jobs المنشورة ──────────────────────────────────────────
  const jobs = await prisma.job.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { deadline: null },
        { deadline: { gte: new Date() } },
      ],
    },
    include: { learningPath: { select: { title: true } } },
    take: 100,
    orderBy: { postedAt: 'desc' },
  });

  if (!jobs.length) {
    return { recommendations: [], reason: 'no_jobs' };
  }

  // ── 5. استدعاء AI service ─────────────────────────────────────────────
  const { data } = await aiClient.post('/recommend', {
    user: {
      userId,
      learningPathTitle: bestEnrollment.learningPath.title,
      progressPercent: progressPct,
      skills: realSkills,              // <-- المهارات الحقيقية
      declaredSkills: [],              // يمكن إضافة يدوية من user profile لاحقاً
    },
    jobs: jobs.map((j) => ({
      id:               j.id,
      title:            j.title,
      description:      j.description,
      company:          j.company,
      location:         j.location   || null,
      jobType:          j.jobType,
      learningPathId:   j.learningPathId,
      learningPathTitle: j.learningPath?.title || '',
      experienceLevel:  j.experienceLevel || null,
      applyLink:        j.applyLink  || null,
      postedAt:         j.postedAt?.toISOString() ?? null,
      source:           j.source     || null,
    })),
    topN: 5,
  });

  return {
    recommendations: data.recommendations ?? [],
    meta: {
      userId,
      lpTitle: bestEnrollment.learningPath.title,
      progressPct: Math.round(progressPct),
      totalJobsScanned: jobs.length,
      skillsCount: realSkills.length,
    },
  };
}

/**
 * استخراج skills من job description (لتخزينها في عمود skills بالـ DB)
 * @param {{ id: number, title: string, description: string }[]} jobs
 */
async function batchExtractSkills(jobs) {
  const { data } = await aiClient.post('/batch-extract-skills', jobs);
  return data.results; // [{ jobId, skills: [...] }]
}

module.exports = { getRecommendations, batchExtractSkills };