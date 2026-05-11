// backend/routes/feedbackRouter.js
const express = require('express');
const router  = express.Router();
const { protect }    = require('../middleware/authMiddleware');
const { recordFeedback, getUserFeedbackStats } = require('../services/feedback.service');

// POST /api/feedback
router.post('/', protect, async (req, res) => {
  try {
    const { jobId, action, matchDetails, score } = req.body;
    const userId = req.user?.id;

    if (!userId)           return res.status(401).json({ message: 'Unauthorized' });
    if (!jobId || !action) return res.status(400).json({ message: 'jobId and action required' });

    const validActions = ['apply', 'save', 'click', 'impression', 'dismiss'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ message: `action must be one of: ${validActions.join(', ')}` });
    }

    const record = await recordFeedback({
      userId,
      jobId: Number(jobId),
      action,
      matchDetails: matchDetails || {},
      score:        score        ?? null,
    });

    return res.status(201).json({ success: true, record });
  } catch (err) {
    console.error('[Feedback Route]', err);
    return res.status(500).json({ message: 'Internal server error', detail: err.message });
  }
});

// GET /api/feedback/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const stats = await getUserFeedbackStats(userId);
    return res.json({ stats });
  } catch (err) {
    console.error('[Feedback Stats]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;