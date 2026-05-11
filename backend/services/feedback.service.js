// backend/services/feedbackService.js

const axios  = require('axios');
const prisma = require('../prismaClient');

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL || 'http://localhost:4000',
  headers: { 'x-internal-token': process.env.INTERNAL_API_TOKEN || '' },
  timeout: 5_000,
});

const LABEL_MAP = {
  apply:      3,
  save:       2,
  click:      1,
  impression: 0,
  dismiss:   -1,
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
 */
async function recordFeedback({ userId, jobId, action, matchDetails = {}, score = null }) {

  // ── 1. حفظ في DB ──────────────────────────────────────────────────────────
  const record = await prisma.jobRecommendationFeedback.create({
    data: {
      userId,
      jobId,
      action,
      score,
      skillOverlap: matchDetails.skillOverlap ?? null,
      expMatch:     matchDetails.expMatch     ?? null,
      freshness:    matchDetails.freshness    ?? null,
      careerFit:    matchDetails.careerFit    ?? null,
      learningGap:  matchDetails.learningGap  ?? null,
      lpAlignment:  matchDetails.lpAlignment  ?? null,
    },
  });

  // ── 2. notify AI service (fire & forget) ──────────────────────────────────
  aiClient.post('/feedback', {
    userId,
    jobId,
    action,
    label: LABEL_MAP[action] ?? 0,
    score,
    matchDetails,
  }).catch(err => {
    console.error('[Feedback] AI service notify failed:', err.message);
  });

  return record;
}

// ─────────────────────────────────────────────────────────────────────────────
// getUserFeedbackStats
// ─────────────────────────────────────────────────────────────────────────────
async function getUserFeedbackStats(userId) {
  const stats = await prisma.jobRecommendationFeedback.groupBy({
    by:    ['action'],
    where: { userId },
    _count: { action: true },
  });
  return Object.fromEntries(stats.map(s => [s.action, s._count.action]));
}

// ─────────────────────────────────────────────────────────────────────────────
// getTotalFeedbackCount  — بيستخدمه الـ retrain trigger
// ─────────────────────────────────────────────────────────────────────────────
async function getTotalFeedbackCount() {
  return prisma.jobRecommendationFeedback.count();
}

module.exports = { recordFeedback, getUserFeedbackStats, getTotalFeedbackCount };