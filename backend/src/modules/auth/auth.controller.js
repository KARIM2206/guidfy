// src/modules/auth/auth.controller.js
// ✅ Fixes:
//   1. Login now sets JWT in HttpOnly cookie (secure storage)
//   2. Token ALSO returned in response body → backward compat for frontend / AI / mobile
//   3. Uses singleton prisma
//   4. errorHandler called consistently
'use strict';
const { performance } = require('perf_hooks');

const errorHandler = require('../../common/utils/errorHandler');
const authService  = require('./auth.service');
const {
  createRegisterDto,
  createUpdateProfileDto,
  createChangeUserRoleDto,
  createGetAllUsersDto,
  createAddUserDto,
  createDeleteUserDto,
} = require('./dto/register.dto');
const { createLoginDto } = require('./dto/login.dto');
const {
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
} = require('./dto/auth-response.dto');

// ── Cookie options (shared) ─────────────────────────────────
const cookieOptions = () => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production'?true:false, // HTTPS only in prod
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge:   30 * 24 * 60 * 60 * 1000, // 30 days in ms
  path:     '/',
});

// ── Register ─────────────────────────────────────────────────

exports.register = async (req, res) => {
  const startTime = performance.now(); // ⏱️ بدء حساب الوقت

  try {
    const dto = createRegisterDto(req.body);
    const { email, password, confirmPassword } = dto;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: 'Email and password are required' });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, error: 'Passwords do not match' });
    }

    await authService.register(dto);

    const endTime = performance.now(); // ⏱️ نهاية حساب الوقت
    console.log(`[Register Success] Duration: ${(endTime - startTime).toFixed(2)} ms`);

    res.status(201).json(registerResponseDto());
  } catch (error) {
    const endTime = performance.now(); // ⏱️ نهاية حساب الوقت حتى في حالة الخطأ
    console.error(`[Register Error] Duration: ${(endTime - startTime).toFixed(2)} ms | Error:`, error.message);

    res
      .status(500)
      .json({ success: false, error: 'Failed to register', details: error.message });
  }
};


// ── Login ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const startTime = performance.now();

  try {
    const dto = createLoginDto(req.body);
    const { email, password } = dto;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: 'Email and password are required' });
    }

    const result = await authService.login(dto);

    if (result.invalidCredentials) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid credentials' });
    }

    const { user, token } = result;

    // ✅ Set token in HttpOnly cookie
    res.cookie('token', token, cookieOptions());

    const endTime = performance.now();
    console.log(`[Login Success - Optimized] Duration: ${(endTime - startTime).toFixed(2)} ms`);

    res.json(loginResponseDto(user, token));
  } catch (error) {
    const endTime = performance.now();
    console.error(`[Login Error] Duration: ${(endTime - startTime).toFixed(2)} ms | Error:`, error.message);
    res
      .status(500)
      .json({ success: false, error: 'Failed to login', details: error.message });
  }
};

// ── Logout ───────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json(logoutResponseDto());
};

// ── Get current user ─────────────────────────────────────────
exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(errorHandler('Unauthorized', 401));
    }

    const user = await authService.getCurrentUser(userId);

    if (!user) {
      return next(errorHandler('User not found', 404));
    }

    res.json(getCurrentUserResponseDto(user));
  } catch (error) {
    console.error('Get current user error:', error.message);
    return next(errorHandler('Failed to fetch current user', 500));
  }
};

// ── Upload profile image ─────────────────────────────────────
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(errorHandler('No file uploaded', 400));
    }

    const imageUrl = await authService.uploadImage(req.user.id, req.file.filename);

    res.json(uploadImageResponseDto(imageUrl));
  } catch (error) {
    console.error('Upload image error:', error.message);
    return next(errorHandler('Failed to upload image', 500));
  }
};

// ── Update profile ───────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const dto = createUpdateProfileDto(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return next(errorHandler('Unauthorized', 401));
    }

    const updatedUser = await authService.updateProfile(userId, dto);
    if (!updatedUser) {
      return next(errorHandler('User not found', 404));
    }

    res.json(updateProfileResponseDto(updatedUser));
  } catch (error) {
    console.error('Update profile error:', error.message);
    return next(errorHandler('Failed to update profile', 500));
  }
};

// ── Change user role ─────────────────────────────────────────
exports.changeUserRole = async (req, res, next) => {
  try {
    const dto = createChangeUserRoleDto(req.body);
    const { role } = dto;

    const allowedRoles = ['STUDENT', 'ADMIN', 'SUPER_ADMIN'];
    if (!role || !allowedRoles.includes(role.toUpperCase())) {
      return next(errorHandler('Invalid role', 400));
    }

    const updatedUser = await authService.changeUserRole(dto);

    res.json(changeUserRoleResponseDto(updatedUser));
  } catch (error) {
    console.error('Change role error:', error.message);
    return next(errorHandler('Failed to change role', 500));
  }
};

// ── Get all users (paginated) ─────────────────────────────────
exports.getAllUsers = async (req, res, next) => {
  try {
    const dto = createGetAllUsersDto(req.query);
    const { users, pagination } = await authService.getAllUsers(dto);

    res.json(getAllUsersResponseDto(users, pagination));
  } catch (error) {
    console.error('Get all users error:', error.message);
    return next(errorHandler('Failed to fetch users', 500));
  }
};

// ── Add user ─────────────────────────────────────────────────
exports.addUser = async (req, res, next) => {
  try {
    const dto = createAddUserDto(req.body);
    const { email, name, role, password } = dto;

    if (!email || !name || !role || !password) {
      return next(errorHandler('All fields are required', 400));
    }

    const normalizedEmail = email.toLowerCase();
    const allowedRoles    = ['STUDENT', 'ADMIN', 'SUPER_ADMIN'];

    if (!allowedRoles.includes(role.toUpperCase())) {
      return next(errorHandler('Invalid role', 400));
    }

    const result = await authService.addUser({ email: normalizedEmail, name, role, password });
    if (result.alreadyExists) {
      return next(errorHandler('User already exists', 400));
    }

    res.status(201).json(addUserResponseDto(role, result.userWithoutPassword));
  } catch (error) {
    console.error('Add user error:', error.message);
    return next(errorHandler('Failed to add user', 500));
  }
};

// ── Delete user ──────────────────────────────────────────────
exports.deleteUser = async (req, res, next) => {
  try {
    const dto = createDeleteUserDto(req.body);
    const { email } = dto;

    if (!email) {
      return next(errorHandler('Email is required', 400));
    }

    const result = await authService.deleteUser(email);
    if (result.notFound) {
      return next(errorHandler('User not found', 404));
    }

    res.json(deleteUserResponseDto());
  } catch (error) {
    console.error('Delete user error:', error.message);
    return next(errorHandler('Failed to delete user', 500));
  }
};

// ── Dashboard stats ──────────────────────────────────────────
exports.getAllDashboardStats = async (req, res, next) => {
  try {
    const data = await authService.getAllDashboardStats();

    res.json(getAllDashboardStatsResponseDto(data));
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    return next(errorHandler('Failed to fetch dashboard stats', 500));
  }
};

