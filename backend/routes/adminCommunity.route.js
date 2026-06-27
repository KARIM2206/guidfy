const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const allowedTo = require("../utils/allowedTo");

// Controllers (أنشئهم أو استخدم نفس controllers)
const {
  getCommunityDetailsAdmin,
  updateCommunityAdmin,
  getCommunityMembersAdmin,
  banMemberAdmin,
  unbanMemberAdmin,
  removeMemberAdmin,
  getCommunityPostsAdmin,
  deletePostAdmin,
  getCommunityQuestionsAdmin,
  deleteQuestionAdmin,
  getCommunityReportsAdmin,
  resolveReportAdmin,
  dismissReportAdmin,
  getCommunityAnalyticsAdmin,
  getCommunityLogsAdmin
} = require("../controllers/community/admin.controller");

router.use(protect);
router.use(allowedTo("ADMIN", "SUPER_ADMIN"));

// ══════════════════════════════════════════════════
//  COMMUNITY
// ══════════════════════════════════════════════════

router.get("/community/:slug", getCommunityDetailsAdmin);
router.put("/community/:slug", updateCommunityAdmin);

// ══════════════════════════════════════════════════
//  MEMBERS
// ══════════════════════════════════════════════════

router.get("/community/:slug/members", getCommunityMembersAdmin);
router.post("/community/:slug/members/:userId/ban", banMemberAdmin);
router.post("/community/:slug/members/:userId/unban", unbanMemberAdmin);
router.delete("/community/:slug/members/:userId", removeMemberAdmin);

// ══════════════════════════════════════════════════
//  POSTS
// ══════════════════════════════════════════════════

router.get("/community/:slug/posts", getCommunityPostsAdmin);
router.delete("/community/:slug/posts/:postId", deletePostAdmin);

// ══════════════════════════════════════════════════
//  QUESTIONS
// ══════════════════════════════════════════════════

router.get("/community/:slug/questions", getCommunityQuestionsAdmin);
router.delete("/community/:slug/questions/:questionId", deleteQuestionAdmin);

// ══════════════════════════════════════════════════
//  REPORTS
// ══════════════════════════════════════════════════

router.get("/community/:slug/reports", getCommunityReportsAdmin);
router.put("/reports/:reportId/resolve", resolveReportAdmin);
router.put("/reports/:reportId/dismiss", dismissReportAdmin);

// ══════════════════════════════════════════════════
//  ANALYTICS & LOGS
// ══════════════════════════════════════════════════

router.get("/community/:slug/analytics", getCommunityAnalyticsAdmin);
router.get("/community/:slug/logs", getCommunityLogsAdmin);

module.exports = router;