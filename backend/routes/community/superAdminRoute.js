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
  banMemberSA,
  unbanMemberSA,
  getCommunityPosts,
  deletePostSA,
  getCommunityQuestions,
  deleteQuestionSA,
  getAllReports,
  getCommunityReports,
  resolveReport,
  getPlatformAnalytics,
  getCommunityAnalytics,
  getCommunitiesAnalytics,
  getCommunityLogs,
} = require('../../controllers/community/superadmin.controller');
const {createCommunity,updateCommunity,deleteCommunity} = require('../../controllers/community.controller');

const { protect } = require('../../middleware/authMiddleware');
const checkUser = require('../../middleware/checkUser');
const allowedTo = require('../../utils/allowedTo');

// ═══════════════════════════════════
// MIDDLEWARE — Super Admin Only
// ═══════════════════════════════════

router.use(protect);
router.use(checkUser);
router.use(allowedTo('SUPER_ADMIN'));

// ═══════════════════════════════════
// STATIC ROUTES (قبل الديناميكية)
// ═══════════════════════════════════

// Platform Analytics
router.get('/analytics', getPlatformAnalytics);
router.get('/communities/analytics', getCommunitiesAnalytics);

// Admin Management
router.get('/admins', getCommunityAdmins);

// Reports (all platform)
router.get('/reports', getAllReports);
router.post('/reports/:reportId/resolve', resolveReport);

// Communities List
router.get('/communities', getAllCommunities);

// ═══════════════════════════════════
// COMMUNITY MANAGEMENT
// ═══════════════════════════════════
router.post('/community', createCommunity);
router.put('/community/:communityId', updateCommunity);
router.delete('/community/:communityId', deleteCommunity);
router.get('/community/:communityId', getCommunityDetails);
router.post('/community/:communityId/suspend', suspendCommunity);
router.post('/community/:communityId/activate', activateCommunity);
router.delete('/community/:communityId', deleteCommunitySA);

// Admin Assignment
router.post('/community/:communityId/assign-admin', assignAdminToCommunity);
router.post('/community/:communityId/remove-admin', removeAdminFromCommunity);

// Members
router.get('/community/:communityId/members', getCommunityMembers);
router.post('/community/:communityId/members/:userId/ban', banMemberSA);
router.post('/community/:communityId/members/:userId/unban', unbanMemberSA);

// Content
router.get('/community/:communityId/posts', getCommunityPosts);
router.delete('/community/:communityId/posts/:postId', deletePostSA);
router.get('/community/:communityId/questions', getCommunityQuestions);
router.delete('/community/:communityId/questions/:questionId', deleteQuestionSA);

// Reports & Analytics per community
router.get('/community/:communityId/reports', getCommunityReports);
router.get('/community/:communityId/analytics', getCommunityAnalytics);
router.get('/community/:communityId/logs', getCommunityLogs);

module.exports = router;