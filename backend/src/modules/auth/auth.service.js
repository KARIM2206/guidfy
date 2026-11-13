'use strict';

const bcrypt         = require('bcryptjs');
const argon2         = require('argon2');
const generateToken  = require('../../common/utils/generateToken');
const authRepository = require('./auth.repository');

const register = async ({ email, name, password }) => {
  const hashedPassword = await argon2.hash(password);

  await authRepository.createUser({
    email:    email.toLowerCase(),
    name:     name || null,
    password: hashedPassword,
  });
};

const login = async ({ email, password }) => {
  // جلب البيانات الأساسية للمستخدم فقط دون أي include إضافي غير ضروري لنحافظ على السرعة
  const user = await authRepository.findUserByEmail(email.toLowerCase());

  if (!user) {
    return { invalidCredentials: true };
  }

  let isMatch = false;
  let needsUpgrade = false;

  // 1. الفحص الذكي لنوع التشفير المستخدم في قاعدة البيانات
  if (user.password.startsWith('$argon2')) {
    // الحسابات الجديدة السريعة والآمنة
    isMatch = await argon2.verify(user.password, password);
  } else if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
    // الحسابات القديمة المعتمدة على bcrypt
    isMatch = await bcrypt.compare(password, user.password);
    needsUpgrade = isMatch; // إذا كانت البيانات صحيحة، نحدد الحساب للتحديث فوراً
  } else {
    // في حال وجود تشفير آخر غير مدعوم
    return { invalidCredentials: true };
  }

  if (!isMatch) {
    return { invalidCredentials: true };
  }

  // 2. تحديث الحساب القديم تلقائياً بالخلفية لـ Argon2 لكي يصبح سريعاً في المرات القادمة
  if (needsUpgrade) {
    const newHash = await argon2.hash(password);
    await authRepository.updateUserPassword(user.id, newHash)
      .catch(err => console.error('Failed to upgrade user password hash:', err.message));
  }

  const token = generateToken(user.id);

  return { user, token };
};

const getCurrentUser = async (userId) => {
  return authRepository.findCurrentUserById(userId);
};

const uploadImage = async (userId, filename) => {
  const imageUrl = `/uploads/profileImage/${filename}`;
  await authRepository.updateUserAvatar(userId, imageUrl);
  return imageUrl;
};

const updateProfile = async (userId, { name, email, password }) => {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    return null;
  }

  const updateData = {};
  if (name)     updateData.name  = name;
  if (email)    updateData.email = email.toLowerCase();
  if (password) updateData.password = await bcrypt.hash(password, 12);

  return authRepository.updateUserProfileById(userId, updateData);
};

const changeUserRole = async ({ role, email }) => {
  return authRepository.updateUserRoleByEmail(email.toLowerCase(), role.toUpperCase());
};

const getAllUsers = async ({ role, page: rawPage, limit: rawLimit }) => {
  const page  = Math.max(1, Number(rawPage)  || 1);
  const limit = Math.min(100, Number(rawLimit) || 20);
  const skip  = (page - 1) * limit;

  const filter = {};
  if (role === 'ADMIN')   filter.role = 'ADMIN';
  if (role === 'STUDENT') filter.role = 'STUDENT';

  const [users, total] = await authRepository.findUsersAndCount(filter, skip, limit);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const addUser = async ({ email: normalizedEmail, name, role, password }) => {
  const existingUser = await authRepository.findUserByEmail(normalizedEmail);
  if (existingUser) {
    return { alreadyExists: true };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await authRepository.createUser({
    email:    normalizedEmail,
    name,
    role:     role.toUpperCase(),
    password: hashedPassword,
  });

  const { password: _pw, ...userWithoutPassword } = newUser;

  return { userWithoutPassword };
};

const deleteUser = async (email) => {
  const user = await authRepository.findUserByEmail(email.toLowerCase());
  if (!user) {
    return { notFound: true };
  }

  await authRepository.deleteUserById(user.id);
  return { deleted: true };
};

const getAllDashboardStats = async () => {
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
  ] = await authRepository.getDashboardCounts();

  return {
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
  };
};

module.exports = {
  register,
  login,
  getCurrentUser,
  uploadImage,
  updateProfile,
  changeUserRole,
  getAllUsers,
  addUser,
  deleteUser,
  getAllDashboardStats,
};

