const router = require("express").Router();
const allowedTo = require("../../utils/allowedTo");
const { protect } = require("../../middleware/authMiddleware");
const checkUser = require("../../middleware/checkUser");
const {
  createProject,
  updateProject,
  deleteProject,
  getSingleProject,
  getAllProjectsByAdmin,
  getAllProjects,
  changeProjectStatus,
  assignAdminsToProject,
} = require("../../controllers/admin/projects.controllers");
const uploadProjectsImage = require("../../middleware/uploadProject");

// CREATE
router.post("/", protect, checkUser, allowedTo("ADMIN"),uploadProjectsImage.single("image"), createProject);



// READ
router.get(
  "/all",
  protect,
  checkUser,
  // allowedTo("SUPER_ADMIN"),
  getAllProjects,
);
router.get("/", protect, checkUser, allowedTo("ADMIN"), getAllProjectsByAdmin);
router.get("/:id", protect, checkUser, getSingleProject);

// UPDATE
router.put(
  "/:id",
  uploadProjectsImage.single("image"),
  protect,
  checkUser,
  allowedTo("ADMIN", "SUPER_ADMIN"),
  updateProject,
);

// DELETE
router.delete(
  "/:id",
  protect,
  checkUser,
  allowedTo("ADMIN", "SUPER_ADMIN"),
  deleteProject,
);
router.put(
  "/status/:id",
  protect,
  checkUser,
  allowedTo("SUPER_ADMIN"),
  changeProjectStatus,
);
router.post(
  "/learning-paths/:id/admin",
  protect,
  checkUser,
  allowedTo("SUPER_ADMIN"),
  assignAdminsToProject,
);
module.exports = router;
