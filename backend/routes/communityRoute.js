const router = require("express").Router();
const {
  createCommunity, updateCommunity, deleteCommunity,
  getAllCommunities, getCommunityBySlug, joinCommunity, leaveCommunity,
  getCommunityQuestions, createQuestion, deleteQuestion,
  getCommunityPosts, createPost, deletePost, getCommunityAnalytics,
  getQuestion, addAnswer, editAnswer, deleteAnswer,
  getAnswers, getMyAnswers, vote, getVotes, getView,
  incrementView, getGlobalFeed
} = require("../controllers/community.controller");

const { protect } = require("../middleware/authMiddleware");
const checkUser = require("../middleware/checkUser");
const allowedTo = require("../utils/allowedTo");

router.use(protect);
router.use(checkUser);

// ══════════════════════════════════════════════════
//  STATIC ROUTES FIRST (قبل أي dynamic route)
// ══════════════════════════════════════════════════

// Feed
router.get("/feed", getGlobalFeed);

// Votes & Views (static paths)
router.post("/vote", vote);
router.post("/views", incrementView);

// Single question by ID (static prefix "question")
router.get("/question/:questionId", getQuestion);

// Votes & Views GET
router.get("/votes/target/:targetId/type/:targetType", getVotes);
router.get("/views/target/:targetId/type/:targetType", getView);

// ══════════════════════════════════════════════════
//  COMMUNITY CRUD
// ══════════════════════════════════════════════════

router.get("/", getAllCommunities);
router.post("/", allowedTo("ADMIN", "SUPER_ADMIN"), createCommunity);
router.put("/:communityId", allowedTo("ADMIN", "SUPER_ADMIN"), updateCommunity);
router.delete("/:communityId", allowedTo("ADMIN", "SUPER_ADMIN"), deleteCommunity);
router.get("/:communityId/analytics", getCommunityAnalytics);

// ══════════════════════════════════════════════════
//  JOIN / LEAVE
// ══════════════════════════════════════════════════

router.post("/:communityId/join", joinCommunity);
router.post("/:communityId/leave", leaveCommunity);

// ══════════════════════════════════════════════════
//  QUESTIONS
// ══════════════════════════════════════════════════

router.get("/:communityId/questions", getCommunityQuestions);
router.post("/:communityId/questions", createQuestion);
router.delete("/:communityId/questions/:questionId", deleteQuestion);

// ══════════════════════════════════════════════════
//  ANSWERS
// ══════════════════════════════════════════════════

router.post("/:communityId/questions/:questionId/answers", addAnswer);
router.put("/:communityId/questions/:questionId/answers/:answerId", editAnswer);
router.delete("/:communityId/questions/:questionId/answers/:answerId", deleteAnswer);

// ✅ مسارين مختلفين للـ answers
router.get("/:communityId/questions/:questionId/answers", getAnswers);
router.get("/:communityId/questions/:questionId/my-answers", getMyAnswers); // ← غيرنا المسار

// ══════════════════════════════════════════════════
//  POSTS
// ══════════════════════════════════════════════════

router.get("/:communityId/posts", getCommunityPosts);
router.post("/:communityId/posts", createPost);
router.delete("/:communityId/posts/:postId", deletePost);

// ══════════════════════════════════════════════════
//  SLUG — دايمًا الأخير لأنه يلتقط أي string
// ══════════════════════════════════════════════════

router.get("/:slug", getCommunityBySlug);

module.exports = router;