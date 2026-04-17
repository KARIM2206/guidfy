// controllers/notification.controller.js
const notificationService = require('../services/notification.service');
const { successResponse, errorResponse, paginatedResponse } = require('../config/response');

class NotificationController {
  /**
   * GET /api/notifications
   * Get notifications for authenticated user
   */
  async getNotifications(req, res) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      const userId = req.user.id;

      const result = await notificationService.getUserNotifications(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        unreadOnly: unreadOnly === 'true',
      });

      return paginatedResponse(
        res,
        result.notifications,
        { ...result.pagination, unreadCount: result.unreadCount },
        'Notifications retrieved successfully'
      );
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * POST /api/notifications
   * Create notification (ADMIN/SUPER_ADMIN)
   */
  async createNotification(req, res) {
    try {
      const { userId, message, type = 'info', metadata } = req.body;
      const requester = req.user;

      if (!userId || !message) {
        return errorResponse(res, 'userId and message are required', 400);
      }

      // STUDENT cannot create notifications for others
      if (requester.role === 'STUDENT' && parseInt(userId) !== requester.id) {
        return errorResponse(res, 'Students cannot create notifications for other users', 403);
      }

      const notification = await notificationService.createNotification({
        userId: parseInt(userId),
        message,
        type,
        metadata,
      });

      return successResponse(res, notification, 'Notification created successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, error.message.includes('not found') ? 404 : 500);
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark single notification as read
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const { id: userId, role } = req.user;

      if (!id || isNaN(parseInt(id))) {
        return errorResponse(res, 'Valid notification ID is required', 400);
      }

      const notification = await notificationService.markAsRead(parseInt(id), userId, role);
      return successResponse(res, notification, 'Notification marked as read');
    } catch (error) {
      const status = error.message.includes('not found') ? 404 :
                     error.message.includes('Access denied') ? 403 : 500;
      return errorResponse(res, error.message, status);
    }
  }

  /**
   * PATCH /api/notifications/read-all
   * Mark all notifications as read for current user
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      const result = await notificationService.markAllAsRead(userId);
      return successResponse(res, { updatedCount: result.count }, 'All notifications marked as read');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * POST /api/notifications/broadcast
   * SUPER_ADMIN only: broadcast to all users
   */
  async broadcast(req, res) {
    try {
      const { message, type = 'info', metadata } = req.body;
      if (!message) return errorResponse(res, 'message is required', 400);

      const result = await notificationService.broadcastToAll(message, type, metadata);
      return successResponse(res, result, 'Broadcast sent successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * POST /api/notifications/send-to-role
   * ADMIN+: send to specific role
   */
  async sendToRole(req, res) {
    try {
      const { role, message, type = 'info', metadata } = req.body;
      if (!role || !message) return errorResponse(res, 'role and message are required', 400);

      const validRoles = ['STUDENT', 'ADMIN', 'SUPER_ADMIN'];
      if (!validRoles.includes(role)) {
        return errorResponse(res, `Invalid role. Valid roles: ${validRoles.join(', ')}`, 400);
      }

      const result = await notificationService.sendToRole(role, message, type, metadata);
      return successResponse(res, result, `Notification sent to all ${role}s`, 201);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * DELETE /api/notifications/:id
   */
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const { id: userId, role } = req.user;

      const result = await notificationService.deleteNotification(parseInt(id), userId, role);
      return successResponse(res, result, 'Notification deleted successfully');
    } catch (error) {
      const status = error.message.includes('not found') ? 404 :
                     error.message.includes('Access denied') ? 403 : 500;
      return errorResponse(res, error.message, status);
    }
  }
}

module.exports = new NotificationController();