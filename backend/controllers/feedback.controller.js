// backend/controllers/feedbackController.js  (v4.0 Rebuilt)
// ────────────────────────────────────────────────────────────────────────────
// Controller with unified 9-feature contract + full skill support.
// ────────────────────────────────────────────────────────────────────────────

const { recordFeedback, getUserFeedbackStats } = require('../services/feedback.service');

/**
 * POST /api/feedback
 * body: {
 *   jobId,
 *   action,
 *   matchDetails = {},
 *   score = null,
 *   userSkills = [],       // ← NEW: user skill list for user_skill_density
 *   jobSkills = [],        // ← NEW: job skill list for job_skill_difficulty
 *   retrievalScore = null  // ← NEW: FAISS similarity score
 * }
 */
async function submitFeedback(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'غير مصرح' });

    const {
      jobId,
      action,
      matchDetails = {},
      score = null,
      userSkills = [],
      jobSkills = [],
      retrievalScore = null,
    } = req.body;

    // ── Validation ─────────────────────────────────────────────────────────
    const VALID_ACTIONS = ['apply', 'save', 'click', 'impression', 'dismiss'];
    if (!jobId || !VALID_ACTIONS.includes(action)) {
      return res.status(400).json({
        error: 'jobId و action مطلوبان',
        allowedActions: VALID_ACTIONS,
      });
    }

    // ── Record feedback with full v4.0 feature contract ──────────────────
    const record = await recordFeedback({
      userId,
      jobId: Number(jobId),
      action,
      matchDetails,
      score,
      userSkills,        // ← passed to compute user_skill_density
      jobSkills,         // ← passed to compute job_skill_difficulty
      retrievalScore,    // ← passed as retrieval_score feature
    });

    return res.status(201).json({
      success: true,
      id: record.id,
      message: 'Feedback recorded with full feature set',
    });

  } catch (err) {
    console.error('[feedbackController] submitFeedback error:', err);
    return res.status(500).json({ error: 'خطأ في الخادم', details: err.message });
  }
}

/**
 * GET /api/feedback/stats
 * Returns user feedback statistics
 */
async function getMyFeedbackStats(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'غير مصرح' });

    const stats = await getUserFeedbackStats(userId);
    return res.json({
      success: true,
      userId,
      stats,
      totalActions: Object.values(stats).reduce((a, b) => a + b, 0),
    });

  } catch (err) {
    console.error('[feedbackController] getMyFeedbackStats error:', err);
    return res.status(500).json({ error: 'خطأ في الخادم', details: err.message });
  }
}

module.exports = { submitFeedback, getMyFeedbackStats };