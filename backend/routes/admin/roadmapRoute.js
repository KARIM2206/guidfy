const {
  addRoadmap,
  getAllRoadmaps,
  getSingleRoadmap,
  updateRoadmap,
  deleteRoadmap,
  toggleRoadmapPublish,
  getMyAssignedRoadmaps,
  assignAdmin,      // ✅ جديد
  removeAdmin,      // ✅ جديد
} = require("../../controllers/admin/roadmap.controllers");

const allowedTo = require("../../utils/allowedTo");
const { protect } = require("../../middleware/authMiddleware");
const checkUser = require("../../middleware/checkUser");

const router = require("express").Router();

// Assigned roadmaps (for logged-in admin/student)
router.get("/my", protect, checkUser, getMyAssignedRoadmaps);

// CRUD
router.post("/", protect, allowedTo("SUPER_ADMIN"), addRoadmap);
router.get("/", getAllRoadmaps);
router.get("/:id", getSingleRoadmap);
router.put("/:id", protect, allowedTo("SUPER_ADMIN"), updateRoadmap);
router.delete("/:id", protect, allowedTo("SUPER_ADMIN"), deleteRoadmap);

// Publish/Unpublish
router.patch("/:id/publish", protect, checkUser, allowedTo("SUPER_ADMIN"), toggleRoadmapPublish);

// ✅ Admin Assignment (NEW)
router.post("/:id/assign", protect, allowedTo("SUPER_ADMIN"), assignAdmin);
router.delete("/:id/assign/:adminId", protect, allowedTo("SUPER_ADMIN"), removeAdmin);

module.exports = router;