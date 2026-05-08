const router = require('express').Router();
const {
  getAllCommunities,
  getCommunityDetails,
  suspendCommunity,
  activateCommunity,
  deleteCommunitySA,
  assignAdminToCommunity,
  removeAdminFromCommunity,
  getCommunityAdmins,
  getCommunityMembers,
  banMember,
  unbanMember,
  getCommunityPosts,
  deletePost,
  getCommunityQuestions,
  deleteQuestion,
  getAllReports,
  getCommunityReports,
  resolveReport,
  getPlatformAnalytics,
  getCommunityAnalytics,
  getCommunitiesAnalytics,
  getCommunityLogs,
} = require('../../controllers/community/superAdmin.controller');

const { protect } = require('../../middleware/authMiddleware');
const checkUser = require('../../middleware/checkUser');
const allowedTo = require('../../utils/allowedTo');

// All routes require Super Admin
router.use(protect);
router.use(checkUser);
router.use(allowedTo('SUPER_ADMIN'));

// ═══════════════════════════════════
// Static routes (محددة قبل الديناميكية)
// ═══════════════════════════════════

// Analytics
router.get('/analytics', getPlatformAnalytics);
router.get('/communities/analytics', getCommunitiesAnalytics);

// Admins
router.get('/admins', getCommunityAdmins);

// Reports
router.get('/reports', getAllReports);
router.post('/reports/:reportId/resolve', resolveReport);

// Communities list (ثابت)
router.get('/communities', getAllCommunities);

// ═══════════════════════════════════
// Dynamic community routes
// ═══════════════════════════════════

router.get('/community/:communityId', getCommunityDetails);
router.post('/community/:communityId/suspend', suspendCommunity);
router.post('/community/:communityId/activate', activateCommunity);
router.delete('/community/:communityId', deleteCommunitySA);

router.post('/community/:communityId/assign-admin', assignAdminToCommunity);
router.post('/community/:communityId/remove-admin', removeAdminFromCommunity);

router.get('/community/:communityId/members', getCommunityMembers);
router.post('/community/:communityId/members/:userId/ban', banMember);
router.post('/community/:communityId/members/:userId/unban', unbanMember);

router.get('/community/:communityId/posts', getCommunityPosts);
router.delete('/community/:communityId/posts/:postId', deletePost);
router.get('/community/:communityId/questions', getCommunityQuestions);
router.delete('/community/:communityId/questions/:questionId', deleteQuestion);

router.get('/community/:communityId/reports', getCommunityReports);
router.get('/community/:communityId/analytics', getCommunityAnalytics);
router.get('/community/:communityId/logs', getCommunityLogs);

module.exports = router;