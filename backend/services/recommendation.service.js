const axios = require('axios');

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL || 'http://localhost:4000',
  headers: { 'x-internal-token': process.env.INTERNAL_API_TOKEN || '' },
  timeout: 120_000,
});

// ══════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════

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

function normalizeScore(rawScore) {
  // Absolute mapping من [-1, 1] إلى [0, 100]
  // Calibrated لـ compute_score() output
  const r = rawScore ?? -1;
  if (r < -0.2) return Math.round(Math.max(0, 35 + (r + 0.2) / 0.8 * 35));
  if (r < 0.0)  return Math.round(35 + (r + 0.2) / 0.2 * 15);
  if (r < 0.1)  return Math.round(50 + (r / 0.1) * 10);
  if (r < 0.2)  return Math.round(60 + ((r - 0.1) / 0.1) * 12);
  if (r < 0.4)  return Math.round(72 + ((r - 0.2) / 0.2) * 13);
  return Math.round(Math.min(95, 85 + ((r - 0.4) / 0.6) * 10));
}

function buildExplanation({ matchedSkills, missingSkills, matchDetails }) {
  const lines = [];
  const md = matchDetails || {};

  if (matchedSkills && matchedSkills.length > 0) {
    const preview = matchedSkills.slice(0, 3).join(', ');
    const more    = matchedSkills.length > 3 ? '…' : '';
    lines.push(
      `You already know ${matchedSkills.length} required skill${matchedSkills.length > 1 ? 's' : ''}: ${preview}${more}`
    );
  }

  if (missingSkills && missingSkills.length > 0) {
    lines.push(
      `Learning ${missingSkills.slice(0, 3).join(', ')} will make you a strong candidate`
    );
  }

  if ((md.freshness   ?? 0) >= 0.9) lines.push('This is a very recent job posting');
  if ((md.lpAlignment ?? 0) >= 0.8) lines.push('This job aligns well with your learning path');
  if ( md.expMatch === true        ) lines.push('Your experience level matches the job requirements');
  if ((md.careerFit   ?? 0) >= 0.5) lines.push('Your career title is a strong fit for this role');

  if (!lines.length)
    lines.push('This job was selected based on your learning path and profile');

  return lines;
}

// ── إصلاح: استخراج المهارات القياسية القادمة مباشرة من الـ AI Service ──
function resolveJobSkills(job, md) {
  const fromDb = parseSkills(job?.skills);
  if (fromDb.length > 0) return fromDb;

  // Fallback ذكي: الاعتماد المباشر على ما استخرجه الـ AI Extractor في الـ matchDetails
  const matched = md.matchedSkills ?? [];
  const missing = md.missingSkills ?? [];
  return [...new Set([...matched, ...missing])];
}

function enrichRecommendation(rec, jobsMap, userSkillSet) {
  const job = jobsMap.get(rec.jobId);
  const md  = rec.matchDetails || {};

  // ── إصلاح: حماية تدفق المهارات لمنع المصفوفات الفارغة ──────────────────
  const jobSkills = resolveJobSkills(job, md);
  
  // إذا كان الـ AI أرسل الـ Matched والـ Missing جاهزين، نستخدمهم مباشرة كـ الحق الفعلي للمطابقة
  const matchedSkills = md.matchedSkills && md.matchedSkills.length > 0 
    ? md.matchedSkills 
    : jobSkills.filter(s => userSkillSet.has(s.toLowerCase().trim()));

  const missingSkills = md.missingSkills && md.missingSkills.length > 0
    ? md.missingSkills
    : jobSkills.filter(s => !userSkillSet.has(s.toLowerCase().trim()));

  const skillGapPct = rec.skillGapPct ?? (jobSkills.length > 0
    ? Math.round((missingSkills.length / jobSkills.length) * 100)
    : 0);

  return {
    ...rec,
    score:    normalizeScore(rec.rawScore ?? rec.score),
    rawScore: rec.rawScore ?? rec.score,

    // ── حقول المهارات المحدثة في الـ Top-Level ──────────────────────────
    jobSkills,        
    matchedSkills,    
    missingSkills,    
    skillGapPct,

    features: {
      skillOverlap: md.skillOverlap ?? rec.features?.skillOverlap ?? 0,
      freshness:    md.freshness    ?? rec.features?.freshness    ?? 0,
      lpAlignment:  md.lpAlignment  ?? rec.features?.lpAlignment  ?? 0,
      careerFit:    md.careerFit    ?? rec.features?.careerFit    ?? 0,
      readiness:    md.readiness    ?? Math.max(0, 1 - (md.learningGap ?? 0)),
    },

    explanation: md.explanation && md.explanation.length > 0 
      ? md.explanation 
      : buildExplanation({ matchedSkills, missingSkills, matchDetails: md }),

    title:           job?.title           ?? rec.title,
    company:         job?.company         ?? rec.company,
    location:        job?.location        ?? rec.location,
    jobType:         job?.jobType         ?? rec.jobType,
    experienceLevel: job?.experienceLevel ?? rec.experienceLevel,
    applyLink:       job?.applyLink       ?? rec.applyLink,
    source:          job?.source          ?? rec.source,
    postedAt:        job?.postedAt?.toISOString?.() ?? job?.postedAt ?? rec.postedAt,
  };
}

// ══════════════════════════════════════════════════════
// USER SKILLS
// ══════════════════════════════════════════════════════

