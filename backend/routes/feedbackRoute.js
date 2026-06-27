// backend/routes/feedback.routes.js

const express    = require('express');
const router     = express.Router();
const { submitFeedback, getMyFeedbackStats } = require('../controllers/feedback.controller');
const { protect } = require('../middleware/authMiddleware'); // middleware الموجود عندك

// POST /api/feedback
router.post('/', protect, submitFeedback);

// GET  /api/feedback/stats
router.get('/stats', protect, getMyFeedbackStats);

module.exports = router;