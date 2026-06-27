// frontend/src/services/feedbackService.js
/**
 * كل التفاعلات بترسل من هنا لـ backend
 * الـ frontend مش بيتكلم مع AI service مباشرة
 */

import api from './apiCommunity'; // axios instance عندك

const DEBOUNCE_MS = 500; // عشان ما يتبعتش نفس الـ impression أكتر من مرة

// ── تتبع الـ impressions المتبعتة عشان ما نكررش ──────────────────────────────
const _sentImpressions = new Set();
const _debounceTimers  = {};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * الدالة الأساسية — بترسل feedback للـ backend
 */
async function sendFeedback({ jobId, action, matchDetails = {}, score = null }) {
  try {
    await api.post('/feedback', { jobId, action, matchDetails, score });
  } catch (err) {
    // silent fail — مش لازم يأثر على الـ UX
    console.warn('[Feedback] failed to send:', action, jobId, err?.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// الدوال اللي بيستخدمها الـ frontend مباشرة
// ─────────────────────────────────────────────────────────────────────────────

/**
 * لما الوظيفة تظهر في الـ list (IntersectionObserver)
 */
export function trackImpression(job) {
  const key = `${job.jobId}`;
  if (_sentImpressions.has(key)) return; // ما نبعتش تاني

  clearTimeout(_debounceTimers[key]);
  _debounceTimers[key] = setTimeout(() => {
    _sentImpressions.add(key);
    sendFeedback({
      jobId:        job.jobId,
      action:       'impression',
      matchDetails: job.matchDetails,
      score:        job.score,
    });
  }, DEBOUNCE_MS);
}

/**
 * لما المستخدم يضغط على الوظيفة (فتح details)
 */
export function trackClick(job) {
  sendFeedback({
    jobId:        job.jobId,
    action:       'click',
    matchDetails: job.matchDetails,
    score:        job.score,
  });
}

/**
 * لما المستخدم يضغط Apply
 */
export function trackApply(job) {
  sendFeedback({
    jobId:        job.jobId,
    action:       'apply',
    matchDetails: job.matchDetails,
    score:        job.score,
  });
}

/**
 * لما المستخدم يعمل Save / Bookmark
 */
export function trackSave(job) {
  sendFeedback({
    jobId:        job.jobId,
    action:       'save',
    matchDetails: job.matchDetails,
    score:        job.score,
  });
}

/**
 * لما المستخدم يعمل Dismiss / Hide
 */
export function trackDismiss(job) {
  sendFeedback({
    jobId:        job.jobId,
    action:       'dismiss',
    matchDetails: job.matchDetails,
    score:        job.score,
  });
}