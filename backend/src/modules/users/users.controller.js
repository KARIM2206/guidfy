const errorHandler = require('../../common/utils/errorHandler');
const usersService = require('./users.service');
const {
  createUpdateProfileDto,
  createAssignBadgeDto,
  createUserIdParamDto,
  createGetNotificationsDto,
} = require('./dto/update-profile.dto');
const {
  getUserProfileResponseDto,
  updateUserProfileResponseDto,
  uploadAvatarResponseDto,
  uploadCoverResponseDto,
  getUserStatsResponseDto,
  getUserBadgesResponseDto,
  assignBadgeResponseDto,
  getUserTracksResponseDto,
  getNotificationsResponseDto,
  markNotificationsReadResponseDto,
  getUserByIdResponseDto,
} = require('./dto/user-response.dto');

// ============================================================
// GET /api/users/:username  →  جلب بيانات البروفايل الكاملة
// ============================================================
exports.getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const { user, learningPathsWithProgress, userRoadmapProgress } = await usersService.getUserProfile(userId);

    res.json(getUserProfileResponseDto(user, learningPathsWithProgress, userRoadmapProgress));
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

    const dto = createUpdateProfileDto(req.body);
    const updatedUser = await usersService.updateUserProfile(userId, dto);

    res.json(updateUserProfileResponseDto(updatedUser));
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

    const avatarUrl = await usersService.uploadAvatar(req.user.id, req.file.filename);

    res.json(uploadAvatarResponseDto(avatarUrl));
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

    const coverUrl = await usersService.uploadCover(req.user.id, req.file.filename);

    res.json(uploadCoverResponseDto(coverUrl));
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
    const dto = createUserIdParamDto(req.params);
    const userId = parseInt(dto.id);

    const stats = await usersService.getUserStats(userId);

    if (!stats) {
      return next(errorHandler(404, 'Stats not found'));
    }

    res.json(getUserStatsResponseDto(stats));
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
    const dto = createUserIdParamDto(req.params);
    const userId = parseInt(dto.id);

    const badges = await usersService.getUserBadges(userId);

    res.json(getUserBadgesResponseDto(badges));
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
    const dto = createAssignBadgeDto(req.body);
    const result = await usersService.assignBadge(dto);

    if (result.alreadyAssigned) {
      return next(errorHandler(400, 'Badge already assigned'));
    }

    res.status(201).json(assignBadgeResponseDto(result.userBadge));
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
    const dto = createUserIdParamDto(req.params);
    const userId = parseInt(dto.id);

    const formatted = await usersService.getUserTracks(userId);

    res.json(getUserTracksResponseDto(formatted));
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
    const dto = createGetNotificationsDto(req.query);

    const { formatted, pagination } = await usersService.getNotifications(userId, dto);

    res.json(getNotificationsResponseDto(formatted, pagination));
  } catch (error) {
    console.error('Get notifications error:', error.message);
    return next(errorHandler('Failed to fetch notifications', 500));
  }
};

// ── PUT /api/users/notifications/read ────────────────────────
// Mark all unread notifications as read
// ✅ `read` is the correct schema field — NOT `isRead`
exports.markNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    await usersService.markNotificationsRead(userId);

    res.json(markNotificationsReadResponseDto());
  } catch (error) {
    console.error('Mark notifications read error:', error.message);
    return next(errorHandler('Failed to update notifications', 500));
  }
};

// ============================================================
// GET /api/users/:id/info  →  جلب بيانات عامة (name, avatar) بالـ ID
// ============================================================
exports.getUserById = async (req, res, next) => {
  try {
    const dto = createUserIdParamDto(req.params);
    const userId = parseInt(dto.id);
    if (isNaN(userId)) return next(errorHandler(400, 'Invalid user ID'));

    const user = await usersService.getUserById(userId);

    if (!user) return next(errorHandler(404, 'User not found'));

    res.json(getUserByIdResponseDto(user));
  } catch (error) {
    console.error('getUserById error:', error.message);
    return next(errorHandler(500, 'Failed to fetch user', error.message));
  }
};
