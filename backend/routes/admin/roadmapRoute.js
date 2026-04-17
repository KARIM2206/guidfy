const { addRoadmap, getAllRoadmaps, getSingleRoadmap, updateRoadmap, deleteRoadmap, toggleRoadmapPublish, getMyAssignedRoadmaps } = require("../../controllers/admin/roadmap.controllers");
const allowedTo = require("../../utils/allowedTo");
const { protect } = require("../../middleware/authMiddleware");
// const { toggleRoadmapPublish } = require("../../controllers/super-admin/learningPath.controller");
const checkUser = require("../../middleware/checkUser");
const router = require("express").Router();
router.get("/my", protect, checkUser, getMyAssignedRoadmaps);

router.post("/", protect, allowedTo("SUPER_ADMIN"), addRoadmap);
router.get("/", getAllRoadmaps);
router.get("/:id", getSingleRoadmap);
router.put("/:id", protect, allowedTo("SUPER_ADMIN"), updateRoadmap);
router.delete("/:id", protect, allowedTo("SUPER_ADMIN"), deleteRoadmap);
router.patch("/:id/publish", protect, checkUser, allowedTo("SUPER_ADMIN"), toggleRoadmapPublish);

module.exports = router;
