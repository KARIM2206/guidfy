const express = require('express');
const router = express.Router();



// ─── Multer Setup ───────────────────────────────────────────
const uploadProfile = require('../../common/middlewares/uploadProfile');
const allowedTo = require('../../common/utils/allowedTo');
const checkUser = require('../../common/middlewares/checkUser');
const { protect } = require('../../common/middlewares/authMiddleware');
const { getCurrentUser } = require('../auth/auth.controller');
const { getUserProfile, updateUserProfile, uploadAvatar, uploadCover, getUserStats, getUserBadges, getUserTracks, getNotifications, markAllNotificationsRead, assignBadge, getUserById } = require('./users.controller');

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
router.get('/:id/info', protect, getUserById); // GET /api/users/:id/info

      // PUT /api/users/notifications/read

// Admin
router.post('/admin/badges/assign', protect, checkUser, allowedTo('ADMIN'), assignBadge);        // POST /api/admin/badges/assign

module.exports = router;
