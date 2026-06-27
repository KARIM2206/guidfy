// backend/services/feedbackService.js  (v4.1)
// ────────────────────────────────────────────────────────────────────────────
// Sends ALL 9 unified features to the AI service for retraining.
// No synthetic defaults — sends null when data is genuinely missing.
//
// v4.1 changes:
//   - expMatch: always null (schema changed Boolean → Float, not applicable for LP learners)
//   - userSkillDensity: always null (feature_builder.py computes it with overlap_boost)
//   - jobSkillDifficulty: always null (feature_builder.py computes it consistently)
// ────────────────────────────────────────────────────────────────────────────

const axios  = require('axios');
const prisma = require('../prismaClient');

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL || 'http://localhost:4000',
  headers: { 'x-internal-token': process.env.INTERNAL_API_TOKEN || '' },
  timeout: 90_000,
});

const LABEL_MAP = {
  dismiss:    0,
  impression: 1,
  click:      2,
  save:       3,
  apply:      4,
};

// ─────────────────────────────────────────────────────────────────────────────
// recordFeedback
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {Object} params
 * @param {number} params.userId
 * @param {number} params.jobId
 * @param {'apply'|'save'|'click'|'dismiss'|'impression'} params.action
 * @param {Object} params.matchDetails
 * @param {number|null} params.score
 * @param {number|null} params.retrievalScore  // FAISS similarity from AI service
 */
async function recordFeedback({
  userId,
  jobId,
  action,
  matchDetails = {},
  score = null,
  retrievalScore = null,
}) {
  // ── Features from matchDetails only — no local computation ────────────────
  const skillOverlap  = matchDetails.skillOverlap  ?? null;
  const freshness     = matchDetails.freshness     ?? null;
  const careerFit     = matchDetails.careerFit     ?? null;
  const learningGap   = matchDetails.learningGap   ?? null;
  const lpAlignment   = matchDetails.lpAlignment   ?? null;

  // expMatch: always null — not applicable for LP-based learners
  // (schema changed from Boolean → Float to support null properly)
  const expMatch = null;

  // userSkillDensity / jobSkillDifficulty: always null here
  // feature_builder.py computes these with overlap_boost for consistency
  const userSkillDensity   = null;
  const jobSkillDifficulty = null;

  // ── 1. Save to DB ────────────────────────────────────────────────────────
  const record = await prisma.jobRecommendationFeedback.create({
    data: {
      userId,
      jobId,
      action,
      score,
      skillOverlap,
      expMatch,           // null — Float? field in schema
      freshness,
      careerFit,
      learningGap,
      lpAlignment,
    },
  });

  // ── 2. Notify AI service (fire & forget) ────────────────────────────────
  const payload = {
    userId,
    jobId,
    action,
    label: LABEL_MAP[action] ?? null,
    score,
    // Flat columns — unified feature contract
    retrieval_score:      retrievalScore,
    skill_overlap:        skillOverlap,
    exp_match:            null,
    freshness:            freshness,
    career_alignment:     careerFit,
    learning_gap_score:   learningGap,
    lp_alignment:         lpAlignment,
    user_skill_density:   null,
    job_skill_difficulty: null,
    // Legacy nested (for backwards compatibility)
    matchDetails: {
      skillOverlap,
      expMatch:           null,
      freshness,
      careerFit,
      learningGap,
      lpAlignment,
      userSkillDensity:   null,
      jobSkillDifficulty: null,
      retrievalScore,
    },
  };

  aiClient.post('/feedback', payload).catch(err => {
    console.error('[Feedback] AI service notify failed:', err.message);
  });

  return record;
}

// ─────────────────────────────────────────────────────────────────────────────
// getUserFeedbackStats
// ─────────────────────────────────────────────────────────────────────────────
async function getUserFeedbackStats(userId) {
  const stats = await prisma.jobRecommendationfeedback.groupBy({
    by:    ['action'],
    where: { userId },
    _count: { action: true },
  });
  return Object.fromEntries(stats.map(s => [s.action, s._count.action]));
}

// ─────────────────────────────────────────────────────────────────────────────
// getTotalFeedbackCount
// ─────────────────────────────────────────────────────────────────────────────
async function getTotalFeedbackCount() {
  return prisma.jobRecommendationfeedback.count();
}

module.exports = { recordFeedback, getUserFeedbackStats, getTotalFeedbackCount };