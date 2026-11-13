'use strict';

const { calculateLearningPathProgress } = require('../../common/middlewares/calculatePathProgress');
const usersRepository = require('./users.repository');

const getUserProfile = async (userId) => {
  // ── LearningPaths المشترك فيها الطالب
  const enrolledLearningPaths = await usersRepository.findEnrolledLearningPathsByUserId(userId);

  // ── حساب progress لكل LearningPath
  const learningPathsWithProgress = await Promise.all(
    enrolledLearningPaths.map(async (enrollment) => {
      const progress = await calculateLearningPathProgress(
        enrollment.learningPathId,
        userId
      );

      return {
        ...enrollment.learningPath,
        progress,
      };
    })
  );

  // ── progress للـ roadmaps
  const userRoadmapProgress = await usersRepository.findUserRoadmapProgressByUserId(userId);
  const user = await usersRepository.findUserWithStatsAndNotificationsById(userId);

  return {
    user,
    learningPathsWithProgress,
    userRoadmapProgress,
  };
};

const updateUserProfile = async (userId, { name, title, bio, cover }) => {
  const updateData = {};
  if (name !== undefined)  updateData.name  = name;
  if (title !== undefined) updateData.title = title;
  if (bio !== undefined)   updateData.bio   = bio;
  if (cover !== undefined) updateData.cover = cover;

  return usersRepository.updateUserProfileById(userId, updateData);
};

const uploadAvatar = async (userId, filename) => {
  const avatarUrl = `/uploads/avatars/${filename}`;
  await usersRepository.updateUserAvatarById(userId, avatarUrl);
  return avatarUrl;
};

const uploadCover = async (userId, filename) => {
  const coverUrl = `/uploads/covers/${filename}`;
  await usersRepository.updateUserCoverById(userId, coverUrl);
  return coverUrl;
};

const getUserStats = async (userId) => {
  return usersRepository.findUserStatsByUserId(userId);
};

const getUserBadges = async (userId) => {
  const userBadges = await usersRepository.findUserBadgesByUserId(userId);
  return userBadges.map((ub) => ub.badge);
};

const assignBadge = async ({ userId, badgeId }) => {
  const existing = await usersRepository.findUserBadgeByCompositeKey(userId, badgeId);
  if (existing) {
    return { alreadyAssigned: true };
  }

  const userBadge = await usersRepository.createUserBadge(userId, badgeId);
  return { userBadge };
};

const getUserTracks = async (userId) => {
  const tracks = await usersRepository.findTrackProgressByUserId(userId);

  return tracks.map((t) => ({
    id: t.id,
    name: t.trackName,
    progress: t.progress,
    color: t.color,
  }));
};

const getNotifications = async (userId, { page: rawPage, limit: rawLimit }) => {
  const page  = Math.max(1, Number(rawPage)  || 1);
  const limit = Math.min(100, Number(rawLimit) || 20);
  const skip  = (page - 1) * limit;

  const [notifications, total] = await usersRepository.findNotificationsAndCountByUserId(userId, skip, limit);

  // ✅ `read` is the correct schema field — NOT `isRead`
  const formatted = notifications.map((n) => ({
    id:        n.id,
    message:   n.message,
    type:      n.type,
    metadata:  n.metadata,
    createdAt: n.createdAt,
    unread:    !n.read,   // ← was !n.isRead (WRONG)
  }));

  return {
    formatted,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const markNotificationsRead = async (userId) => {
  await usersRepository.markUnreadNotificationsAsReadByUserId(userId);
};

const getUserById = async (userId) => {
  return usersRepository.findUserPublicInfoById(userId);
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  uploadCover,
  getUserStats,
  getUserBadges,
  assignBadge,
  getUserTracks,
  getNotifications,
  markNotificationsRead,
  getUserById,
};
