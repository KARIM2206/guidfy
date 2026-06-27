'use client';

import { useRef, useCallback } from 'react';
import api from '../../services/apiProfile';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS — v4.1 Unified Label Map
// ═══════════════════════════════════════════════════════════════════════════

const FEEDBACK_LABELS = {
  dismiss:    0,
  impression: 1,
  click:      2,
  save:       3,
  apply:      4,
};

const BATCH_INTERVAL = 5000;

// ═══════════════════════════════════════════════════════════════════════════
// Global feedback queue (shared across all instances)
// ═══════════════════════════════════════════════════════════════════════════

let feedbackQueue = [];
let batchTimer = null;

function flushFeedbackQueue() {
  if (feedbackQueue.length === 0) return;
  const batch = [...feedbackQueue];
  feedbackQueue = [];
  batch.forEach((payload) => {
    api.post('/feedback', payload).catch((err) => {
      console.warn('[Feedback] failed:', err.message);
    });
  });
  console.log(`[Feedback] Flushed ${batch.length} events`);
}

function queueFeedback(payload, immediate = false) {
  feedbackQueue.push(payload);
  if (immediate) {
    flushFeedbackQueue();
  } else if (!batchTimer) {
    batchTimer = setTimeout(() => {
      flushFeedbackQueue();
      batchTimer = null;
    }, BATCH_INTERVAL);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK: useJobFeedback — v4.1
// ملاحظة مهمة: الـ IntersectionObserver اتنقل لـ useImpressionTracker
// في JobsSection عشان نتجنب الـ double impression
// ═══════════════════════════════════════════════════════════════════════════

export function useJobFeedback(job, userId, userSkills = []) {
  const cardRef = useRef(null);
  const clickSent = useRef(false);

  const jobId = job?.jobId || job?.id;
  const matchDetails = job?.matchDetails || {};
  const score = job?.score ?? null;
  const jobSkills = job?.skills || [];
  const retrievalScore = job?.retrievalScore ?? job?.rawScore ?? null;

  const buildPayload = useCallback(
    (action, extra = {}) => {
      const md = matchDetails || {};
      const feats = md.features || {};

      return {
        userId: userId || null,
        jobId,
        action,
        label: FEEDBACK_LABELS[action] ?? 0,
        score,
        userSkills,
        jobSkills,
        retrievalScore,
        matchDetails: {
          skillOverlap: md.skillOverlap ?? feats.skillOverlap ?? 0,
          expMatch: md.expMatch ?? feats.expMatch ?? false,
          freshness: md.freshness ?? feats.freshness ?? 0,
          careerFit: md.careerFit ?? feats.careerFit ?? 0,
          learningGap: md.learningGap ?? feats.learningGap ?? 0,
          lpAlignment: md.lpAlignment ?? feats.lpAlignment ?? 0,
          userSkillDensity: md.userSkillDensity ?? feats.userSkillDensity ?? null,
          jobSkillDifficulty: md.jobSkillDifficulty ?? feats.jobSkillDifficulty ?? null,
          matchedSkills: md.matchedSkills ?? [],
          missingSkills: md.missingSkills ?? [],
          skillGapPct: md.skillGapPct ?? 0,
          features: {
            skillOverlap: feats.skillOverlap ?? md.skillOverlap ?? 0,
            freshness: feats.freshness ?? md.freshness ?? 0,
            lpAlignment: feats.lpAlignment ?? md.lpAlignment ?? 0,
            careerFit: feats.careerFit ?? md.careerFit ?? 0,
            readiness:
              feats.readiness ??
              (md.learningGap != null ? Math.max(0, 1 - md.learningGap) : 0),
            userSkillDensity: feats.userSkillDensity ?? null,
            jobSkillDifficulty: feats.jobSkillDifficulty ?? null,
          },
          explanation: md.explanation ?? [],
        },
        timestamp: new Date().toISOString(),
        ...extra,
      };
    },
    [jobId, score, matchDetails, userId, userSkills, jobSkills, retrievalScore]
  );

  // ── الـ impression بيتبعت من useImpressionTracker في JobsSection مش هنا ──

  const onClickJob = useCallback(() => {
    if (clickSent.current) return;
    clickSent.current = true;
    queueFeedback(buildPayload('click'));
    console.log(`[Feedback] Click: ${jobId}`);
  }, [buildPayload, jobId]);

  const onApply = useCallback(() => {
    queueFeedback(buildPayload('apply'), true);
    console.log(`[Feedback] Apply: ${jobId}`);
  }, [buildPayload, jobId]);

  const onSave = useCallback(() => {
    queueFeedback(buildPayload('save'), true);
    console.log(`[Feedback] Save: ${jobId}`);
  }, [buildPayload, jobId]);

  const onDismiss = useCallback(() => {
    queueFeedback(buildPayload('dismiss'), true);
    console.log(`[Feedback] Dismiss: ${jobId}`);
  }, [buildPayload, jobId]);

  const onShare = useCallback(() => {
    queueFeedback(buildPayload('click'));
    console.log(`[Feedback] Share (as click): ${jobId}`);
  }, [buildPayload, jobId]);

  return { cardRef, onClickJob, onApply, onSave, onDismiss, onShare };
}

// ═══════════════════════════════════════════════════════════════════════════
// Flush on page unload
// ═══════════════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushFeedbackQueue);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushFeedbackQueue();
  });
}