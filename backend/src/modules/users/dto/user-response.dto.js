'use strict';

const getUserProfileResponseDto = (user, learningPathsWithProgress, userRoadmapProgress) => ({
  data: {
    ...user,
    learningPaths: learningPathsWithProgress,
    roadmapProgress: userRoadmapProgress,
  },
  success: true,
  message: 'Profile fetched successfully',
});

const updateUserProfileResponseDto = (updatedUser) => ({
  success: true,
  message: 'Profile updated successfully',
  data: updatedUser,
});

const uploadAvatarResponseDto = (avatarUrl) => ({
  success: true,
  message: 'Avatar uploaded successfully',
  data: { avatar: avatarUrl },
});

const uploadCoverResponseDto = (coverUrl) => ({
  success: true,
  message: 'Cover uploaded successfully',
  data: { cover: coverUrl },
});

const getUserStatsResponseDto = (stats) => ({
  success: true,
  data: stats,
});

const getUserBadgesResponseDto = (badges) => ({
  success: true,
  data: badges,
});

const assignBadgeResponseDto = (userBadge) => ({
  success: true,
  message: 'Badge assigned successfully',
  data: userBadge,
});

const getUserTracksResponseDto = (formatted) => ({
  success: true,
  data: formatted,
});

const getNotificationsResponseDto = (formatted, pagination) => ({
  success: true,
  data: formatted,
  pagination,
});

const markNotificationsReadResponseDto = () => ({
  success: true,
  message: 'All notifications marked as read',
});

const getUserByIdResponseDto = (user) => ({
  success: true,
  data: user,
});

module.exports = {
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
};
