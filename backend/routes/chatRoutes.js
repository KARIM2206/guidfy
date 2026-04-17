const express = require("express");
const router = express.Router();
const {protect}=require("../middleware/authMiddleware");
const { sendMessage, getConversation, getInbox } = require("../controllers/chat.controller");

router.post("/messages",        protect, sendMessage);
router.get("/messages/:userId", protect, getConversation);
router.get("/inbox",            protect, getInbox);

module.exports = router;