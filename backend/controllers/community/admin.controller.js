// controllers/admin.controller.js
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

const verifyCommunityOwnership = async (slug, userId) => {
    const community = await prisma.community.findUnique({ where: { slug } });
    if (!community) return { error: 'Community not found', status: 404 };
    if (community.createdById !== userId && userId !== null) {
        return { error: 'You can only manage communities you created', status: 403 };
    }
    return { community };
};

// ═══════════════════════════════════════════════════
//  COMMUNITY MANAGEMENT
// ═══════════════════════════════════════════════════

const getAdminCommunity = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

        const community = await prisma.community.findUnique({
            where: { slug },
            include: {
                createdBy: { select: { id: true, name: true, avatar: true, email: true } },
                _count: { select: { members: true, questions: true, posts: true } },
            },
        });

        if (!community) return res.status(404).json({ message: 'Community not found' });

        if (!isSuperAdmin && community.createdById !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

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

const updateAdminCommunity = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

        const community = await prisma.community.findUnique({ where: { slug } });
        if (!community) return res.status(404).json({ message: 'Community not found' });

        if (!isSuperAdmin && community.createdById !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { name, description, icon, color } = req.body;

        const updated = await prisma.community.update({
            where: { slug },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(icon !== undefined && { icon }),
                ...(color !== undefined && { color }),
            },
        });

        await logAction(userId, 'UPDATE_COMMUNITY', 'COMMUNITY', community.id, {
            slug,
            changes: req.body,
        });

        return res.json({ message: 'Community updated', community: updated });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ═══════════════════════════════════════════════════
//  MEMBER MANAGEMENT
// ═══════════════════════════════════════════════════

const getAdminMembers = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        const community = await prisma.community.findUnique({ where: { slug } });
        if (!community) return res.status(404).json({ message: 'Community not found' });

        if (!isSuperAdmin && community.createdById !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const memberWhere = search
            ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
            : {};

        const fullCommunity = await prisma.community.findUnique({
            where: { slug },
            include: {
                members: {
                    where: memberWhere,
                    select: { id: true, name: true, email: true, avatar: true, role: true, createdAt: true },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                },
                _count: { select: { members: true } },
            },
        });

        return res.json({
            data: fullCommunity.members,
            pagination: {
                page,
                limit,
                total: fullCommunity._count.members,
                pages: Math.ceil(fullCommunity._count.members / limit),
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const banMember = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = Number(req.params.userId);
        const adminId = req.user.id;
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
        const { reason } = req.body;

        const community = await prisma.community.findUnique({ where: { slug } });
        if (!community) return res.status(404).json({ message: 'Community not found' });

        if (!isSuperAdmin && community.createdById !== adminId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await prisma.community.update({
            where: { slug },
            data: { members: { disconnect: { id: userId } } },
        });

        await logAction(adminId, 'BAN_MEMBER', 'USER', userId, {
            communitySlug: slug,
            reason,
        });

        return res.json({ message: 'Member banned' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const unbanMember = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = Number(req.params.userId);
        const adminId = req.user.id;
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

        const community = await prisma.community.findUnique({ where: { slug } });
        if (!community) return res.status(404).json({ message: 'Community not found' });

        if (!isSuperAdmin && community.createdById !== adminId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await prisma.community.update({
            where: { slug },
            data: { members: { connect: { id: userId } } },
        });

        await logAction(adminId, 'UNBAN_MEMBER', 'USER', userId, { communitySlug: slug });

        return res.json({ message: 'Member unbanned' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const removeMemberByAdmin = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = Number(req.params.userId);
        const adminId = req.user.id;
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

        const community = await prisma.community.findUnique({ where: { slug } });
        if (!community) return res.status(404).json({ message: 'Community not found' });

        if (!isSuperAdmin && community.createdById !== adminId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await prisma.community.update({
            where: { slug },
            data: { members: { disconnect: { id: userId } } },
        });

        await logAction(adminId, 'REMOVE_MEMBER', 'USER', userId, { communitySlug: slug });

        return res.json({ message: 'Member removed' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ═══════════════════════════════════════════════════
//  POST MANAGEMENT
// ═══════════════════════════════════════════════════

const getAdminPosts = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const community = await prisma.community.findUnique({ where: { slug } });
        if (!community) return res.status(404).json({ message: 'Community not found' });

        if (!isSuperAdmin && community.createdById !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where: { communityId: community.id },
                include: { author: { select: { id: true, name: true, avatar: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.post.count({ where: { communityId: community.id } }),
        ]);

        return res.json({
            data: posts,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deletePostByAdmin = async (req, res) => {
    try {
        const { slug } = req.params;
        const postId = Number(req.params.postId);
        const adminId = req.user.id;
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
        const { reason } = req.body;

        const community = await prisma.community.findUnique({ where: { slug } });
        if (!community) return res.status(404).json({ message: 'Community not found' });

        if (!isSuperAdmin && community.createdById !== adminId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post || post.communityId !== community.id) {
            return res.status(404).json({ message: 'Post not found' });
        }

        await prisma.post.delete({ where: { id: postId } });

        await logAction(adminId, 'DELETE_POST', 'POST', postId, {
            communitySlug: slug,
            reason,
        });

        return res.json({ message: 'Post deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ═══════════════════════════════════════════════════
//  QUESTION MANAGEMENT
// ═══════════════════════════════════════════════════

const getAdminQuestions = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const community = await prisma.community.findUnique({ where: { slug } });
        if (!community) return res.status(404).json({ message: 'Community not found' });

        if (!isSuperAdmin && community.createdById !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [questions, total] = await Promise.all([
            prisma.communityQuestion.findMany({
                where: { communityId: community.id },
                include: {
                    author: { select: { id: true, name: true, avatar: true } },
                    _count: { select: { answers: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.communityQuestion.count({ where: { communityId: community.id } }),
        ]);

        return res.json({
            data: questions.map((q) => ({ ...q, answersCount: q._count.answers, _count: undefined })),
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteQuestionByAdmin = async (req, res) => {
    try {
        const { slug } = req.params;
        const questionId = Number(req.params.questionId);
        const adminId = req.user.id;
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
        const { reason } = req.body;

        const community = await prisma.community.findUnique({ where: { slug } });
        if (!community) return res.status(404).json({ message: 'Community not found' });

        if (!isSuperAdmin && community.createdById !== adminId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const question = await prisma.communityQuestion.findUnique({ where: { id: questionId } });
        if (!question || question.communityId !== community.id) {
            return res.status(404).json({ message: 'Question not found' });
        }

        await prisma.communityQuestion.delete({ where: { id: questionId } });

        await logAction(adminId, 'DELETE_QUESTION', 'QUESTION', questionId, {
            communitySlug: slug,
            reason,
        });

        return res.json({ message: 'Question deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ═══════════════════════════════════════════════════
//  REPORT MANAGEMENT
// ═══════════════════════════════════════════════════

const getAdminReports = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const status = req.query.status || undefined;
        const skip = (page - 1) * limit;

        const community = await prisma.community.findUnique({ where: { slug } });
        if (!community) return res.status(404).json({ message: 'Community not found' });

        if (!isSuperAdmin && community.createdById !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const where = {
            communityId: community.id,
            ...(status && { status }),
        };

        const [reports, total] = await Promise.all([
            prisma.communityReport.findMany({
                where,
                include: { reporter: { select: { id: true, name: true, avatar: true } } },
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

const resolveReportByAdmin = async (req, res) => {
    try {
        const reportId = Number(req.params.reportId);
        const adminId = req.user.id;
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
        const { notes } = req.body;

        const report = await prisma.communityReport.findUnique({
            where: { id: reportId },
            include: { community: true },
        });
        if (!report) return res.status(404).json({ message: 'Report not found' });

        if (!isSuperAdmin && report.community.createdById !== adminId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updated = await prisma.communityReport.update({
            where: { id: reportId },
            data: { status: 'RESOLVED', resolvedById: adminId, resolvedAt: new Date(), notes },
        });

        await logAction(adminId, 'RESOLVE_REPORT', 'REPORT', reportId, { notes });

        return res.json({ message: 'Report resolved', report: updated });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const dismissReportByAdmin = async (req, res) => {
    try {
        const reportId = Number(req.params.reportId);
        const adminId = req.user.id;
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

        const report = await prisma.communityReport.findUnique({
            where: { id: reportId },
            include: { community: true },
        });
        if (!report) return res.status(404).json({ message: 'Report not found' });

        if (!isSuperAdmin && report.community.createdById !== adminId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updated = await prisma.communityReport.update({
            where: { id: reportId },
            data: { status: 'DISMISSED', resolvedById: adminId, resolvedAt: new Date() },
        });

        await logAction(adminId, 'DISMISS_REPORT', 'REPORT', reportId, {});

        return res.json({ message: 'Report dismissed', report: updated });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ═══════════════════════════════════════════════════
//  ANALYTICS
// ═══════════════════════════════════════════════════

const getAdminAnalytics = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

        const community = await prisma.community.findUnique({ where: { slug } });
        if (!community) return res.status(404).json({ message: 'Community not found' });

        if (!isSuperAdmin && community.createdById !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const communityId = community.id;

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
                const count = await prisma.user.count({
                    where: {
                        communitiesJoined: { some: { id: communityId } },
                        createdAt: { gte: start, lte: end },
                    },
                });
                return { month: label, growth: count };
            })
        );

        const [totalQuestions, totalPosts, totalComments, totalMembers] = await Promise.all([
            prisma.communityQuestion.count({ where: { communityId } }),
            prisma.post.count({ where: { communityId } }),
            prisma.postComment.count({ where: { post: { communityId } } }),
            prisma.community.findUnique({
                where: { id: communityId },
                include: { _count: { select: { members: true } } },
            }),
        ]);

        const totalEngagement = totalQuestions + totalPosts + totalComments || 1;

        return res.json({
            weeklyActivity,
            monthlyGrowth,
            overview: {
                totalMembers: totalMembers?._count.members ?? 0,
                totalQuestions,
                totalPosts,
                totalComments,
            },
            engagement: [
                { name: 'Questions', value: Math.round((totalQuestions / totalEngagement) * 100), color: '#3b82f6', count: totalQuestions },
                { name: 'Posts', value: Math.round((totalPosts / totalEngagement) * 100), color: '#8b5cf6', count: totalPosts },
                { name: 'Comments', value: Math.round((totalComments / totalEngagement) * 100), color: '#10b981', count: totalComments },
            ],
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ═══════════════════════════════════════════════════
//  ACTION LOGS
// ═══════════════════════════════════════════════════

const getAdminActionLogs = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const community = await prisma.community.findUnique({ where: { slug } });
        if (!community) return res.status(404).json({ message: 'Community not found' });

        if (!isSuperAdmin && community.createdById !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [logs, total] = await Promise.all([
            prisma.adminActionLog.findMany({
                where: { targetId: String(community.id), targetType: 'COMMUNITY' },
                include: { admin: { select: { id: true, name: true, avatar: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.adminActionLog.count({
                where: { targetId: String(community.id), targetType: 'COMMUNITY' },
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
//  EXPORTS
// ═══════════════════════════════════════════════════

module.exports = {
    getAdminCommunity,
    updateAdminCommunity,
    getAdminMembers,
    banMember,
    unbanMember,
    removeMemberByAdmin,
    getAdminPosts,
    deletePostByAdmin,
    getAdminQuestions,
    deleteQuestionByAdmin,
    getAdminReports,
    resolveReportByAdmin,
    dismissReportByAdmin,
    getAdminAnalytics,
    getAdminActionLogs,
};