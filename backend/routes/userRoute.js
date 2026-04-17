const express = require('express');
const router = express.Router();



// ─── Multer Setup ───────────────────────────────────────────
const uploadProfile = require('../middleware/uploadProfile');
const allowedTo = require('../utils/allowedTo');
const checkUser = require('../middleware/checkUser');
const { protect } = require('../middleware/authMiddleware');
const { getCurrentUser } = require('../controllers/auth.controller');
const { getUserProfile, updateUserProfile, uploadAvatar, uploadCover, getUserStats, getUserBadges, getUserTracks, getNotifications, markAllNotificationsRead, assignBadge } = require('../controllers/userProfile.controller');

// ─── Profile Routes ─────────────────────────────────────────

// Public
router.get('/',protect,checkUser, getUserProfile);              // GET /api/users/:username

// Protected
router.put('/profile', protect, updateUserProfile);                      // PUT /api/users/profile
router.post('/avatar', protect, uploadProfile.single('avatar'), uploadAvatar);  // POST /api/users/avatar
router.post('/cover', protect, uploadProfile.single('cover'), uploadCover);     // POST /api/users/cover

// Stats & Tracks & Badges (Public by ID)
router.get('/:id/stats', getUserStats);    // GET /api/users/:id/stats
router.get('/:id/badges', getUserBadges);  // GET /api/users/:id/badges
router.get('/:id/tracks', getUserTracks);  // GET /api/users/:id/tracks

      // PUT /api/users/notifications/read

// Admin
router.post('/admin/badges/assign', protect, checkUser, allowedTo('ADMIN'), assignBadge);        // POST /api/admin/badges/assign

module.exports = router;