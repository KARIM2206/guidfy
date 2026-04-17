const errorHandler = require('../utils/errorHandler');
const prismaClient = require('../prismaClient');
const { calculateLearningPathProgress } = require('../middleware/calculatePathProgress');
const prisma = prismaClient;
// ============================================================
// GET /api/users/:username  →  جلب بيانات البروفايل الكاملة
// ============================================================
exports.getUserProfile = async (req, res, next) => {
  try {

    const userId = req.user?.id;

    // ── LearningPaths المشترك فيها الطالب
    const enrolledLearningPaths = await prisma.userLearningPath.findMany({

      where: { 
        userId
       },
      include: {
        learningPath: true
      }
    });

    // ── حساب progress لكل LearningPath
    const learningPathsWithProgress = await Promise.all(
      enrolledLearningPaths.map(async (enrollment) => {

        const progress = await calculateLearningPathProgress(
          enrollment.learningPathId,
          userId
        );

        return {
          ...enrollment.learningPath,
          progress
        };

      })
    );

    // ── progress للـ roadmaps
    const userRoadmapProgress = await prisma.userRoadmapProgress.findMany({
      where: { userId },
      select: {
        roadmapId: true,
        progressPercentage: true
      }
    });
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    stats: true,
    notifications: true
  }
});

res.json({
  data: {
    ...user,
    learningPaths: learningPathsWithProgress,
    roadmapProgress: userRoadmapProgress
  }
  , success: true ,message: 'Profile fetched successfully'
});

  } catch (error) {
    next(error);
  }
};
// ============================================================
// PUT /api/users/profile  →  تحديث بيانات البروفايل
// ============================================================
exports.updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(errorHandler(401, 'Unauthorized'));

    const { name, title, bio, cover } = req.body;

    const updateData = {};
    if (name !== undefined)  updateData.name  = name;
    if (title !== undefined) updateData.title = title;
    if (bio !== undefined)   updateData.bio   = bio;
    if (cover !== undefined) updateData.cover = cover;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        title: true,
        bio: true,
        avatar: true,
        cover: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return next(errorHandler(500, 'Failed to update profile', error.message));
  }
};

// ============================================================
// POST /api/users/avatar  →  رفع صورة البروفايل
// ============================================================
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return next(errorHandler(400, 'No file uploaded'));

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: avatarUrl },
    });

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatar: avatarUrl },
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    return next(errorHandler(500, 'Failed to upload avatar', error.message));
  }
};

// ============================================================
// POST /api/users/cover  →  رفع صورة الغلاف
// ============================================================
exports.uploadCover = async (req, res, next) => {
  try {
    if (!req.file) return next(errorHandler(400, 'No file uploaded'));

    const coverUrl = `/uploads/covers/${req.file.filename}`;

    await prisma.user.update({
      where: { id: req.user.id },
      data: { cover: coverUrl },
    });

    res.json({
      success: true,
      message: 'Cover uploaded successfully',
      data: { cover: coverUrl },
    });
  } catch (error) {
    console.error('Upload cover error:', error);
    return next(errorHandler(500, 'Failed to upload cover', error.message));
  }
};

// ============================================================
// GET /api/users/:id/stats  →  جلب الإحصائيات
// ============================================================
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    const stats = await prisma.userStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      return next(errorHandler(404, 'Stats not found'));
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    return next(errorHandler(500, 'Failed to fetch stats', error.message));
  }
};

// ============================================================
// GET /api/users/:id/badges  →  جلب الـ Badges
// ============================================================
exports.getUserBadges = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
    });

    const badges = userBadges.map((ub) => ub.badge);

    res.json({ success: true, data: badges });
  } catch (error) {
    console.error('Get badges error:', error);
    return next(errorHandler(500, 'Failed to fetch badges', error.message));
  }
};

// ============================================================
// POST /api/admin/badges/assign  →  إضافة Badge لـ User (Admin)
// ============================================================
exports.assignBadge = async (req, res, next) => {
  try {
    const { userId, badgeId } = req.body;

    const existing = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId } },
    });

    if (existing) {
      return next(errorHandler(400, 'Badge already assigned'));
    }

    const userBadge = await prisma.userBadge.create({
      data: { userId, badgeId },
      include: { badge: true },
    });

    res.status(201).json({
      success: true,
      message: 'Badge assigned successfully',
      data: userBadge,
    });
  } catch (error) {
    console.error('Assign badge error:', error);
    return next(errorHandler(500, 'Failed to assign badge', error.message));
  }
};

// ============================================================
// GET /api/users/:id/tracks  →  جلب التراكات والتقدم
// ============================================================
exports.getUserTracks = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    const tracks = await prisma.trackProgress.findMany({
      where: { userId },
    });

    const formatted = tracks.map((t) => ({
      id: t.id,
      name: t.trackName,
      progress: t.progress,
      color: t.color,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Get tracks error:', error);
    return next(errorHandler(500, 'Failed to fetch tracks', error.message));
  }
};

// ============================================================
// GET /api/users/notifications  →  جلب نوتيفيكيشنز اليوزر
// ============================================================
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(errorHandler(401, 'Unauthorized'));

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const formatted = notifications.map((n) => ({
      id: n.id,
      type: n.type,
      message: n.message,
      time: n.createdAt,
      unread: !n.isRead,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Get notifications error:', error);
    return next(errorHandler(500, 'Failed to fetch notifications', error.message));
  }
};

// ============================================================
// PUT /api/users/notifications/read  →  تعليم كل النوتيفيكيشنز كـ مقروءة
// ============================================================
exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(errorHandler(401, 'Unauthorized'));

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    return next(errorHandler(500, 'Failed to update notifications', error.message));
  }
};