// middleware/role.middleware.js
// ✅ Fixed: `isSuspended` does NOT exist on the User model.
//    User suspension is not in the current schema — that check has been removed safely.
//    Community suspension uses `status` field (CommunityStatus enum: ACTIVE | SUSPENDED | ARCHIVED).
'use strict';

const prisma = require('../prismaClient');

// ══════════════════════════════════════════════════
// SUPER_ADMIN check
// ══════════════════════════════════════════════════
const requireSuperAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════
// ADMIN (or SUPER_ADMIN) check
// ══════════════════════════════════════════════════
const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════
// Community admin ownership check
// Uses community.status (CommunityStatus enum) NOT isSuspended
// ══════════════════════════════════════════════════
const requireCommunityAdmin = (paramKey = 'slug') => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const slug   = req.params[paramKey];

      const community = await prisma.community.findUnique({
        where: { slug },
        select: { id: true, createdById: true, status: true },
      });

      if (!community) {
        return res.status(404).json({ success: false, message: 'Community not found' });
      }

      // ✅ Use status enum field — schema has CommunityStatus: ACTIVE | SUSPENDED | ARCHIVED
      if (community.status === 'SUSPENDED') {
        return res.status(403).json({ success: false, message: 'Community is suspended' });
      }

      const isAdmin = await prisma.communityAdmin.findFirst({
        where: { communityId: community.id, userId, isActive: true },
      });

      const isCreator = community.createdById === userId;

      if (!isAdmin && !isCreator && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not an admin of this community',
        });
      }

      req.communityId = community.id;
      req.community   = community;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// ══════════════════════════════════════════════════
// STUDENT check
// ══════════════════════════════════════════════════
const requireStudent = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student privileges required',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════
// Role hierarchy check (minimum role)
// ══════════════════════════════════════════════════
const roleHierarchy = { STUDENT: 1, ADMIN: 2, SUPER_ADMIN: 3 };

const requireMinRole = (minRole) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true },
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if ((roleHierarchy[user.role] || 0) < (roleHierarchy[minRole] || 0)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. ${minRole} privileges required`,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requireSuperAdmin,
  requireAdmin,
  requireCommunityAdmin,
  requireStudent,
  requireMinRole,
};