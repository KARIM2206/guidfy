// middleware/role.middleware.js

const prisma = require('../prismaClient');

// ═══════════════════════════════════════════════════
// Role Authorization Middleware
// ═══════════════════════════════════════════════════

const requireSuperAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isSuspended: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Account suspended',
      });
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

// ═══════════════════════════════════════════════════
// Admin Authorization Middleware
// ═══════════════════════════════════════════════════

const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isSuspended: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Account suspended',
      });
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

// ═══════════════════════════════════════════════════
// Community Admin Ownership Check
// ═══════════════════════════════════════════════════

const requireCommunityAdmin = (paramKey = 'slug') => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const slug = req.params[paramKey];

      const community = await prisma.community.findUnique({
        where: { slug },
        select: { id: true, createdById: true, isSuspended: true },
      });

      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Community not found',
        });
      }

      if (community.isSuspended) {
        return res.status(403).json({
          success: false,
          message: 'Community is suspended',
        });
      }

      const isAdmin = await prisma.communityAdmin.findFirst({
        where: {
          communityId: community.id,
          userId: userId,
          isActive: true,
        },
      });

      const isCreator = community.createdById === userId;

      if (!isAdmin && !isCreator && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not an admin of this community',
        });
      }

      req.communityId = community.id;
      req.community = community;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// ═══════════════════════════════════════════════════
// Student Role Check
// ═══════════════════════════════════════════════════

const requireStudent = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isSuspended: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Account suspended',
      });
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

// ═══════════════════════════════════════════════════
// Role Hierarchy Check
// ═══════════════════════════════════════════════════

const requireMinRole = (minRole) => {
  const roleHierarchy = {
    STUDENT: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3,
  };

  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, isSuspended: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (user.isSuspended) {
        return res.status(403).json({
          success: false,
          message: 'Account suspended',
        });
      }

      if (roleHierarchy[user.role] < roleHierarchy[minRole]) {
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