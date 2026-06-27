const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const allowedTo = require('../../utils/allowedTo');
const { protect } = require('../../middleware/authMiddleware');
const checkUser = require('../../middleware/checkUser');

const {
  createJob, updateJob, deleteJob, getSingleJob,
  getAllJobsToCreatedByAdmin, getAlljobs, changeStatus,
  getAlljobsToStudentByLearningPathTitle, getJobsByLearningPath,
  getAdminLearningPaths, getImportedJobs, approveImportedJob,
  rejectImportedJob, approveAllImported, removeDuplicateJobs,
  getJobsStats, getScraperStatus, startScraper, stopScraper,
  getScraperLogs, getScraperHistory,
  toggleSavedJob, getSavedJobs,
} = require('../../controllers/admin/jobs.controlers');

const { fetchJobsFromN8N } = require('../../controllers/N8n.controller');

// ═══════════════════════════════════════════════════
// MIDDLEWARE: Check Learning Path Access (for Admins)
// ═══════════════════════════════════════════════════
const checkLPAccess = async (req, res, next) => {
  if (req.user.role === 'SUPER_ADMIN') return next();
  
  const lpId = req.body.learningPathId || req.params.learningPathId;
  if (!lpId) return next();
  
  const hasAccess = await prisma.learningPathPermission.findFirst({
    where: {
      learningPathId: Number(lpId),
      userId: req.user.id,
      section: 'JOB',
    },
  });
  
  if (!hasAccess) {
    return res.status(403).json({ success: false, message: 'Not allowed' });
  }
  next();
};

// ═══════════════════════════════════════════════════
// MIDDLEWARE: Check Job Access (Admin owns this LP)
// ═══════════════════════════════════════════════════
const checkJobAccess = async (req, res, next) => {
  if (req.user.role === 'SUPER_ADMIN') return next();
  
  const job = await prisma.job.findUnique({
    where: { id: Number(req.params.id) },
    select: { learningPathId: true },
  });
  
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }
  
  const hasAccess = await prisma.learningPathPermission.findFirst({
    where: {
      learningPathId: job.learningPathId,
      userId: req.user.id,
      section: 'JOB',
    },
  });
  
  if (!hasAccess) {
    return res.status(403).json({ success: false, message: 'Not allowed' });
  }
  next();
};

// ═══════════════════════════════════════════════════
// SCRAPER (Super Admin only)
// ═══════════════════════════════════════════════════
router.get('/scraper/status',  protect, checkUser, allowedTo('SUPER_ADMIN'), getScraperStatus);
router.post('/scraper/start',  protect, checkUser, allowedTo('SUPER_ADMIN'), startScraper);
router.post('/scraper/stop',   protect, checkUser, allowedTo('SUPER_ADMIN'), stopScraper);
router.get('/scraper/logs',    protect, checkUser, allowedTo('SUPER_ADMIN'), getScraperLogs);
router.get('/scraper/history', protect, checkUser, allowedTo('SUPER_ADMIN'), getScraperHistory);

// ═══════════════════════════════════════════════════
// IMPORTED JOBS (Super Admin only)
// ═══════════════════════════════════════════════════
router.get('/imported',              protect, checkUser, allowedTo('SUPER_ADMIN'), getImportedJobs);
router.post('/imported/approve-all', protect, checkUser, allowedTo('SUPER_ADMIN'), approveAllImported);
router.post('/remove-duplicates',    protect, checkUser, allowedTo('SUPER_ADMIN'), removeDuplicateJobs);
router.post('/imported/:id/approve', protect, checkUser, allowedTo('SUPER_ADMIN'), approveImportedJob);
router.post('/imported/:id/reject',  protect, checkUser, allowedTo('SUPER_ADMIN'), rejectImportedJob);

// ═══════════════════════════════════════════════════
// STATS & EXTERNAL (Super Admin only)
// ═══════════════════════════════════════════════════
router.get('/stats',          protect, checkUser, allowedTo('SUPER_ADMIN'), getJobsStats);
router.get('/fetch-from-n8n', protect, checkUser, allowedTo('SUPER_ADMIN'), fetchJobsFromN8N);

// ═══════════════════════════════════════════════════
// STUDENT (Public — no allowedTo)
// ═══════════════════════════════════════════════════
router.get('/learning-path/:learningPathId', protect, checkUser, getAlljobsToStudentByLearningPathTitle);

// Saved Jobs
router.get('/saved', protect, checkUser, getSavedJobs);
router.post('/:jobId/save', protect, checkUser, toggleSavedJob);

// ═══════════════════════════════════════════════════
// ADMIN / SUPER_ADMIN — CRUD with Permission Checks
// ═══════════════════════════════════════════════════

// Super Admin: all jobs
router.get('/all', protect, checkUser, allowedTo('SUPER_ADMIN'), getAlljobs);

// Admin: jobs in assigned learning paths
router.get('/admin/learning-path/:learningPathId', protect, checkUser, allowedTo('ADMIN', 'SUPER_ADMIN'), getJobsByLearningPath);

// Admin: my created jobs
router.get('/my-jobs', protect, checkUser, allowedTo('ADMIN'), getAllJobsToCreatedByAdmin);

// Create job (check LP access)
router.post('/', protect, checkUser, allowedTo('ADMIN', 'SUPER_ADMIN'), checkLPAccess, createJob);

// Update job (check job access)
router.put('/:id', protect, checkUser, allowedTo('ADMIN', 'SUPER_ADMIN'), checkJobAccess, updateJob);

// Delete job (check job access)
router.delete('/:id', protect, checkUser, allowedTo('ADMIN', 'SUPER_ADMIN'), checkJobAccess, deleteJob);

// Change status (check job access)
router.patch('/:id/status', protect, checkUser, allowedTo('ADMIN', 'SUPER_ADMIN'), checkJobAccess, changeStatus);

// Get single job (check job access)
router.get('/:id', protect, checkUser, allowedTo('ADMIN', 'SUPER_ADMIN'), checkJobAccess, getSingleJob);

module.exports = router;