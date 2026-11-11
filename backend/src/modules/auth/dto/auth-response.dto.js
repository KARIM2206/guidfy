'use strict';

const registerResponseDto = () => ({
  success: true,
  message: 'User registered successfully',
});

const loginResponseDto = (user, token) => ({
  success: true,
  message: 'Login successful',
  data:    { id: user.id, email: user.email, role: user.role, name: user.name },
  token,
});

const logoutResponseDto = () => ({
  success: true,
  message: 'Logged out successfully',
});

const getCurrentUserResponseDto = (user) => ({
  success: true,
  message: 'Current user fetched successfully',
  status:  200,
  data:    user,
});

const uploadImageResponseDto = (imageUrl) => ({
  success: true,
  message: 'Image uploaded successfully',
  data:    { image: imageUrl },
});

const updateProfileResponseDto = (updatedUser) => ({
  success: true,
  message: 'Profile updated successfully',
  data:    updatedUser,
});

const changeUserRoleResponseDto = (updatedUser) => ({
  success: true,
  message: 'Role updated successfully',
  data:    updatedUser,
});

const getAllUsersResponseDto = (users, pagination) => ({
  success: true,
  message: `Users fetched successfully`,
  data:    users,
  pagination,
});

const addUserResponseDto = (role, userWithoutPassword) => ({
  success: true,
  message: `${role} added successfully`,
  data:    userWithoutPassword,
});

const deleteUserResponseDto = () => ({
  success: true,
  message: 'User deleted successfully',
});

const getAllDashboardStatsResponseDto = (data) => ({
  success: true,
  message: 'Dashboard stats fetched successfully',
  data,
});

module.exports = {
  registerResponseDto,
  loginResponseDto,
  logoutResponseDto,
  getCurrentUserResponseDto,
  uploadImageResponseDto,
  updateProfileResponseDto,
  changeUserRoleResponseDto,
  getAllUsersResponseDto,
  addUserResponseDto,
  deleteUserResponseDto,
  getAllDashboardStatsResponseDto,
};

