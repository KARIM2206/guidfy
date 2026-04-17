const router = require("express").Router();
const {
  addLessonToStep,
  getLessonsByStep,
  getSingleLesson,
  updateLesson,
  deleteLesson,
} = require("../../controllers/admin/lesson.controller");
const allowedTo = require("../../utils/allowedTo");
const { protect } = require("../../middleware/authMiddleware");
const checkUser = require("../../middleware/checkUser");
const uploadLessonVideo = require("../../middleware/uploadLessonVideo");

// ==========================
// Create Lesson (Dynamic) ✅
// ==========================
router.post(
  "/step/:stepId",
  protect,
  checkUser,
  allowedTo("ADMIN"),
  uploadLessonVideo.single("video"), // اختياري للفيديو
  addLessonToStep
);

// ==========================
// Get Lessons By Step
// ==========================
router.get("/step/:stepId", getLessonsByStep);

// ==========================
// Get Single Lesson
// ==========================
router.get("/:id", getSingleLesson);

// ==========================
// Update Lesson ✅
// ==========================
router.put(
  "/:id",
  protect,
  checkUser,
  allowedTo("ADMIN"),
  uploadLessonVideo.single("video"), // اختياري للفيديو
  updateLesson
);

// ==========================
// Delete Lesson ✅
// ==========================
router.delete(
  "/:id",
  protect,
  checkUser,
  allowedTo("ADMIN"),
  deleteLesson
);

module.exports = router;