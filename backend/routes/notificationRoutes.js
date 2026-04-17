const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification.controller');
const {protect} = require('../middleware/authMiddleware');
const allowedTo = require('../utils/allowedTo');

/**
 * =========================
 * USER NOTIFICATIONS
 * =========================
 */

// Get current user notifications
router.get(
  '/',
  protect,
  notificationController.getNotifications
);

// Mark all as read
router.patch(
  '/read-all',
  protect,
  notificationController.markAllAsRead
);

// Mark single notification as read
router.patch(
  '/:id/read',
  protect,
  notificationController.markAsRead
);

// Delete notification (owner or admin)
router.delete(
  '/:id',
  protect,
  notificationController.deleteNotification
);

/**
 * =========================
 * ADMIN ACTIONS
 * =========================
 */

// Create notification (ADMIN / SUPER_ADMIN)
router.post(
  '/',
  protect,
  allowedTo('ADMIN', 'SUPER_ADMIN'),
  notificationController.createNotification
);

// Send to specific role (ADMIN+)
router.post(
  '/send-to-role',
  protect,
  allowedTo('ADMIN', 'SUPER_ADMIN'),
  notificationController.sendToRole
);

// Broadcast to all users (SUPER_ADMIN only)
router.post(
  '/broadcast',
  protect,
  allowedTo('SUPER_ADMIN'),
  notificationController.broadcast
);

module.exports = router;