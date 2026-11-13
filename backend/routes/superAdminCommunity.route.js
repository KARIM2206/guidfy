const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const allowedTo = require("../utils/allowedTo");

const {
  getAllCommunitiesSA,
  getCommunityDetailsSA,
  suspendCommunity,
  activateCommunity,
  deleteCommunitySA,
  assignAdmin,
  removeAdmin,
  getAdminsSA,
  getMembersSA,
  banMemberSA,
  unbanMemberSA,
  getPostsSA,
  deletePostSA,
  getQuestionsSA,
  deleteQuestionSA,
  getAllReportsSA,
  getCommunityReportsSA,
  resolveReportSA,
  getPlatformAnalytics,
  getCommunityAnalyticsSA,
  getCommunitiesAnalyticsSA,
  getCommunityLogsSA
} = require("../controllers/community/superadmin.controller");

router.use(protect);
router.use(allowedTo("SUPER_ADMIN"));

// ══════════════════════════════════════════════════
//  COMMUNITIES
// ══════════════════════════════════════════════════

router.get("/communities", getAllCommunitiesSA);
router.get("/community/:communityId", getCommunityDetailsSA);
router.post("/community/:communityId/suspend", suspendCommunity);
router.post("/community/:communityId/activate", activateCommunity);
router.delete("/community/:communityId", deleteCommunitySA);

// ══════════════════════════════════════════════════
//  ADMINS
// ══════════════════════════════════════════════════

router.post("/community/:communityId/assign-admin", assignAdmin);
router.post("/community/:communityId/remove-admin", removeAdmin);
router.get("/admins", getAdminsSA);

// ══════════════════════════════════════════════════
//  MEMBERS
// ══════════════════════════════════════════════════

router.get("/community/:communityId/members", getMembersSA);
router.post("/community/:communityId/members/:userId/ban", banMemberSA);
router.post("/community/:communityId/members/:userId/unban", unbanMemberSA);

// ══════════════════════════════════════════════════
//  CONTENT
// ══════════════════════════════════════════════════

router.get("/community/:communityId/posts", getPostsSA);
router.delete("/community/:communityId/posts/:postId", deletePostSA);
router.get("/community/:communityId/questions", getQuestionsSA);
router.delete("/community/:communityId/questions/:questionId", deleteQuestionSA);

// ══════════════════════════════════════════════════
//  REPORTS
// ══════════════════════════════════════════════════

router.get("/reports", getAllReportsSA);
router.get("/community/:communityId/reports", getCommunityReportsSA);
router.post("/reports/:reportId/resolve", resolveReportSA);

// ══════════════════════════════════════════════════
//  ANALYTICS
// ══════════════════════════════════════════════════

router.get("/analytics", getPlatformAnalytics);
router.get("/community/:communityId/analytics", getCommunityAnalyticsSA);
router.get("/communities/analytics", getCommunitiesAnalyticsSA);

// ══════════════════════════════════════════════════
//  LOGS
// ══════════════════════════════════════════════════

router.get("/community/:communityId/logs", getCommunityLogsSA);

module.exports = router;