async function getUserSkillsFromProgress(userId, prisma) {
  const acquired = new Set();

  // المصدر 1: Steps المكتملة
  const completedStepProgress = await prisma.userStepProgress.findMany({
    where:  { userId, completed: true },
    select: { step: { select: { skills: true } } },
  });
  
  for (const { step } of completedStepProgress) {
    parseSkills(step?.skills).forEach(s => acquired.add(s));
  }

  // المصدر 2: Lessons المكتملة
  const completedLessonProgress = await prisma.userLessonProgress.findMany({
    where:  { userId, completed: true },
    select: { lesson: { select: { skills: true } } },
  });
  
  for (const { lesson } of completedLessonProgress) {
    parseSkills(lesson?.skills).forEach(s => acquired.add(s));
  }

  console.log(`[Backend] Total unique skills resolved for user ${userId}:`, acquired.size);
  return [...acquired];
}

// ══════════════════════════════════════════════════════
// MAIN RECOMMENDATION ROUTINE
// ══════════════════════════════════════════════════════

async function getRecommendations(userId, prisma) {
  // 1. Enrollment
  const enrollments = await prisma.userLearningPath.findMany({
    where:   { userId },
    include: { learningPath: { select: { id: true, title: true } } },
    orderBy: { enrolledAt: 'desc' },
  });

  if (!enrollments.length)
    return { recommendations: [], reason: 'no_enrollment' };

  const bestEnrollment = enrollments[0];
  const lpId           = bestEnrollment.learningPathId;

  // 2. User profile + skills بالتوازي
  const [realSkills, userProfile] = await Promise.all([
    getUserSkillsFromProgress(userId, prisma),
    prisma.user.findUnique({
      where:  { id: userId },
      select: { title: true, experienceYears: true },
    }),
  ]);

  const userSkillSet = new Set(realSkills.map(s => s.toLowerCase().trim()));

  // 3. Progress %
  const [completedCount, totalSteps] = await Promise.all([
    prisma.userStepProgress.count({ where: { userId, completed: true } }),
    prisma.step.count({
      where: { roadmap: { learningPaths: { some: { learningPathId: lpId } } } },
    }),
  ]);
  const progressPct = Math.min(
    100,
    (completedCount / Math.max(totalSteps, 1)) * 100
  );

  // 4. Jobs Query (تأمين جلب الوظائف النشطة)
  const jobs = await prisma.job.findMany({
    where: {
      OR: [{ deadline: null }, { deadline: { gte: new Date() } }],
    },
    select: {
      id: true, title: true, description: true, skills: true,
      company: true, location: true, jobType: true,
      learningPathId: true, experienceLevel: true,
      applyLink: true, source: true, postedAt: true,
      learningPath: { select: { title: true } },
    },
    take:    150,
    orderBy: { postedAt: 'desc' },
  });

  if (!jobs.length)
    return { recommendations: [], reason: 'no_jobs' };

  const jobsMap = new Map(jobs.map(j => [j.id, j]));

  // 5. بناء الـ Payload مع الحفاظ على الحقول المطلوبة للـ Feature Builder
  const aiPayload = {
    user: {
      userId,
      title:             userProfile?.title             || 'Developer',
      learningPathTitle: bestEnrollment.learningPath.title,
      progressPercent:   progressPct,
      skills:            realSkills,
      declaredSkills:    [], // يمكن ربطه لاحقاً بحقل المهارات المعلنة في جدول المستخدم
      experienceYears:   userProfile?.experienceYears ?? 0,
    },
    jobs: jobs.map(j => ({
      id:                 j.id,
      title:              j.title,
      description:        j.description || '',
      skills:             parseSkills(j.skills), 
      company:            j.company     || 'Unknown',
      location:           j.location    || null,
      jobType:            j.jobType     || 'FULL_TIME',
      learningPathId:     j.learningPathId,
      learningPathTitle: j.learningPath?.title || '',
      experienceLevel:   j.experienceLevel  || null,
      applyLink:          j.applyLink        || null,
      postedAt:           j.postedAt?.toISOString() ?? null,
      source:             j.source           || 'scraped',
    })),
    topN: jobs.length,
  };

  let aiData;
  try {
    const { data } = await aiClient.post('/recommend', aiPayload);
    aiData = data;
  } catch (err) {
    const code = err.code || err.response?.status;
    throw Object.assign(
      new Error(`AI service connection failure: ${err.message}`),
      { code }
    );
  }

  // 6. Enrich النتائج
  const enriched = (aiData.recommendations ?? []).map(rec =>
    enrichRecommendation(rec, jobsMap, userSkillSet)
  );

  // 7. Meta Analytics للحسابات الإحصائية بلوحة التحكم
  const avgScore = enriched.length
    ? Math.round(enriched.reduce((s, r) => s + r.score, 0) / enriched.length)
    : 0;

  const avgSkillMatch = enriched.length
    ? Math.round(
        (enriched.reduce((s, r) => s + (r.features.skillOverlap ?? 0), 0) / enriched.length) * 100
      )
    : 0;

  return {
    recommendations: enriched,
    meta: {
      userId,
      lpTitle:          bestEnrollment.learningPath.title,
      progressPct:      Math.round(progressPct),
      totalJobsScanned: jobs.length,
      skillsCount:      realSkills.length,
      userSkills:       realSkills,
      avgScore,
      avgSkillMatch,
    },
  };
}

// ══════════════════════════════════════════════════════
// BATCH EXTRACT LAYER
// ══════════════════════════════════════════════════════

async function batchExtractSkills(jobs) {
  const { data } = await aiClient.post('/batch-extract-skills', jobs);
  return data.results;
}

module.exports = { getRecommendations, batchExtractSkills };