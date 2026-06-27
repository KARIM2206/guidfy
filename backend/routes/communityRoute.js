const router = require("express").Router();
const {
  getAllCommunities, getCommunityBySlug, joinCommunity, leaveCommunity,
  getCommunityQuestions, createQuestion, updateQuestion, deleteQuestion,
  getCommunityPosts, createPost, updatePost, deletePost, getPopularTags, getCommunityAnalytics,
  getQuestion, addAnswer, editAnswer, deleteAnswer,
  getAnswers, getMyAnswers, vote, getGlobalFeed, getVotes, incrementView, getView,
  createCommunity, updateCommunity, deleteCommunity, getCommunityMembers
} = require("../controllers/community.controller");

const { protect } = require("../middleware/authMiddleware");
const allowedTo = require("../utils/allowedTo");

router.use(protect);

// ══════════════════════════════════════════════════
//  STATIC ROUTES (قبل أي dynamic route)
// ══════════════════════════════════════════════════

router.get("/feed", getGlobalFeed);
router.get("/tags/popular", getPopularTags);
router.post("/vote", vote);
router.get("/votes/target/:targetId/type/:targetType", getVotes);
router.post("/views", incrementView);
router.get("/views/target/:targetId/type/:targetType", getView);

router.get("/question/:questionId", getQuestion);

// ══════════════════════════════════════════════════
//  COMMUNITY CRUD (Public + Admin)
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
router.get("/:communityId/members", getCommunityMembers);

// ══════════════════════════════════════════════════
//  QUESTIONS
// ══════════════════════════════════════════════════

router.get("/:communityId/questions", getCommunityQuestions);
router.post("/:communityId/questions", createQuestion);
router.put("/:communityId/questions/:questionId", updateQuestion);
router.delete("/:communityId/questions/:questionId", deleteQuestion);

// ══════════════════════════════════════════════════
//  ANSWERS
// ══════════════════════════════════════════════════

router.post("/:communityId/questions/:questionId/answers", addAnswer);
router.put("/:communityId/questions/:questionId/answers/:answerId", editAnswer);
router.delete("/:communityId/questions/:questionId/answers/:answerId", deleteAnswer);
router.get("/:communityId/questions/:questionId/answers", getAnswers);
router.get("/:communityId/questions/:questionId/my-answers", getMyAnswers);

// ══════════════════════════════════════════════════
//  POSTS
// ══════════════════════════════════════════════════

router.get("/:communityId/posts", getCommunityPosts);
router.post("/:communityId/posts", createPost);
router.put("/:communityId/posts/:postId", updatePost);
router.delete("/:communityId/posts/:postId", deletePost);

// ══════════════════════════════════════════════════
//  SLUG — دايمًا الأخير
// ══════════════════════════════════════════════════

router.get("/:slug", getCommunityBySlug);

module.exports = router;