const express = require('express');
const router = express.Router();

const { saveJobs } = require('../controllers/N8n.controller');

// ─── N8N Internal Routes ─────────────────────────────────────

router.post('/save-jobs', saveJobs);   // POST /api/n8n/save-jobs

module.exports = router;