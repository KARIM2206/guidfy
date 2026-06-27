// controllers/community/admin.controller.js
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

const getCommunityBySlug = async (slug, adminId, role) => {
  if (role === 'SUPER_ADMIN') {
    return prisma.community.findUnique({
      where: { slug },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        admin: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, posts: true, questions: true } },
      },
    });
  }
  return prisma.community.findFirst({
    where: { slug, adminId },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      admin: { select: { id: true, name: true, email: true } },
      _count: { select: { members: true, posts: true, questions: true } },
    },
  });
};

// ═══════════════════════════════════════════════════
//  MY COMMUNITIES
// ═══════════════════════════════════════════════════

const getMyCommunities = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // ── Build search filter ──────────────────────────────────────────
    const searchFilter = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    // ── Build where clause ───────────────────────────────────────────
    const where =
      userRole === 'SUPER_ADMIN'
        ? searchFilter                           // Super Admin → ALL
        : { adminId: userId, ...searchFilter };  // Admin → only assigned

    // ── Query ────────────────────────────────────────────────────────
    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, avatar: true } },
          admin:     { select: { id: true, name: true, avatar: true } },
          _count:    { select: { members: true, posts: true, questions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.community.count({ where }), // ✅ where فقط بدون select
    ]);

    return res.json({
      success: true,
      communities: communities.map((c) => ({
        id:          c.id,
        name:        c.name,
        slug:        c.slug,
        description: c.description,
        icon:        c.icon,
        color:       c.color,
        status:      c.status,
        createdBy:   c.createdBy,
        admin:       c.admin,
        stats: {
          members:   c._count.members,
          posts:     c._count.posts,
          questions: c._count.questions,
        },
        createdAt: c.createdAt,
      })),
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

const getMyCommunity = async (req, res) => {
  try {
    const { slug } = req.params;
    const community = req.community || await getCommunityBySlug(slug, req.user.id, req.user.role);

    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    return res.json({
      success: true,
      community: {
        id: community.id,
        name: community.name,
        slug: community.slug,
        description: community.description,
        icon: community.icon,
        color: community.color,
        status: community.status,
        createdBy: community.createdBy,
        admin: community.admin,
        stats: {
          members: community._count.members,
          posts: community._count.posts,
          questions: community._count.questions,
        },
        createdAt: community.createdAt,
        updatedAt: community.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateMyCommunity = async (req, res) => {
  try {
    const { slug } = req.params;
    const adminId = req.user.id;
    const { name, description, icon, color } = req.body;

    const community = req.community || await getCommunityBySlug(slug, adminId, req.user.role);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    const updated = await prisma.community.update({
      where: { id: community.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(icon && { icon }),
        ...(color && { color }),
      },
    });

    await logAction(adminId, 'UPDATE_COMMUNITY', 'COMMUNITY', community.id, {
      slug,
      changes: { name, description, icon, color },
    });

    return res.json({
      success: true,
      message: 'Community updated successfully',
      community: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ═══════════════════════════════════════════════════
//  MEMBERS
// ═══════════════════════════════════════════════════

const getMyMembers = async (req, res) => {
  try {
    const { slug } = req.params;
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const community = req.community ||
      await getCommunityBySlug(slug, req.user.id, req.user.role);
    if (!community)
      return res.status(404).json({ success: false, message: 'Community not found' });

    const [members, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          communitiesJoined: { some: { id: community.id } },  // ✅ الاسم الصح
        },
        select: {
          id: true, name: true, email: true, avatar: true, createdAt: true,
          bannedMemberships: {                                 // ✅ الاسم الصح
            where: {
              communityId: community.id,
              unbannedAt:  null,
            },
            select: {
              reason:   true,
              bannedAt: true,
              bannedBy: { select: { id: true, name: true, avatar: true } },
            },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: {
          communitiesJoined: { some: { id: community.id } },  // ✅ الاسم الصح
        },
      }),
    ]);

    const formatted = members.map(m => {
      const ban = m.bannedMemberships?.[0] ?? null;
      return {
        id:        m.id,
        name:      m.name,
        email:     m.email,
        avatar:    m.avatar,
        createdAt: m.createdAt,
        isBanned:  !!ban,
        banReason: ban?.reason   ?? null,
        bannedAt:  ban?.bannedAt ?? null,
        bannedBy:  ban?.bannedBy ?? null,
      };
    });

    return res.json({
      success: true,
      data: formatted,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
// ─────────────────────────────────────────────────────────────────────────

const getMyAnalytics = async (req, res) => {
  try {
    const { slug } = req.params;

    const community = req.community ||
      await getCommunityBySlug(slug, req.user.id, req.user.role);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    // Weekly activity — last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const start = new Date();
      start.setDate(start.getDate() - (6 - i));
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        label: start.toLocaleDateString('en-US', { weekday: 'short' }),
      };
    });

    const weeklyActivity = await Promise.all(
      days.map(async ({ start, end, label }) => {
        const [questions, posts] = await Promise.all([
          prisma.communityQuestion.count({
            where: { communityId: community.id, createdAt: { gte: start, lte: end } },
          }),
          prisma.post.count({
            where: { communityId: community.id, createdAt: { gte: start, lte: end } },
          }),
        ]);
        return { day: label, questions, posts };
      })
    );

    // Stats
    const [communityWithCount, questionsCount, postsCount, reportsCount, bannedCount] =
      await Promise.all([
        prisma.community.findUnique({
          where: { id: community.id },
          include: { _count: { select: { members: true } } },
        }),
        prisma.communityQuestion.count({ where: { communityId: community.id } }),
        prisma.post.count({ where: { communityId: community.id } }),
        prisma.communityReport.count({
          where: { communityId: community.id, status: 'PENDING' },
        }),
        prisma.bannedMember.count({   // ✅ بعد ما عملنا الـ table
          where: { communityId: community.id, unbannedAt: null },
        }),
      ]);

    return res.json({
      success: true,
      weeklyActivity,
      stats: {
        members:        communityWithCount?._count.members ?? 0,
        posts:          postsCount,
        questions:      questionsCount,
        pendingReports: reportsCount,
        bannedMembers:  bannedCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false, message: 'Server error', error: error.message,
    });
  }
};

const banMember = async (req, res) => {
  try {
    const { slug, userId } = req.params;
    const adminId = req.user.id;
    const { reason } = req.body;

    const community = req.community ||
      await getCommunityBySlug(slug, adminId, req.user.role);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    const targetUserId = Number(userId);

    // تأكد إن اليوزر عضو في الـ community
    const isMember = await prisma.community.findFirst({
      where: {
        id: community.id,
        members: { some: { id: targetUserId } },
      },
    });
    if (!isMember) {
      return res.status(404).json({ success: false, message: 'User is not a member' });
    }

    // تأكد مش محظور بالفعل
    const existing = await prisma.bannedMember.findUnique({
      where: {
        communityId_userId: {
          communityId: community.id,
          userId: targetUserId,
        },
      },
    });

    if (existing && !existing.unbannedAt) {
      return res.status(400).json({ success: false, message: 'User is already banned' });
    }

    // لو كان محظور قبل كده وانفك الحظر → حدّث السجل القديم
    if (existing && existing.unbannedAt) {
      await prisma.bannedMember.update({
        where: { id: existing.id },
        data: {
          reason:     reason || null,
          bannedAt:   new Date(),
          unbannedAt: null,
          bannedById: adminId,
        },
      });
    } else {
      // أنشئ سجل جديد
      await prisma.bannedMember.create({
        data: {
          communityId: community.id,
          userId:      targetUserId,
          reason:      reason || null,
          bannedById:  adminId,
        },
      });
    }

    // شيل من الـ members
    await prisma.community.update({
      where: { id: community.id },
      data:  { members: { disconnect: { id: targetUserId } } },
    });

    await logAction(adminId, 'BAN_MEMBER', 'USER', String(userId), {
      communityId: community.id,
      reason: reason || null,
    });

    // جيب بيانات اليوزر للـ response
    const bannedUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true, avatar: true },
    });

    return res.json({
      success: true,
      message: 'Member banned successfully',
      data: {
        user:      bannedUser,
        reason:    reason || null,
        bannedAt:  new Date(),
        communityId: community.id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false, message: 'Server error', error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

const unbanMember = async (req, res) => {
  try {
    const { slug, userId } = req.params;
    const adminId = req.user.id;

    const community = req.community ||
      await getCommunityBySlug(slug, adminId, req.user.role);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    const targetUserId = Number(userId);

    // جيب سجل الحظر
    const bannedRecord = await prisma.bannedMember.findUnique({
      where: {
        communityId_userId: {
          communityId: community.id,
          userId: targetUserId,
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    if (!bannedRecord || bannedRecord.unbannedAt) {
      return res.status(404).json({ success: false, message: 'User is not banned' });
    }

    // فك الحظر
    await prisma.bannedMember.update({
      where: { id: bannedRecord.id },
      data:  { unbannedAt: new Date() },
    });

    // رجّع للـ members
    await prisma.community.update({
      where: { id: community.id },
      data:  { members: { connect: { id: targetUserId } } },
    });

    await logAction(adminId, 'UNBAN_MEMBER', 'USER', String(userId), {
      communityId: community.id,
    });

    return res.json({
      success: true,
      message: 'Member unbanned successfully',
      data: {
        user:        bannedRecord.user,
        unbannedAt:  new Date(),
        communityId: community.id,
        // بيانات الحظر الأصلي للـ audit
        originalBan: {
          reason:   bannedRecord.reason,
          bannedAt: bannedRecord.bannedAt,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false, message: 'Server error', error: error.message,
    });
  }
};

const removeMember = async (req, res) => {
  try {
    const { slug, userId } = req.params;
    const adminId = req.user.id;

    const community = req.community || await getCommunityBySlug(slug, adminId, req.user.role);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    await prisma.community.update({
      where: { id: community.id },
      data: { members: { disconnect: { id: Number(userId) } } },
    });

    await logAction(adminId, 'REMOVE_MEMBER', 'USER', userId, { communityId: community.id });

    return res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
const getAdminBannedMembers = async (req, res) => {
  try {
    const { slug } = req.params;
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const community = req.community ||
      await getCommunityBySlug(slug, req.user.id, req.user.role);
    if (!community)
      return res.status(404).json({ success: false, message: 'Community not found' });

    const [banned, total] = await Promise.all([
      prisma.bannedMember.findMany({
        where: {
          communityId: community.id,
          unbannedAt:  null,           // active bans فقط
        },
        include: {
          user:     { select: { id: true, name: true, email: true, avatar: true } },
          bannedBy: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { bannedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.bannedMember.count({
        where: { communityId: community.id, unbannedAt: null },
      }),
    ]);

    const formatted = banned.map(b => ({
      id:       b.user.id,
      name:     b.user.name,
      email:    b.user.email,
      avatar:   b.user.avatar,
      bannedAt: b.bannedAt,
      reason:   b.reason,
      bannedBy: b.bannedBy,
    }));

    return res.json({
      success: true,
      data: formatted,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ═══════════════════════════════════════════════════
//  POSTS
// ═══════════════════════════════════════════════════

const getMyPosts = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const community = req.community || await getCommunityBySlug(slug, req.user.id, req.user.role);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { communityId: community.id },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({ where: { communityId: community.id } }),
    ]);

    return res.json({
      success: true,
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteMyPost = async (req, res) => {
  try {
    const { slug, postId } = req.params;
    const adminId = req.user.id;
    const { reason } = req.body;

    const community = req.community || await getCommunityBySlug(slug, adminId, req.user.role);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    const post = await prisma.post.findFirst({
      where: { id: Number(postId), communityId: community.id },
    });

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    await prisma.post.delete({ where: { id: Number(postId) } });

    await logAction(adminId, 'DELETE_POST', 'POST', postId, { communityId: community.id, reason });

    return res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ═══════════════════════════════════════════════════
//  QUESTIONS
// ═══════════════════════════════════════════════════

const getMyQuestions = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const community = req.community || await getCommunityBySlug(slug, req.user.id, req.user.role);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

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
      success: true,
      questions: questions.map((q) => ({
        ...q,
        answersCount: q._count.answers,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteMyQuestion = async (req, res) => {
  try {
    const { slug, questionId } = req.params;
    const adminId = req.user.id;
    const { reason } = req.body;

    const community = req.community || await getCommunityBySlug(slug, adminId, req.user.role);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    const question = await prisma.communityQuestion.findFirst({
      where: { id: Number(questionId), communityId: community.id },
    });

    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    await prisma.communityQuestion.delete({ where: { id: Number(questionId) } });

    await logAction(adminId, 'DELETE_QUESTION', 'QUESTION', questionId, {
      communityId: community.id,
      reason,
    });

    return res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ═══════════════════════════════════════════════════
//  REPORTS
// ═══════════════════════════════════════════════════

const getMyReports = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status || undefined;
    const skip = (page - 1) * limit;

    const community = req.community || await getCommunityBySlug(slug, req.user.id, req.user.role);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    const where = {
      communityId: community.id,
      ...(status && { status }),
    };

    const [reports, total] = await Promise.all([
      prisma.communityReport.findMany({
        where,
        include: {
          reporter: { select: { id: true, name: true, avatar: true } },
          resolvedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.communityReport.count({ where }),
    ]);

    return res.json({
      success: true,
      reports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const resolveMyReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const adminId = req.user.id;
    const { notes } = req.body;

    const report = await prisma.communityReport.findUnique({
      where: { id: Number(reportId) },
    });

    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    const updated = await prisma.communityReport.update({
      where: { id: Number(reportId) },
      data: {
        status: 'RESOLVED',
        resolvedById: adminId,
        resolvedAt: new Date(),
        notes,
      },
    });

    await logAction(adminId, 'RESOLVE_REPORT', 'REPORT', reportId, { notes });

    return res.json({ success: true, message: 'Report resolved', report: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const dismissMyReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const adminId = req.user.id;

    const report = await prisma.communityReport.findUnique({
      where: { id: Number(reportId) },
    });

    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    const updated = await prisma.communityReport.update({
      where: { id: Number(reportId) },
      data: {
        status: 'DISMISSED',
        resolvedById: adminId,
        resolvedAt: new Date(),
      },
    });

    await logAction(adminId, 'DISMISS_REPORT', 'REPORT', reportId, {});

    return res.json({ success: true, message: 'Report dismissed', report: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ═══════════════════════════════════════════════════
//  ANALYTICS & LOGS
// ═══════════════════════════════════════════════════


const getMyLogs = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const community = req.community || await getCommunityBySlug(slug, req.user.id, req.user.role);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

  const [logs, total] = await Promise.all([
  prisma.adminActionLog.findMany({
    where: {
      OR: [
        { targetId: String(community.id), targetType: 'COMMUNITY' },
        { metadata: { path: '$.communityId', equals: community.id } },  // ✅
      ],
    },
    include: {
      admin: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  }),
  prisma.adminActionLog.count({
    where: {
      OR: [
        { targetId: String(community.id), targetType: 'COMMUNITY' },
        { metadata: { path: '$.communityId', equals: community.id } },  // ✅
      ],
    },
  }),
]);
    return res.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ═══════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════

module.exports = {
  getMyCommunities,
  getMyCommunity,
  updateMyCommunity,
  getMyMembers,
  banMember,
  unbanMember,
  removeMember,
  getAdminBannedMembers,
  getMyPosts,
  deleteMyPost,
  getMyQuestions,
  deleteMyQuestion,
  getMyReports,
  resolveMyReport,
  dismissMyReport,
  getMyAnalytics,
  getMyLogs,
};