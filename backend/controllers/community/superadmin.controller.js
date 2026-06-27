// controllers/superAdmin.controller.js
const prisma = require('../../prismaClient');

// ═══════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════

const logAction = async (adminId, action, targetType, targetId, metadata = {}) => {
    return prisma.adminActionLog.create({
        data: {
            adminId,
            action,
            targetType,
            targetId: String(targetId),
            metadata,
        },
    });
};

// ═══════════════════════════════════════════════════
//  COMMUNITY MANAGEMENT
// ═══════════════════════════════════════════════════

const getAllCommunities = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status || undefined;
        const skip = (page - 1) * limit;
        console.log(req.query, 'req.query');

        const where = {
            ...(search && {
                OR: [
                    { name: { contains: search } },
                    { description: { contains: search } },
                ],
            }),
            ...(status && { status }),
        };

        const [communities, total] = await Promise.all([
            prisma.community.findMany({
                where,
                include: {
                    createdBy: { select: { id: true, name: true, avatar: true, email: true } },
                    _count: { select: { members: true, questions: true, posts: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.community.count({ where }),
        ]);

        return res.json({
            data: communities.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                description: c.description,
                icon: c.icon,
                color: c.color,
                status: c.status,
                createdBy: c.createdBy,
                stats: {
                    members: c._count.members,
                    questions: c._count.questions,
                    posts: c._count.posts,
                },
                createdAt: c.createdAt,
            })),
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getCommunityDetails = async (req, res) => {
    try {
        const communityId = Number(req.params.communityId);

        const community = await prisma.community.findUnique({
            where: { id: communityId },
            include: {
                createdBy: { select: { id: true, name: true, avatar: true, email: true } },
                _count: { select: { members: true, questions: true, posts: true } },
            },
        });

        if (!community) return res.status(404).json({ message: 'Community not found' });

        return res.json({
            ...community,
            stats: {
                members: community._count.members,
                questions: community._count.questions,
                posts: community._count.posts,
            },
            _count: undefined,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const suspendCommunity = async (req, res) => {
    try {
        const communityId = Number(req.params.communityId);
        const adminId = req.user.id;
        const { reason } = req.body;

        const community = await prisma.community.findUnique({ where: { id: communityId } });
        if (!community) return res.status(404).json({ message: 'Community not found' });

        const updated = await prisma.community.update({
            where: { id: communityId },
            data: { status: 'SUSPENDED' },
        });

        await logAction(adminId, 'SUSPEND_COMMUNITY', 'COMMUNITY', communityId, {
            reason,
            communityName: community.name,
        });

        return res.json({ message: 'Community suspended', community: updated });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const activateCommunity = async (req, res) => {
    try {
        const communityId = Number(req.params.communityId);
        const adminId = req.user.id;

        const community = await prisma.community.findUnique({ where: { id: communityId } });
        if (!community) return res.status(404).json({ message: 'Community not found' });

        const updated = await prisma.community.update({
            where: { id: communityId },
            data: { status: 'ACTIVE' },
        });

        await logAction(adminId, 'ACTIVATE_COMMUNITY', 'COMMUNITY', communityId, {
            communityName: community.name,
        });

        return res.json({ message: 'Community activated', community: updated });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteCommunitySA = async (req, res) => {
    try {
        const communityId = Number(req.params.communityId);
        const adminId = req.user.id;

        const community = await prisma.community.findUnique({ where: { id: communityId } });
        if (!community) return res.status(404).json({ message: 'Community not found' });

        await prisma.community.delete({ where: { id: communityId } });

        await logAction(adminId, 'DELETE_COMMUNITY', 'COMMUNITY', communityId, {
            communityName: community.name,
        });

        return res.json({ message: 'Community deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ═══════════════════════════════════════════════════
//  ADMIN ASSIGNMENT
// ═══════════════════════════════════════════════════





// controllers/community/superAdmin.controller.js
const getCommunityAdmins = async (req, res) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const communityId = req.query.communityId ? Number(req.query.communityId) : null;
    const skip = (page - 1) * limit;

    const where = communityId
      ? { adminId: communityId }          // أدمنز community معينة
      : { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }; // كل الأدمنز

    // لو communityId موجود، جيب الـ user اللي هو admin للـ community دي
    if (communityId) {
      const community = await prisma.community.findUnique({
        where: { id: communityId },
        include: {
          admin: {
            select: {
              id: true, name: true, email: true,
              avatar: true, role: true, createdAt: true,
            },
          },
        },
      });

      if (!community) {
        return res.status(404).json({ success: false, message: 'Community not found' });
      }

      const admins = community.admin ? [community.admin] : [];

      return res.json({
        success: true,
        data: admins,
        pagination: { page: 1, limit: 10, total: admins.length, pages: 1 },
      });
    }

    // بدون communityId — كل الأدمنز
    const [admins, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        select: {
          id: true, name: true, email: true,
          avatar: true, role: true, createdAt: true,
          managedCommunities: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      }),
    ]);

    return res.json({
      success: true,
      data: admins,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════
//  MEMBERS MANAGEMENT
// ═══════════════════════════════════════════════════

const getCommunityMembers = async (req, res) => {
    try {
        const communityId = Number(req.params.communityId);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const community = await prisma.community.findUnique({
            where: { id: communityId },
            include: {
                members: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        role: true,
                        createdAt: true,
                    },
                    skip,
                    take: limit,
                },
                _count: { select: { members: true } },
            },
        });

        if (!community) return res.status(404).json({ message: 'Community not found' });

        return res.json({
            data: community.members,
            pagination: {
                page,
                limit,
                total: community._count.members,
                pages: Math.ceil(community._count.members / limit),
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const banMember = async (req, res) => {
    try {
        const communityId = Number(req.params.communityId);
        const userId = Number(req.params.userId);
        const adminId = req.user.id;
        const { reason } = req.body;

        await prisma.community.update({
            where: { id: communityId },
            data: { members: { disconnect: { id: userId } } },
        });

        await logAction(adminId, 'BAN_MEMBER', 'USER', userId, {
            communityId,
            reason,
        });

        return res.json({ message: 'Member banned' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const unbanMember = async (req, res) => {
    try {
        const communityId = Number(req.params.communityId);
        const userId = Number(req.params.userId);
        const adminId = req.user.id;

        await prisma.community.update({
            where: { id: communityId },
            data: { members: { connect: { id: userId } } },
        });

        await logAction(adminId, 'UNBAN_MEMBER', 'USER', userId, { communityId });

        return res.json({ message: 'Member unbanned' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ═══════════════════════════════════════════════════
//  CONTENT MODERATION
// ═══════════════════════════════════════════════════

const getCommunityPosts = async (req, res) => {
    try {
        const communityId = Number(req.params.communityId);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where: { communityId },
                include: { author: { select: { id: true, name: true, avatar: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.post.count({ where: { communityId } }),
        ]);

        return res.json({
            data: posts,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deletePost = async (req, res) => {
    try {
        const postId = Number(req.params.postId);
        const adminId = req.user.id;
        const { reason } = req.body;

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return res.status(404).json({ message: 'Post not found' });

        await prisma.post.delete({ where: { id: postId } });

        await logAction(adminId, 'DELETE_POST', 'POST', postId, { reason });

        return res.json({ message: 'Post deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getCommunityQuestions = async (req, res) => {
    try {
        const communityId = Number(req.params.communityId);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [questions, total] = await Promise.all([
            prisma.communityQuestion.findMany({
                where: { communityId },
                include: { author: { select: { id: true, name: true, avatar: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.communityQuestion.count({ where: { communityId } }),
        ]);

        return res.json({
            data: questions,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const questionId = Number(req.params.questionId);
        const adminId = req.user.id;
        const { reason } = req.body;

        const question = await prisma.communityQuestion.findUnique({ where: { id: questionId } });
        if (!question) return res.status(404).json({ message: 'Question not found' });

        await prisma.communityQuestion.delete({ where: { id: questionId } });

        await logAction(adminId, 'DELETE_QUESTION', 'QUESTION', questionId, { reason });

        return res.json({ message: 'Question deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ═══════════════════════════════════════════════════
//  REPORTS
// ═══════════════════════════════════════════════════

const getAllReports = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const status = req.query.status || undefined;
        const skip = (page - 1) * limit;

        const where = { ...(status && { status }) };

        const [reports, total] = await Promise.all([
            prisma.communityReport.findMany({
                where,
                include: {
                    reporter: { select: { id: true, name: true, avatar: true } },
                    community: { select: { id: true, name: true, slug: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.communityReport.count({ where }),
        ]);

        return res.json({
            data: reports,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getCommunityReports = async (req, res) => {
    try {
        const communityId = Number(req.params.communityId);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [reports, total] = await Promise.all([
            prisma.communityReport.findMany({
                where: { communityId },
                include: {
                    reporter: { select: { id: true, name: true, avatar: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.communityReport.count({ where: { communityId } }),
        ]);

        return res.json({
            data: reports,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const resolveReport = async (req, res) => {
    try {
        const reportId = Number(req.params.reportId);
        const adminId = req.user.id;
        const { action, notes } = req.body;

        const report = await prisma.communityReport.findUnique({ where: { id: reportId } });
        if (!report) return res.status(404).json({ message: 'Report not found' });

        const updated = await prisma.communityReport.update({
            where: { id: reportId },
            data: { status: 'RESOLVED', resolvedById: adminId, resolvedAt: new Date(), notes },
        });

        await logAction(adminId, 'RESOLVE_REPORT', 'REPORT', reportId, { action, notes });

        return res.json({ message: 'Report resolved', report: updated });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ═══════════════════════════════════════════════════
//  ANALYTICS
// ═══════════════════════════════════════════════════

const getPlatformAnalytics = async (req, res) => {
    try {
        const [
            totalUsers,
            totalCommunities,
            totalPosts,
            totalQuestions,
            activeCommunities,
            suspendedCommunities,
            pendingReports,
            recentUsers,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.community.count(),
            prisma.post.count(),
            prisma.communityQuestion.count(),
            prisma.community.count({ where: { status: 'ACTIVE' } }),
            prisma.community.count({ where: { status: 'SUSPENDED' } }),
            prisma.communityReport.count({ where: { status: 'PENDING' } }),
            prisma.user.count({
                where: {
                    createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                },
            }),
        ]);

        // ── Monthly growth (last 6 months) ──────────────────
        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setDate(1);
            d.setMonth(d.getMonth() - (5 - i));
            d.setHours(0, 0, 0, 0);
            const end = new Date(d);
            end.setMonth(end.getMonth() + 1);
            end.setDate(0);
            end.setHours(23, 59, 59, 999);
            return { start: d, end, label: d.toLocaleDateString('en-US', { month: 'short' }) };
        });

        const monthlyGrowth = await Promise.all(
            months.map(async ({ start, end, label }) => {
                const [users, communities, posts] = await Promise.all([
                    prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
                    prisma.community.count({ where: { createdAt: { gte: start, lte: end } } }),
                    prisma.post.count({ where: { createdAt: { gte: start, lte: end } } }),
                ]);
                return { month: label, users, communities, posts };
            })
        );

        // ── Top communities ──────────────────────────────────
        const topCommunities = await prisma.community.findMany({
            take: 5,
            include: { _count: { select: { members: true, posts: true, questions: true } } },
            orderBy: { members: { _count: 'desc' } },
        });

        return res.json({
            overview: {
                totalUsers,
                totalCommunities,
                totalPosts,
                totalQuestions,
                activeCommunities,
                suspendedCommunities,
                pendingReports,
                recentUsers,
            },
            monthlyGrowth,
            topCommunities: topCommunities.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                icon: c.icon,
                color: c.color,
                stats: {
                    members: c._count.members,
                    posts: c._count.posts,
                    questions: c._count.questions,
                },
            })),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getCommunityAnalytics = async (req, res) => {
    try {
        const communityId = Number(req.params.communityId);

        const community = await prisma.community.findUnique({ where: { id: communityId } });
        if (!community) return res.status(404).json({ message: 'Community not found' });

        const days = Array.from({ length: 7 }, (_, i) => {
            const start = new Date();
            start.setDate(start.getDate() - (6 - i));
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setHours(23, 59, 59, 999);
            return { start, end, label: start.toLocaleDateString('en-US', { weekday: 'short' }) };
        });

        const weeklyActivity = await Promise.all(
            days.map(async ({ start, end, label }) => {
                const [questions, posts] = await Promise.all([
                    prisma.communityQuestion.count({ where: { communityId, createdAt: { gte: start, lte: end } } }),
                    prisma.post.count({ where: { communityId, createdAt: { gte: start, lte: end } } }),
                ]);
                return { day: label, questions, posts };
            })
        );

        const [totalMembers, totalQuestions, totalPosts] = await Promise.all([
            prisma.community.findUnique({ where: { id: communityId }, include: { _count: { select: { members: true } } } }),
            prisma.communityQuestion.count({ where: { communityId } }),
            prisma.post.count({ where: { communityId } }),
        ]);

        return res.json({
            weeklyActivity,
            overview: {
                totalMembers: totalMembers?._count.members ?? 0,
                totalQuestions,
                totalPosts,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getCommunitiesAnalytics = async (req, res) => {
    try {
        const communities = await prisma.community.findMany({
            include: {
                _count: { select: { members: true, questions: true, posts: true } },
            },
            orderBy: { members: { _count: 'desc' } },
            take: 10,
        });

        return res.json({
            data: communities.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                color: c.color,
                stats: {
                    members: c._count.members,
                    questions: c._count.questions,
                    posts: c._count.posts,
                },
            })),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ═══════════════════════════════════════════════════
//  ACTION LOGS
// ═══════════════════════════════════════════════════

const getCommunityLogs = async (req, res) => {
    try {
        const communityId = String(req.params.communityId);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            prisma.adminActionLog.findMany({
                where: { targetId: communityId, targetType: 'COMMUNITY' },
                include: { admin: { select: { id: true, name: true, avatar: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.adminActionLog.count({
                where: { targetId: communityId, targetType: 'COMMUNITY' },
            }),
        ]);

        return res.json({
            data: logs,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ═══════════════════════════════════════════════════
//  ADMIN ASSIGNMENT (معدل)
// ═══════════════════════════════════════════════════

const assignAdminToCommunity = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const { userId } = req.body;

    // تأكد إن الـ user موجود
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // عيّن الأدمن للـ community + غيّر role اليوزر لـ ADMIN
    const [community] = await prisma.$transaction([
      prisma.community.update({
        where: { id: communityId },
        data: { adminId: Number(userId) },
        include: {
          admin: { select: { id: true, name: true, email: true, avatar: true } },
        },
      }),
      prisma.user.update({
        where: { id: Number(userId) },
        data: { role: 'ADMIN' },
      }),
    ]);

    return res.json({
      success: true,
      message: 'Admin assigned successfully',
      community,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const removeAdminFromCommunity = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const { userId } = req.body;

    // تأكد إن الـ community عندها الأدمن ده
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    if (community.adminId !== Number(userId)) {
      return res.status(400).json({
        success: false,
        message: 'This user is not the admin of this community',
      });
    }

    // شيل الأدمن من الـ community + رجّع role لـ STUDENT
    await prisma.$transaction([
      prisma.community.update({
        where: { id: communityId },
        data: { adminId: null },
      }),
      prisma.user.update({
        where: { id: Number(userId) },
        data: { role: 'STUDENT' },
      }),
    ]);

    return res.json({
      success: true,
      message: 'Admin removed successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════
//  BAN/UNBAN (معدل — بيستخدم BannedMember table)
// ═══════════════════════════════════════════════════

const banMemberSA = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const userId = Number(req.params.userId);
    const adminId = req.user.id;
    const { reason } = req.body;

    // Check if already banned
    const existing = await prisma.bannedMember.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'User is already banned from this community' });
    }

    // Remove from members
    await prisma.community.update({
      where: { id: communityId },
      data: { members: { disconnect: { id: userId } } },
    });

    // Add to banned members
    await prisma.bannedMember.create({
      data: {
        communityId,
        userId,
        reason,
        bannedById: adminId,
      },
    });

    await logAction(adminId, 'BAN_MEMBER', 'USER', userId, {
      communityId,
      reason,
    });

    return res.json({ 
      success: true,
      message: 'Member banned successfully' 
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const unbanMemberSA = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const userId = Number(req.params.userId);
    const adminId = req.user.id;

    // Find banned record
    const bannedRecord = await prisma.bannedMember.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId,
        },
      },
    });

    if (!bannedRecord) {
      return res.status(404).json({ message: 'User is not banned from this community' });
    }

    // Mark as unbanned (soft delete alternative)
    await prisma.bannedMember.update({
      where: { id: bannedRecord.id },
      data: { unbannedAt: new Date() },
    });

    // Optionally re-add to members
    await prisma.community.update({
      where: { id: communityId },
      data: { members: { connect: { id: userId } } },
    });

    await logAction(adminId, 'UNBAN_MEMBER', 'USER', userId, { communityId });

    return res.json({ 
      success: true,
      message: 'Member unbanned successfully' 
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// ═══════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════

module.exports = {
    getAllCommunities,
    getCommunityDetails,
    suspendCommunity,
    activateCommunity,
    deleteCommunitySA,
    assignAdminToCommunity,
    removeAdminFromCommunity,
    getCommunityAdmins,
    getCommunityMembers,
    banMemberSA,
    unbanMemberSA,
    getCommunityPosts,
    deletePostSA: deletePost,
    getCommunityQuestions,
    deleteQuestionSA: deleteQuestion,
    getAllReports,
    getCommunityReports,
    resolveReport,
    getPlatformAnalytics,
    getCommunityAnalytics,
    getCommunitiesAnalytics,
    getCommunityLogs,
};