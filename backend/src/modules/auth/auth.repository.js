'use strict';

const prisma = require('../../config/prismaClient');

const createUser = (data) => {
  return prisma.user.create({ data });
};

const findUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const updateUserPassword = (id, hashedPassword) => {
  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });
};

const findCurrentUserById = (userId) => {
  return prisma.user.findUnique({
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
};

const updateUserAvatar = (userId, imageUrl) => {
  return prisma.user.update({
    where: { id: userId },
    data:  { avatar: imageUrl },
  });
};

const findUserById = (userId) => {
  return prisma.user.findUnique({ where: { id: userId } });
};

const updateUserProfileById = (userId, updateData) => {
  return prisma.user.update({
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
};

const updateUserRoleByEmail = (email, role) => {
  return prisma.user.update({
    where: { email },
    data:  { role },
    select: { id: true, email: true, name: true, role: true },
  });
};

const findUsersAndCount = (filter, skip, limit) => {
  return Promise.all([
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
};

const deleteUserById = (id) => {
  return prisma.user.delete({ where: { id } });
};

const getDashboardCounts = () => {
  return Promise.all([
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
};

module.exports = {
  createUser,
  findUserByEmail,
  updateUserPassword,
  findCurrentUserById,
  updateUserAvatar,
  findUserById,
  updateUserProfileById,
  updateUserRoleByEmail,
  findUsersAndCount,
  deleteUserById,
  getDashboardCounts,
};

