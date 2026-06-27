// routes/n8nRoutes.js
'use strict';

const express = require('express');
const router  = express.Router();

const { saveJobs, getJobs, fetchJobsFromN8N } = require('../controllers/N8n.controller');
const { validateInternalToken }= require('../middleware/internaltokenmiddleware');

// ── POST /api/n8n/save-jobs
// Internal endpoint — called by n8n after fetching jobs from SerpAPI.
// Requires x-internal-token header matching INTERNAL_API_TOKEN env var.
router.post('/save-jobs', validateInternalToken, saveJobs);

// ── GET /api/n8n/jobs/:learningPathId  (authenticated user routes — keep as-is)
router.get('/jobs/:learningPathId',          getJobs);
router.get('/fetch-jobs',                    fetchJobsFromN8N);

module.exports = router;