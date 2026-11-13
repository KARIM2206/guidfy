'use strict';

const prisma = require('../../config/prismaClient');

const findEnrolledLearningPathsByUserId = (userId) => {
  return prisma.userLearningPath.findMany({
    where: {
      userId,
    },
    include: {
      learningPath: true,
    },
  });
};

const findUserRoadmapProgressByUserId = (userId) => {
  return prisma.userRoadmapProgress.findMany({
    where: { userId },
    select: {
      roadmapId: true,
      progressPercentage: true,
    },
  });
};

const findUserWithStatsAndNotificationsById = (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      stats: true,
      notifications: true,
    },
  });
};

const updateUserProfileById = (userId, updateData) => {
  return prisma.user.update({
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
};

const updateUserAvatarById = (userId, avatarUrl) => {
  return prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
  });
};

const updateUserCoverById = (userId, coverUrl) => {
  return prisma.user.update({
    where: { id: userId },
    data: { cover: coverUrl },
  });
};

const findUserStatsByUserId = (userId) => {
  return prisma.userStats.findUnique({
    where: { userId },
  });
};

const findUserBadgesByUserId = (userId) => {
  return prisma.userBadge.findMany({
    where: { userId },
    include: {
      badge: true,
    },
  });
};

const findUserBadgeByCompositeKey = (userId, badgeId) => {
  return prisma.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId } },
  });
};

const createUserBadge = (userId, badgeId) => {
  return prisma.userBadge.create({
    data: { userId, badgeId },
    include: { badge: true },
  });
};

const findTrackProgressByUserId = (userId) => {
  return prisma.trackProgress.findMany({
    where: { userId },
  });
};

const findNotificationsAndCountByUserId = (userId, skip, limit) => {
  return Promise.all([
    prisma.notification.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take:    limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
};

const markUnreadNotificationsAsReadByUserId = (userId) => {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data:  { read: true },
  });
};

const findUserPublicInfoById = (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      avatar: true,
      title: true,
      role: true,
    },
  });
};

module.exports = {
  findEnrolledLearningPathsByUserId,
  findUserRoadmapProgressByUserId,
  findUserWithStatsAndNotificationsById,
  updateUserProfileById,
  updateUserAvatarById,
  updateUserCoverById,
  findUserStatsByUserId,
  findUserBadgesByUserId,
  findUserBadgeByCompositeKey,
  createUserBadge,
  findTrackProgressByUserId,
  findNotificationsAndCountByUserId,
  markUnreadNotificationsAsReadByUserId,
  findUserPublicInfoById,
};
