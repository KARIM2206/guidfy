// services/recommendation.service.js
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
  const MIN = -15, MAX = 5;
  const clamped = Math.max(MIN, Math.min(MAX, rawScore ?? MIN));
  return Math.round(((clamped - MIN) / (MAX - MIN)) * 100);
}

function buildExplanation({ matchedSkills, missingSkills, matchDetails }) {
  const lines = [];
  const md = matchDetails || {};

  if (matchedSkills.length > 0) {
    const preview = matchedSkills.slice(0, 3).join(', ');
    const more    = matchedSkills.length > 3 ? '…' : '';
    lines.push(
      `You already know ${matchedSkills.length} required skill${matchedSkills.length > 1 ? 's' : ''}: ${preview}${more}`
    );
  }

  if (missingSkills.length > 0) {
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

// ── FIX: يأخد skills من matchDetails لو jobsMap فاضية (SerpAPI jobs) ──
function resolveJobSkills(job, md) {
  const fromDb = parseSkills(job?.skills);
  if (fromDb.length > 0) return fromDb;

  // fallback: دمج matched + missing من matchDetails
  const matched = md.matchedSkills ?? [];
  const missing = md.missingSkills ?? [];
  return [...new Set([...matched, ...missing])];
}

function enrichRecommendation(rec, jobsMap, userSkillSet) {
  const job = jobsMap.get(rec.jobId);
  const md  = rec.matchDetails || {};

  // ── FIX: Skills صح من أي مصدر ────────────────────────────────────────
  const jobSkills     = resolveJobSkills(job, md);
  const matchedSkills = jobSkills.filter(s => userSkillSet.has(s));
  const missingSkills = jobSkills.filter(s => !userSkillSet.has(s));
  const skillGapPct   = jobSkills.length > 0
    ? Math.round((missingSkills.length / jobSkills.length) * 100)
    : 0;

  return {
    ...rec,
    score:    normalizeScore(rec.rawScore ?? rec.score),
    rawScore: rec.rawScore ?? rec.score,

    // ── Skills واضحة في الـ top-level ──────────────────────────────────
    jobSkills,        // كل skills الوظيفة
    matchedSkills,    // اللي اليوزر عارفها ✅
    missingSkills,    // اللي محتاج يتعلمها 📚
    skillGapPct,

    features: {
      skillOverlap: md.skillOverlap ?? 0,
      freshness:    md.freshness    ?? 0,
      lpAlignment:  md.lpAlignment  ?? 0,
      careerFit:    md.careerFit    ?? 0,
      readiness:    Math.max(0, 1 - (md.learningGap ?? 0)),
    },

    explanation: buildExplanation({ matchedSkills, missingSkills, matchDetails: md }),

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

  // المصدر 2: Steps المكتملة
 
  const completedStepProgress = await prisma.userStepProgress.findMany({
    where:  { userId, completed: true },
    select: { step: { select: { skills: true } } },
  });
  console.log('completed steps : ', completedStepProgress);
  
  for (const { step } of completedStepProgress)
    parseSkills(step?.skills).forEach(s => acquired.add(s));

  // المصدر 3: Lessons المكتملة
  const completedLessonProgress = await prisma.userLessonProgress.findMany({
    where:  { userId, completed: true },
    select: { lesson: { select: { skills: true } } },
  });
  
  for (const { lesson } of completedLessonProgress)
    parseSkills(lesson?.skills).forEach(s => acquired.add(s));

  console.log('user skills : ', acquired);
  

  return [...acquired];
}

// ══════════════════════════════════════════════════════
// MAIN
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

  const userSkillSet = new Set(realSkills);

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

  // 4. Jobs
  const jobs = await prisma.job.findMany({
    where: {
      status: 'PUBLISHED',
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

  // 5. إرسال للـ AI service
  const aiPayload = {
    user: {
      userId,
      title:             userProfile?.title            || '',
      learningPathTitle: bestEnrollment.learningPath.title,
      progressPercent:   progressPct,
      skills:            realSkills,
      declaredSkills:    [],
      experienceYears:   userProfile?.experienceYears ?? 0,
    },
    jobs: jobs.map(j => ({
      id:                j.id,
      title:             j.title,
      description:       j.description,
      skills:            parseSkills(j.skills),
      company:           j.company,
      location:          j.location        || null,
      jobType:           j.jobType,
      learningPathId:    j.learningPathId,
      learningPathTitle: j.learningPath?.title || '',
      experienceLevel:   j.experienceLevel  || null,
      applyLink:         j.applyLink        || null,
      postedAt:          j.postedAt?.toISOString() ?? null,
      source:            j.source           || null,
    })),
    topN: 5,
  };

  let aiData;
  try {
    const { data } = await aiClient.post('/recommend', aiPayload);
    aiData = data;
  } catch (err) {
    const code = err.code || err.response?.status;
    throw Object.assign(
      new Error(`AI service error: ${err.message}`),
      { code }
    );
  }

  // 6. Enrich
  const enriched = (aiData.recommendations ?? []).map(rec =>
    enrichRecommendation(rec, jobsMap, userSkillSet)
  );

  // 7. Meta
  const avgScore = enriched.length
    ? Math.round(enriched.reduce((s, r) => s + r.score, 0) / enriched.length)
    : 0;

  const avgSkillMatch = enriched.length
    ? Math.round(
        enriched.reduce((s, r) => s + (r.features.skillOverlap ?? 0), 0)
        / enriched.length * 100
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
// BATCH EXTRACT
// ══════════════════════════════════════════════════════

async function batchExtractSkills(jobs) {
  const { data } = await aiClient.post('/batch-extract-skills', jobs);
  return data.results;
}

module.exports = { getRecommendations, batchExtractSkills };