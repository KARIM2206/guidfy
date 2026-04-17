const router = require("express").Router();
const { addStepToRoadmap, getStepsByRoadmap, getSingleStep, updateStep, deleteStep } = require("../../controllers/admin/step.controller");
const allowedTo = require("../../utils/allowedTo");
const { protect } = require("../../middleware/authMiddleware");
const checkUser = require("../../middleware/checkUser")
router.post("/", protect, checkUser,allowedTo("ADMIN"), addStepToRoadmap);
router.get("/roadmap/:roadmapId", getStepsByRoadmap);
router.get("/:id", getSingleStep);
router.put("/:id", protect, checkUser, allowedTo("ADMIN"), updateStep);
router.delete("/:id", protect, checkUser, allowedTo("ADMIN"), deleteStep);

module.exports = router;