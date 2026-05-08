// controllers/superAdmin.controller.js

const prisma = require('../config/prisma');

// ═══════════════════════════════════════════════════
// Helper: Create Audit Log
// ═══════════════════════════════════════════════════

const createAuditLog = async (adminId, action, details, communityId = null) => {
  await prisma.adminActionLog.create({
    data: {
      adminId,
      action,
      details,
      communityId,
    },
  });
};

// ═══════════════════════════════════════════════════
// Helper: Pagination Meta
// ═══════════════════════════════════════════════════

const getPaginationMeta = (total, page, limit) => {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
};

// ═══════════════════════════════════════════════════
// Get All Communities (Super Admin)
// ═══════════════════════════════════════════════════

const getAllCommunities = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (status === 'active') {
      where.isSuspended = false;
    } else if (status === 'suspended') {
      where.isSuspended = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        skip,
        take,
        include: {
          creator: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          admins: {
            where: { isActive: true },
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true },
              },
            },
          },
          _count: {
            select: {
              members: true,
              posts: true,
              questions: true,
              reports: { where: { status: 'PENDING' } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.community.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: communities,
      pagination: getPaginationMeta(total, parseInt(page), take),
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════
// Suspend Community
// ═══════════════════════════════════════════════════

const suspendCommunity = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { id: true, name: true, isSuspended: true },
    });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    if (community.isSuspended) {
      return res.status(400).json({
        success: false,
        message: 'Community is already suspended',
      });
    }

    const updatedCommunity = await prisma.community.update({
      where: { id: communityId },
      data: {
        isSuspended: true,
        suspensionReason: reason || 'No reason provided',
        suspendedAt: new Date(),
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await createAuditLog(
      adminId,
      'SUSPEND_COMMUNITY',
      `Suspended community "${community.name}". Reason: ${reason || 'No reason provided'}`,
      communityId
    );

    res.status(200).json({
      success: true,
      message: 'Community suspended successfully',
      data: updatedCommunity,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════
// Activate Community
// ═══════════════════════════════════════════════════

const activateCommunity = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const adminId = req.user.id;

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { id: true, name: true, isSuspended: true },
    });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    if (!community.isSuspended) {
      return res.status(400).json({
        success: false,
        message: 'Community is already active',
      });
    }

    const updatedCommunity = await prisma.community.update({
      where: { id: communityId },
      data: {
        isSuspended: false,
        suspensionReason: null,
        suspendedAt: null,
      },
    });

    await createAuditLog(
      adminId,
      'ACTIVATE_COMMUNITY',
      `Activated community "${community.name}"`,
      communityId
    );

    res.status(200).json({
      success: true,
      message: 'Community activated successfully',
      data: updatedCommunity,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════
// Delete Any Community
// ═══════════════════════════════════════════════════

const deleteAnyCommunity = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const adminId = req.user.id;

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { id: true, name: true },
    });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.communityAdmin.deleteMany({ where: { communityId } });
      await tx.communityMember.deleteMany({ where: { communityId } });
      await tx.post.deleteMany({ where: { communityId } });
      await tx.question.deleteMany({ where: { communityId } });
      await tx.report.deleteMany({ where: { communityId } });
      await tx.adminActionLog.deleteMany({ where: { communityId } });
      await tx.community.delete({ where: { id: communityId } });
    });

    await createAuditLog(
      adminId,
      'DELETE_COMMUNITY',
      `Permanently deleted community "${community.name}"`,
      null
    );

    res.status(200).json({
      success: true,
      message: 'Community deleted permanently',
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════
// Get All Reports (Super Admin)
// ═══════════════════════════════════════════════════

const getAllReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.targetType = type;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take,
        include: {
          reporter: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          community: {
            select: { id: true, name: true, slug: true },
          },
          post: {
            select: { id: true, title: true, content: true },
          },
          question: {
            select: { id: true, title: true, content: true },
          },
          resolvedBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.report.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: getPaginationMeta(total, parseInt(page), take),
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════
// Get Reported Communities
// ═══════════════════════════════════════════════════

const getReportedCommunities = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const communities = await prisma.community.findMany({
      where: {
        reports: {
          some: { status: 'PENDING' },
        },
      },
      skip,
      take,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            reports: { where: { status: 'PENDING' } },
            members: true,
            posts: true,
          },
        },
        reports: {
          where: { status: 'PENDING' },
          take: 5,
          include: {
            reporter: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: {
        reports: {
          _count: 'desc',
        },
      },
    });

    const total = await prisma.community.count({
      where: {
        reports: {
          some: { status: 'PENDING' },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: communities,
      pagination: getPaginationMeta(total, parseInt(page), take),
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════
// Resolve Report (Super Admin)
// ═══════════════════════════════════════════════════

const resolveReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { action, note } = req.body;
    const adminId = req.user.id;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        community: { select: { id: true, name: true } },
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    if (report.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Report is already resolved',
      });
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'RESOLVED',
        resolutionAction: action,
        resolutionNote: note,
        resolvedById: adminId,
        resolvedAt: new Date(),
      },
    });

    await createAuditLog(
      adminId,
      'RESOLVE_REPORT',
      `Resolved report #${reportId} with action: ${action}. ${note ? `Note: ${note}` : ''}`,
      report.communityId
    );

    res.status(200).json({
      success: true,
      message: 'Report resolved successfully',
      data: updatedReport,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════
// Dismiss Report (Super Admin)
// ═══════════════════════════════════════════════════

const dismissReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        community: { select: { id: true, name: true } },
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    if (report.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Report is already resolved',
      });
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'DISMISSED',
        resolutionAction: 'DISMISSED',
        resolutionNote: reason || 'Report dismissed',
        resolvedById: adminId,
        resolvedAt: new Date(),
      },
    });

    await createAuditLog(
      adminId,
      'DISMISS_REPORT',
      `Dismissed report #${reportId}. Reason: ${reason || 'No reason provided'}`,
      report.communityId
    );

    res.status(200).json({
      success: true,
      message: 'Report dismissed',
      data: updatedReport,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════
// Get Platform Analytics
// ═══════════════════════════════════════════════════

const getPlatformAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const [
      totalUsers,
      totalCommunities,
      totalPosts,
      totalQuestions,
      totalReports,
      activeUsers,
      newUsers,
      newCommunities,
      newPosts,
      suspendedCommunities,
      topCommunities,
      dailyStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.community.count(),
      prisma.post.count(),
      prisma.question.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.user.count({
        where: { lastActiveAt: { gte: startDate } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.community.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.post.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.community.count({
        where: { isSuspended: true },
      }),
      prisma.community.findMany({
        take: 10,
        include: {
          _count: {
            select: {
              members: true,
              posts: true,
              questions: true,
            },
          },
        },
        orderBy: {
          members: { _count: 'desc' },
        },
      }),
      prisma.$queryRaw`
        SELECT 
          DATE(createdAt) as date,
          COUNT(*)::int as count
        FROM Community
        WHERE createdAt >= ${startDate}
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `,
    ]);

    const userGrowth = await prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*)::int as count
      FROM User
      WHERE createdAt >= ${startDate}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalCommunities,
          totalPosts,
          totalQuestions,
          pendingReports: totalReports,
          activeUsers,
          suspendedCommunities,
        },
        growth: {
          newUsers,
          newCommunities,
          newPosts,
        },
        topCommunities,
        charts: {
          communityGrowth: dailyStats,
          userGrowth,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════
// Get All Admins
// ═══════════════════════════════════════════════════

const getAllAdmins = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [admins, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          isSuspended: true,
          createdAt: true,
          adminCommunities: {
            where: { isActive: true },
            include: {
              community: {
                select: { id: true, name: true, slug: true, isSuspended: true },
              },
            },
          },
          createdCommunities: {
            select: { id: true, name: true, slug: true, isSuspended: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: admins,
      pagination: getPaginationMeta(total, parseInt(page), take),
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════
// Assign Admin to Community
// ═══════════════════════════════════════════════════

const assignAdmin = async (req, res, next) => {
  try {
    const { userId, communityId } = req.body;
    const superAdminId = req.user.id;

    const [user, community] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, role: true, isSuspended: true },
      }),
      prisma.community.findUnique({
        where: { id: communityId },
        select: { id: true, name: true },
      }),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    if (user.isSuspended) {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign a suspended user as admin',
      });
    }

    const existingAdmin = await prisma.communityAdmin.findFirst({
      where: {
        communityId,
        userId,
      },
    });

    if (existingAdmin) {
      if (existingAdmin.isActive) {
        return res.status(400).json({
          success: false,
          message: 'User is already an admin of this community',
        });
      }

      const reactivated = await prisma.communityAdmin.update({
        where: { id: existingAdmin.id },
        data: { isActive: true },
      });

      await createAuditLog(
        superAdminId,
        'REACTIVATE_ADMIN',
        `Reactivated "${user.name}" as admin of "${community.name}"`,
        communityId
      );

      return res.status(200).json({
        success: true,
        message: 'Admin reactivated successfully',
        data: reactivated,
      });
    }

    const adminAssignment = await prisma.communityAdmin.create({
      data: {
        communityId,
        userId,
        assignedById: superAdminId,
        isActive: true,
      },
    });

    if (user.role === 'STUDENT') {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'ADMIN' },
      });
    }

    await createAuditLog(
      superAdminId,
      'ASSIGN_ADMIN',
      `Assigned "${user.name}" as admin of "${community.name}"`,
      communityId
    );

    res.status(201).json({
      success: true,
      message: 'Admin assigned successfully',
      data: adminAssignment,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════
// Remove Admin from Community
// ═══════════════════════════════════════════════════

const removeAdmin = async (req, res, next) => {
  try {
    const { userId, communityId } = req.body;
    const superAdminId = req.user.id;

    const [user, community, adminRecord] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, role: true },
      }),
      prisma.community.findUnique({
        where: { id: communityId },
        select: { id: true, name: true, createdById: true },
      }),
      prisma.communityAdmin.findFirst({
        where: {
          communityId,
          userId,
          isActive: true,
        },
      }),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    if (!adminRecord) {
      return res.status(404).json({
        success: false,
        message: 'User is not an admin of this community',
      });
    }

    await prisma.communityAdmin.update({
      where: { id: adminRecord.id },
      data: { isActive: false },
    });

    const remainingAdminRoles = await prisma.communityAdmin.count({
      where: {
        userId,
        isActive: true,
      },
    });

    const isCreator = await prisma.community.count({
      where: {
        createdById: userId,
        isSuspended: false,
      },
    });

    if (remainingAdminRoles === 0 && isCreator === 0 && user.role === 'ADMIN') {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'STUDENT' },
      });
    }

    await createAuditLog(
      superAdminId,
      'REMOVE_ADMIN',
      `Removed "${user.name}" as admin of "${community.name}"`,
      communityId
    );

    res.status(200).json({
      success: true,
      message: 'Admin removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════
// Search Users (Super Admin)
// ═══════════════════════════════════════════════════

const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isSuspended: true,
      },
      take: 20,
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════
// Get Action Logs (Super Admin)
// ═══════════════════════════════════════════════════

const getActionLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action, adminId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (action) {
      where.action = action;
    }

    if (adminId) {
      where.adminId = adminId;
    }

    const [logs, total] = await Promise.all([
      prisma.adminActionLog.findMany({
        where,
        skip,
        take,
        include: {
          admin: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          community: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.adminActionLog.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: getPaginationMeta(total, parseInt(page), take),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCommunities,
  suspendCommunity,
  activateCommunity,
  deleteAnyCommunity,
  getAllReports,
  getReportedCommunities,
  resolveReport,
  dismissReport,
  getPlatformAnalytics,
  getAllAdmins,
  assignAdmin,
  removeAdmin,
  searchUsers,
  getActionLogs,
};