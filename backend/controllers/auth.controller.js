// controllers/auth.controller.js
// ✅ Fixes:
//   1. Login now sets JWT in HttpOnly cookie (secure storage)
//   2. Token ALSO returned in response body → backward compat for frontend / AI / mobile
//   3. Uses singleton prisma
//   4. errorHandler called consistently
'use strict';

const bcrypt         = require('bcryptjs');
const path           = require('path');
const fs             = require('fs');
const generateToken  = require('../utils/generateToken');
const sendEmail      = require('../utils/sendEmail');
const errorHandler   = require('../utils/errorHandler');
const prisma         = require('../prismaClient');

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
  try {
    const { email, name, password, confirmPassword } = req.body;

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

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email:    email.toLowerCase(),
        name:     name || null,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res
      .status(500)
      .json({ success: false, error: 'Failed to register', details: error.message });
  }
};

// ── Login ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    // ✅ Set token in HttpOnly cookie — browsers use this automatically
    res.cookie('token', token, cookieOptions());

    // ✅ Also return token in response body for:
    //    - React Native / mobile clients
    //    - AI service / server-to-server calls
    //    - Existing frontend that reads it from response (backward compat)
    res.json({
      success: true,
      message: 'Login successful',
      data:    { id: user.id, email: user.email, role: user.role, name: user.name },
      token,   // kept for backward compatibility
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res
      .status(500)
      .json({ success: false, error: 'Failed to login', details: error.message });
  }
};

// ── Logout ───────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
};

// ── Get current user ─────────────────────────────────────────
exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(errorHandler('Unauthorized', 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id:        true,
        email:     true,
        name:      true,
        role:      true,
        avatar:    true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return next(errorHandler('User not found', 404));
    }

    res.json({
      success: true,
      message: 'Current user fetched successfully',
      status:  200,
      data:    user,
    });
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

    const imageUrl = `/uploads/profileImage/${req.file.filename}`;

    await prisma.user.update({
      where: { id: req.user.id },
      data:  { avatar: imageUrl },
    });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data:    { image: imageUrl },
    });
  } catch (error) {
    console.error('Upload image error:', error.message);
    return next(errorHandler('Failed to upload image', 500));
  }
};

// ── Update profile ───────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(errorHandler('Unauthorized', 401));
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return next(errorHandler('User not found', 404));
    }

    const updateData = {};
    if (name)     updateData.name  = name;
    if (email)    updateData.email = email.toLowerCase();
    if (password) updateData.password = await bcrypt.hash(password, 12);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data:  updateData,
      select: {
        id:        true,
        email:     true,
        name:      true,
        role:      true,
        avatar:    true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data:    updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return next(errorHandler('Failed to update profile', 500));
  }
};

// ── Change user role ─────────────────────────────────────────
exports.changeUserRole = async (req, res, next) => {
  try {
    const { role, email } = req.body;

    const allowedRoles = ['STUDENT', 'ADMIN', 'SUPER_ADMIN'];
    if (!role || !allowedRoles.includes(role.toUpperCase())) {
      return next(errorHandler('Invalid role', 400));
    }

    const updatedUser = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data:  { role: role.toUpperCase() },
      select: { id: true, email: true, name: true, role: true },
    });

    res.json({
      success: true,
      message: 'Role updated successfully',
      data:    updatedUser,
    });
  } catch (error) {
    console.error('Change role error:', error.message);
    return next(errorHandler('Failed to change role', 500));
  }
};

// ── Get all users (paginated) ─────────────────────────────────
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role }              = req.query;
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (role === 'ADMIN')   filter.role = 'ADMIN';
    if (role === 'STUDENT') filter.role = 'STUDENT';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: filter,
        skip,
        take:  limit,
        select: {
          id:        true,
          email:     true,
          name:      true,
          role:      true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: filter }),
    ]);

    res.json({
      success: true,
      message: `Users fetched successfully`,
      data:    users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all users error:', error.message);
    return next(errorHandler('Failed to fetch users', 500));
  }
};

// ── Add user ─────────────────────────────────────────────────
exports.addUser = async (req, res, next) => {
  try {
    const { email, name, role, password } = req.body;

    if (!email || !name || !role || !password) {
      return next(errorHandler('All fields are required', 400));
    }

    const normalizedEmail = email.toLowerCase();
    const allowedRoles    = ['STUDENT', 'ADMIN', 'SUPER_ADMIN'];

    if (!allowedRoles.includes(role.toUpperCase())) {
      return next(errorHandler('Invalid role', 400));
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return next(errorHandler('User already exists', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email:    normalizedEmail,
        name,
        role:     role.toUpperCase(),
        password: hashedPassword,
      },
    });

    const { password: _pw, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: `${role} added successfully`,
      data:    userWithoutPassword,
    });
  } catch (error) {
    console.error('Add user error:', error.message);
    return next(errorHandler('Failed to add user', 500));
  }
};

// ── Delete user ──────────────────────────────────────────────
exports.deleteUser = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(errorHandler('Email is required', 400));
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      return next(errorHandler('User not found', 404));
    }

    await prisma.user.delete({ where: { id: user.id } });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    return next(errorHandler('Failed to delete user', 500));
  }
};

// ── Dashboard stats ──────────────────────────────────────────
exports.getAllDashboardStats = async (req, res, next) => {
  try {
    const [
      usersCount,
      studentsCount,
      adminsCount,
      learningPathsCount,
      roadmapsCount,
      lessonsCount,
      jobsCount,
      communitiesCount,
      projectsCount,
      roadmapsByLevel,
      lessonsByType
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      prisma.learningPath.count(),
      prisma.roadmap.count(),
      prisma.lesson.count(),
      prisma.job.count(),
      prisma.community.count(),
      prisma.project.count(),
      prisma.roadmap.groupBy({ by: ['level'], _count: { level: true } }),
      prisma.lesson.groupBy({ by: ['type'], _count: { type: true } }),
    ]);

    res.json({
      success: true,
      message: 'Dashboard stats fetched successfully',
      data: {
        users: usersCount,
        students: studentsCount,
        admins: adminsCount,
        learningPaths: learningPathsCount,
        roadmaps: roadmapsCount,
        lessons: lessonsCount,
        jobs: jobsCount,
        communities: communitiesCount,
        projects: projectsCount,
        roadmapsByLevel: roadmapsByLevel.map(r => ({ name: r.level, value: r._count.level })),
        lessonsByType: lessonsByType.map(l => ({ name: l.type, value: l._count.type })),
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    return next(errorHandler('Failed to fetch dashboard stats', 500));
  }
};