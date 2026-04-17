const express = require("express");
const router = express.Router();


const  {protect}  = require("../middleware/authMiddleware");
const { getPostById, getPostComments, createComment, deleteComment } = require("../controllers/post.controller");
// Post
router.get("/posts/:id", protect, getPostById);

// Comments
router.get("/posts/:id/comments", protect, getPostComments);
router.post("/posts/:id/comments", protect, createComment);

// Delete
router.delete("/comments/:id", protect, deleteComment);

module.exports = router;