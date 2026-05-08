// routes/admin.routes.js
const router = require('express').Router();
const {
  getAdminCommunity,
  updateAdminCommunity,
  getAdminMembers,
  banMember,
  unbanMember,
  removeMemberByAdmin,
  getAdminPosts,
  deletePostByAdmin,
  getAdminQuestions,
  deleteQuestionByAdmin,
  getAdminReports,
  resolveReportByAdmin,
  dismissReportByAdmin,
  getAdminAnalytics,
  getAdminActionLogs,
} = require('../../controllers/community/admin.controller');

const { protect }   = require('../../middleware/authMiddleware');
const checkUser     = require('../../middleware/checkUser');
const allowedTo           = require('../../utils/allowedTo');

// ─── All routes require Admin ─────────────────────
router.use(protect);
router.use(checkUser);
router.use(allowedTo('ADMIN'));

// ─── Community ────────────────────────────────────
router.get('/community/:slug',     getAdminCommunity);
router.put('/community/:slug',     updateAdminCommunity);

// ─── Members ──────────────────────────────────────
router.get('/community/:slug/members',                   getAdminMembers);
router.post('/community/:slug/members/:userId/ban',      banMember);
router.post('/community/:slug/members/:userId/unban',    unbanMember);
router.delete('/community/:slug/members/:userId',        removeMemberByAdmin);

// ─── Posts ────────────────────────────────────────
router.get('/community/:slug/posts',             getAdminPosts);
router.delete('/community/:slug/posts/:postId',  deletePostByAdmin);

// ─── Questions ────────────────────────────────────
router.get('/community/:slug/questions',                    getAdminQuestions);
router.delete('/community/:slug/questions/:questionId',     deleteQuestionByAdmin);

// ─── Reports ──────────────────────────────────────
router.get('/community/:slug/reports',                  getAdminReports);
router.put('/reports/:reportId/resolve',                resolveReportByAdmin);
router.put('/reports/:reportId/dismiss',                dismissReportByAdmin);

// ─── Analytics & Logs ─────────────────────────────
router.get('/community/:slug/analytics', getAdminAnalytics);
router.get('/community/:slug/logs',      getAdminActionLogs);

module.exports = router;