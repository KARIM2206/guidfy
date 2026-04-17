// community.routes.js
const router = require("express").Router(); // صححنا الأقواس
const {
  createCommunity,
  updateCommunity,
  deleteCommunity,
  getAllCommunities,
  getCommunityBySlug,
  joinCommunity,
  leaveCommunity,
  getCommunityQuestions,
  createQuestion,
  deleteQuestion,
  getCommunityPosts,
  createPost,
  deletePost,
  getCommunityAnalytics,
  getQuestion,
  addAnswer,
  editAnswer,
  deleteAnswer,
  getAnswers,
  getMyAnswers,
  vote,
  getVotes,
  getView,
  incrementView,
  getGlobalFeed
} = require("../controllers/community.controller");

const { protect } = require("../middleware/authMiddleware");
const checkUser = require("../middleware/checkUser");
const allowedTo = require("../utils/allowedTo");

// ─── حماية كل الـ routes ─────────────────────────
router.use(protect); // كل حاجة محتاجة تسجيل دخول
router.use(checkUser); // تحقق من وجود user
router.get("/target/:targetId/type/:targetType/views", getView);
// ─── Community CRUD ───────────────────────────────
router.get("/", getAllCommunities);
router.post("/", allowedTo("ADMIN", "SUPER_ADMIN"), createCommunity);

router.put("/:communityId", allowedTo("ADMIN", "SUPER_ADMIN"), updateCommunity);
router.delete("/:communityId", allowedTo("ADMIN", "SUPER_ADMIN"), deleteCommunity);
router.get("/:communityId/analytics", getCommunityAnalytics);
// ─── Join / Leave ─────────────────────────────────
router.post("/:communityId/join", joinCommunity);
router.post("/:communityId/leave", leaveCommunity);

// ─── Questions ────────────────────────────────────
router.get("/question/:questionId", getQuestion);
router.get("/:communityId/questions", getCommunityQuestions);
router.post("/:communityId/questions", createQuestion);

router.delete("/:communityId/questions/:questionId", deleteQuestion);

// ─── Answers ───────────────────────────────────────
router.post("/:communityId/questions/:questionId/answers",checkUser, addAnswer);
router.put("/:communityId/questions/:questionId/answers/:answerId",checkUser, editAnswer);
router.delete("/:communityId/questions/:questionId/answers/:answerId",checkUser, deleteAnswer);
router.get("/:communityId/questions/:questionId/answers",checkUser, getAnswers);
router.get("/:communityId/questions/:questionId/answers",checkUser, getMyAnswers);
// ─── Posts ────────────────────────────────────────
router.get("/:communityId/posts", getCommunityPosts);
router.post("/:communityId/posts", createPost);
router.delete("/:communityId/posts/:postId", deletePost);
router.post("/views",protect, incrementView);
// ─── Votes ────────────────────────────────────────
router.post("/vote",protect, vote);
router.get("/target/:targetId/type/:targetType/votes", getVotes);
router.get('/feed', getGlobalFeed);
router.get("/:slug", getCommunityBySlug);
module.exports = router;