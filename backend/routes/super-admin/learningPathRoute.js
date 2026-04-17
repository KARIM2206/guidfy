const router = require("express").Router();
const allowedTo = require("../../utils/allowedTo");
const { protect } = require("../../middleware/authMiddleware");
const checkUser = require("../../middleware/checkUser");
const { toggleLearningPathPublish, addLearningPath, updateLearningPath, deleteLearningPath, getAllLearningPaths,
     getSingleLearningPath, getSingleLearningPathByTitle, assignAdminsToLearningPath, 
     getLearningPathsForAdmin,
     assignAdminsToSection,
     recommendLearningPath,
     getMyRecommendations} = require("../../controllers/super-admin/learningPath.controller");
const upload = require("../../middleware/uploadLearningPath");
// const upload = require("../middlewares/uploadLearningPath");
router.get("/my-recommendations", protect, checkUser,  getMyRecommendations);
router.post("/", protect,upload.single("image"), checkUser, allowedTo("SUPER_ADMIN"), addLearningPath);
router.get("/", protect, getAllLearningPaths);
router.get("/admin",protect, checkUser,allowedTo("ADMIN","SUPER_ADMIN"), getLearningPathsForAdmin);
router.get("/:id",protect, checkUser, getSingleLearningPath);
router.get("/title/:title",protect, checkUser, getSingleLearningPathByTitle);

router.put("/:id", upload.single("image"),protect, checkUser, allowedTo("SUPER_ADMIN"), updateLearningPath);
router.patch("/:id/publish", protect, checkUser, allowedTo("SUPER_ADMIN"), toggleLearningPathPublish);
router.delete("/:id", protect, checkUser, allowedTo("SUPER_ADMIN"), deleteLearningPath);
// router.post('/:learningPathId/admins',protect, checkUser, allowedTo('SUPER_ADMIN'), assignAdminsToLearningPath)
router.post('/:learningPathId/admins',protect, checkUser, allowedTo('SUPER_ADMIN'), assignAdminsToSection)
router.post("/recommend",protect, checkUser, recommendLearningPath);


module.exports = router;