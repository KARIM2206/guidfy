// services/notification.service.js
const prisma = require('../prismaClient');
const { getIO } = require('../config/socket');

const SOCKET_EVENTS = {
  NEW: 'notification:new',
  READ: 'notification:read',
  ALL_READ: 'notification:all-read',
};

class NotificationService {
  /**
   * Create a notification and persist it to DB
   * @param {Object} params
   * @param {number} params.userId - Target user ID
   * @param {string} params.message - Notification message
   * @param {string} [params.type='info'] - Notification type: info|success|warning|error
   * @param {Object} [params.metadata] - Extra metadata (JSON)
   */
  async createNotification({ userId, message, type = 'info', metadata = null }) {
    // Validate user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Save to DB (source of truth)
    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
        type,
        read: false,
        metadata: metadata ? metadata : undefined,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    // Emit real-time event
    this.sendNotification(notification);

    return notification;
  }

  /**
   * Emit real-time socket event to user's room
   * @param {Object} notification - Notification object from DB
   */
  sendNotification(notification) {
    try {
      const io = getIO();
      const room = `user_${notification.userId}`;
      io.to(room).emit(SOCKET_EVENTS.NEW, {
        notification,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Socket not critical - DB is source of truth
      console.warn('[NotificationService] Socket emit failed (non-critical):', error.message);
    }
  }

  /**
   * Get all notifications for a user with pagination
   * @param {number} userId
   * @param {Object} options
   */
  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    const skip = (page - 1) * limit;

    const where = { userId, ...(unreadOnly && { read: false }) };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true } },
        },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      unreadCount,
    };
  }

  /**
   * Mark a single notification as read
   * @param {number} notificationId
   * @param {number} userId - For ownership validation
   */
  async markAsRead(notificationId, userId, userRole) {
    // Find notification
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error(`Notification with ID ${notificationId} not found`);
    }

    // RBAC: STUDENT can only mark their own notifications
    if (userRole === 'STUDENT' && notification.userId !== userId) {
      throw new Error('Access denied: You can only mark your own notifications as read');
    }

    if (notification.read) {
      return notification; // Already read, no-op
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Emit read event to the notification owner's room
    try {
      const io = getIO();
      io.to(`user_${notification.userId}`).emit(SOCKET_EVENTS.READ, {
        notificationId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('[NotificationService] Socket read emit failed:', error.message);
    }

    return updated;
  }

  /**
   * Mark all notifications as read for a user
   * @param {number} userId
   */
  async markAllAsRead(userId) {
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    // Emit all-read event
    try {
      const io = getIO();
      io.to(`user_${userId}`).emit(SOCKET_EVENTS.ALL_READ, {
        userId,
        count: result.count,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('[NotificationService] Socket all-read emit failed:', error.message);
    }

    return result;
  }

  /**
   * SUPER_ADMIN only: Broadcast notification to ALL users
   * @param {string} message
   * @param {string} type
   */
  async broadcastToAll(message, type = 'info', metadata = null) {
    const users = await prisma.user.findMany({ select: { id: true } });

    const notifications = await Promise.all(
      users.map((user) =>
        this.createNotification({ userId: user.id, message, type, metadata })
      )
    );

    return { count: notifications.length, notifications };
  }

  /**
   * ADMIN+: Send notification to specific role group
   * @param {string} role - Target role
   * @param {string} message
   */
  async sendToRole(role, message, type = 'info', metadata = null) {
    const users = await prisma.user.findMany({
      where: { role },
      select: { id: true },
    });

    const notifications = await Promise.all(
      users.map((user) =>
        this.createNotification({ userId: user.id, message, type, metadata })
      )
    );

    return { count: notifications.length, notifications };
  }

  /**
   * Delete a notification (ADMIN+)
   */
  async deleteNotification(notificationId, userId, userRole) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) throw new Error('Notification not found');

    if (userRole === 'STUDENT' && notification.userId !== userId) {
      throw new Error('Access denied');
    }

    await prisma.notification.delete({ where: { id: notificationId } });
    return { deleted: true, notificationId };
  }
}

module.exports = new NotificationService();