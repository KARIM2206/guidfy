const express = require('express');
const { generateCareerReport } = require('../../controllers/careerReport.controller');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/generate', protect, generateCareerReport);

module.exports = router;
