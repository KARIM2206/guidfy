// routes/quizRoutes.js
const express = require("express");
const router  = express.Router();
const {protect}    = require("../middleware/authMiddleware"); // الـ auth middleware الموجود
const {
  getQuizByLessonId,
  getQuizById,
  updateQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  submitQuizAttempt,
  getMyAttempts,
  getAllAttempts,
} = require("../controllers/quiz.controller");

// ── Quiz ──────────────────────────────────────────────
router.get("/lesson/:lessonId",   protect, getQuizByLessonId);  // جيب quiz بتاع lesson معين
router.get("/:id",                protect, getQuizById);         // جيب quiz by id
router.put("/:id",                protect, updateQuiz);          // تحديث settings

// ── Questions ─────────────────────────────────────────
router.post("/:quizId/questions",               protect, addQuestion);     // أضف سؤال
router.put("/questions/:questionId",            protect, updateQuestion);  // عدّل سؤال
router.delete("/questions/:questionId",         protect, deleteQuestion);  // احذف سؤال

// ── Attempts ──────────────────────────────────────────
router.post("/:quizId/submit",    protect, submitQuizAttempt);  // طالب يقدم إجابات
router.get("/:quizId/my-attempts",protect, getMyAttempts);       // إجاباتي
router.get("/:quizId/attempts",   protect, getAllAttempts);       // كل المحاولات (admin)

module.exports = router;

// ══════════════════════════════════════════════════════
// في app.js أضف:
// app.use("/api/quiz", require("./routes/quizRoutes"));
// ══════════════════════════════════════════════════════