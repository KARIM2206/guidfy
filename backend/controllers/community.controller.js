// community.controller.js
const prisma = require('../prismaClient');
const errorHandler = require("../utils/errorHandler");

// ═══════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════
const emitNotification = async (io, { recipientId, actorId, type, message, metadata }) => {
  // ✅ متبعتش notification لنفسك
  if (recipientId === actorId) return;

  const notification = await prisma.notification.create({
    data: { userId: recipientId, type, message, metadata },
  });

  io.to(`user_${recipientId}`).emit("new_notification", {
    id:        notification.id,
    message:   notification.message,
    type:      notification.type,
    metadata:  notification.metadata,
    createdAt: notification.createdAt,
  });

  return notification;
};
function makeSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function isCommunityAdmin(userId, communityId) {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { createdById: true },
  });
  return community?.createdById === userId;
}

// ═══════════════════════════════════════════════════
//  COMMUNITY CRUD
// ═══════════════════════════════════════════════════

const createCommunity = async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    const adminId = req.user.id;

    if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admins only" });
    }

    if (!name) return res.status(400).json({ message: "name is required" });

    const slug = makeSlug(name);

    const community = await prisma.community.create({
      data: { name, slug, description, icon, color, createdById: adminId },
    });

    return res.status(201).json({ message: "Community created", community });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Community name or slug already exists" });
    }
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateCommunity = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const userId = req.user.id;

    if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role))
      return res.status(403).json({ message: "Admins only" });

    const community = await prisma.community.findUnique({ where: { id: communityId } });

    if (!community) return res.status(404).json({ message: "Community not found" });

    if (req.user.role === "ADMIN" && community.createdById !== userId) {
      return res
        .status(403)
        .json({ message: "You can only edit communities you created" });
    }

    const { name, description, icon, color } = req.body;
    const slug = name ? makeSlug(name) : undefined;

    const updated = await prisma.community.update({
      where: { id: communityId },
      data: {
        ...(name && { name, slug }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
      },
    });

    return res.json({ message: "Community updated", community: updated });
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ message: "Name already taken" });
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteCommunity = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const userId = req.user.id;

    if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role))
      return res.status(403).json({ message: "Admins only" });

    const community = await prisma.community.findUnique({ where: { id: communityId } });

    if (!community) return res.status(404).json({ message: "Community not found" });

    if (req.user.role === "ADMIN" && community.createdById !== userId)
      return res
        .status(403)
        .json({ message: "You can only delete communities you created" });

    await prisma.community.delete({ where: { id: communityId } });
    return res.json({ message: "Community deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ═══════════════════════════════════════════════════
//  GET COMMUNITIES
// ═══════════════════════════════════════════════════

const getAllCommunities = async (req, res) => {
  try {
    const userId = req.user.id;

    const communities = await prisma.community.findMany({
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        _count: { select: { members: true, questions: true, posts: true } },
        members: { where: { id: userId }, select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = communities.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      color: c.color,
      createdBy: c.createdBy,
      stats: { members: c._count.members, questions: c._count.questions, posts: c._count.posts },
      isJoined: c.members.length > 0,
      isMyCreation: c.createdBy.id === userId,
    }));

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getCommunityBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    const community = await prisma.community.findUnique({
      where: { slug },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        _count: { select: { members: true, questions: true, posts: true } },
        members: { where: { id: userId }, select: { id: true } },
      },
    });

    if (!community) return res.status(404).json({ message: "Community not found" });

    return res.json({
      ...community,
      stats: { members: community._count.members, questions: community._count.questions, posts: community._count.posts },
      isJoined: community.members.length > 0,
      isAdmin: community.createdBy.id === userId,
      _count: undefined,
      members: undefined,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ═══════════════════════════════════════════════════
//  JOIN / LEAVE
// ═══════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
//  JOIN COMMUNITY
// ═══════════════════════════════════════════════════════════════════════════════
const joinCommunity = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const userId      = req.user.id;
    const io          = req.app.get("io");

    const community = await prisma.community.findUnique({
      where:   { id: communityId },
      include: { members: { where: { id: userId }, select: { id: true } } },
    });

    if (!community)
      return res.status(404).json({ message: "Community not found" });

    if (community.members.length > 0)
      return res.status(400).json({ message: "Already a member" });

    // جيب اسم اليوزر عشان يظهر في الـ notification
    const actor = await prisma.user.findUnique({
      where:  { id: userId },
      select: { name: true },
    });

    await prisma.community.update({
      where: { id: communityId },
      data:  { members: { connect: { id: userId } } },
    });

    // ✅ أبلغ الـ creator إن حد انضم (لو مش هو نفسه)
    await emitNotification(io, {
      recipientId: community.createdById,
      actorId:     userId,
      type:        "JOIN",
      message:     `👤 ${actor?.name || "Someone"} joined your community "${community.name}"`,
      metadata:    { communityId, actorId: userId },
    });

    return res.json({ message: "Joined successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  LEAVE COMMUNITY
// ═══════════════════════════════════════════════════════════════════════════════
const leaveCommunity = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const userId      = req.user.id;

    await prisma.community.update({
      where: { id: communityId },
      data:  { members: { disconnect: { id: userId } } },
    });

    return res.json({ message: "Left community" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ═══════════════════════════════════════════════════
//  QUESTIONS
// ═══════════════════════════════════════════════════

const getCommunityQuestions = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      prisma.communityQuestion.findMany({
        where: { communityId },
        include: { 
          author: { select: { id: true, name: true, avatar: true } },
          answers: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.communityQuestion.count({ where: { communityId } })
    ]);

    return res.json({
      data: questions.map(q => ({
        ...q,
        answersCount: q.answers.length,
        answers: undefined
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  CREATE QUESTION
// ═══════════════════════════════════════════════════════════════════════════════
const createQuestion = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const userId      = req.user.id;
    const io          = req.app.get("io");
    const { title, body, tags } = req.body;

    if (!title || !body)
      return res.status(400).json({ message: "title and body are required" });

    const community = await prisma.community.findUnique({
      where:   { id: communityId },
      include: { members: { select: { id: true } } },
    });

    if (!community)
      return res.status(404).json({ message: "Community not found" });

    const isMember  = community.members.some((m) => m.id === userId);
    const isCreator = community.createdById === userId;

    if (!isMember && !isCreator)
      return res.status(403).json({ message: "Join the community first to post questions" });

    const question = await prisma.communityQuestion.create({
      data:    { title, body, tags: tags || [], authorId: userId, communityId },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    // ✅ أبلغ الـ creator
    await emitNotification(io, {
      recipientId: community.createdById,
      actorId:     userId,
      type:        "QUESTION",
      message:     `❓ New question in your community: "${title}"`,
      metadata:    { questionId: question.id, communityId, actorId: userId },
    });

    // ✅ أبلغ كل الـ members (غير المنشئ وغير السائل)
    const memberIds = community.members
      .map((m) => m.id)
      .filter((id) => id !== userId && id !== community.createdById);

    await Promise.all(
      memberIds.map((memberId) =>
        emitNotification(io, {
          recipientId: memberId,
          actorId:     userId,
          type:        "QUESTION",
          message:     `❓ New question in your community: "${title}"`,
          metadata:    { questionId: question.id, communityId, actorId: userId },
        })
      )
    );

    return res.status(201).json({ message: "Question created", question });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getQuestion = async (req, res) => {
  try {
    // const communityId = Number(req.params.communityId);
    const questionId = Number(req.params.questionId);
    const userId = req.user.id;

    const question = await prisma.communityQuestion.findUnique({ where: { id: questionId },
       include: { author: { select: { id: true, name: true, avatar: true } },
        answers: { include: { author: { select: { id: true, name: true, avatar: true } } } } } });
    if (!question ) return res.status(404).json({ message: "Question not found" });

  res.status(200).json({ message: "Question found", question });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
const deleteQuestion = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const questionId = Number(req.params.questionId);
    const userId = req.user.id;

    const question = await prisma.communityQuestion.findUnique({ where: { id: questionId } });
    if (!question || question.communityId !== communityId) return res.status(404).json({ message: "Question not found" });

    const isAdmin = await isCommunityAdmin(userId, communityId);
    const isOwner = question.authorId === userId;
    const isSuperAdmin = req.user.role === "SUPER_ADMIN";

    if (!isAdmin && !isOwner && !isSuperAdmin) return res.status(403).json({ message: "Not authorized" });

    await prisma.communityQuestion.delete({ where: { id: questionId } });
    return res.json({ message: "Question deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
const addAnswer = async (req, res,next) => {
  try {    const questionId = Number(req.params.questionId);
    const userId = req.user.id;
    const { body } = req.body;
       const io = req.app.get("io"); // 🔥 socket instance
   const question=await prisma.communityQuestion.findUnique({where:{id:questionId}})
    
  const answer= await prisma.communityAnswer.create({
      data: { body, authorId: req.user.id,isAccepted: true, questionId  },
      include:{author:{select:{id:true,name:true,avatar:true}}}
    });
       const notification = await prisma.notification.create({
      data: {
        userId:question.authorId, // صاحب السؤال أو الإجابة
        message: `👍 ${answer.author.name} is Answered for question ${question.title} `,
        type: "ANSWER",
        metadata: {
           questionId: question.id,
           answerId: answer.id,
           communityId: question.communityId,
          fromUser: userId,
        },
      },
    });


    // ==============================
    // 🔥 REAL-TIME EMIT
    // ==============================
    io.to(`user_${question.authorId}`).emit("new_notification", {
      id: notification.id,
      message: notification.message,
      type: notification.type,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
    });

    res.status(201).json({ message: "Answer added", answer,success:true });
  } catch (error) {
    return next(errorHandler(error.message || 'Failed to add answer', 500));
  }
};
const editAnswer = async (req, res,next) => {
  try {    const answerId = Number(req.params.answerId);
    const { body } = req.body;
    const userId = req.user.id;
  const answer= await prisma.communityAnswer.findUnique({
    where:{id:answerId}
  });
  if (!answer) return res.status(404).json({ message: "Answer not found" });
  if (answer.authorId !== userId) return res.status(403).json({ message: "Not authorized" });

  await prisma.communityAnswer.update({
    where: { id: answerId },
    data: { body }
  });
  return res.json({ message: "Answer updated", success: true });
} catch (error) {
  return next(errorHandler(error.message || 'Failed to update answer', 500));
}
};
const deleteAnswer = async (req, res,next) => {
  try {    const answerId = Number(req.params.answerId);
    const userId = req.user.id;
  const answer= await prisma.communityAnswer.findUnique({
    where:{id:answerId}
  });
  if (!answer) return res.status(404).json({ message: "Answer not found" });
  if (answer.authorId !== userId) return res.status(403).json({ message: "Not authorized" });

  await prisma.communityAnswer.delete({ where: { id: answerId } });
  return res.json({ message: "Answer deleted",success:true });
  } catch (error) {
    return next(errorHandler(error.message || 'Failed to delete answer', 500));
  }
};
const getAnswers = async (req, res) => {
  try {
    const questionId = Number(req.params.questionId);
    const answers = await prisma.communityAnswer.findMany({
      where: { questionId },
      include: { author: { select: { id: true, name: true, avatar: true } } }
    });
    return res.json({ data: answers, success: true });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getMyAnswers = async (req, res) => {
  try {
    const questionId = Number(req.params.questionId);
    const userId = req.user.id;
    const answers = await prisma.communityAnswer.findMany({
      where: { questionId, authorId: userId },
      include: { author: { select: { id: true, name: true, avatar: true } } }
    });
    return res.json({ data: answers, success: true });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ═══════════════════════════════════════════════════
//  POSTS
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
        include: { 
          author: { select: { id: true, name: true, avatar: true } },
          comments: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({ where: { communityId } })
    ]);

    return res.json({
      data: posts.map(p => ({
        ...p,
        commentsCount: p.comments.length,
        comments: undefined
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const userId      = req.user.id;
    const io          = req.app.get("io");
    const { title, body, image, tags, readTime } = req.body;

    if (!title || !body)
      return res.status(400).json({ message: "title and body are required" });

    const community = await prisma.community.findUnique({
      where:   { id: communityId },
      include: { members: { select: { id: true } } },
    });

    if (!community)
      return res.status(404).json({ message: "Community not found" });

    const isMember  = community.members.some((m) => m.id === userId);
    const isCreator = community.createdById === userId;

    if (!isMember && !isCreator)
      return res.status(403).json({ message: "Join the community first to create posts" });

    const post = await prisma.post.create({
      data: { title, body, image, tags: tags || [], readTime, authorId: userId, communityId },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    // ✅ أبلغ الـ creator إن في post جديد (لو مش هو اللي عمله)
    await emitNotification(io, {
      recipientId: community.createdById,
      actorId:     userId,
      type:        "POST",
      message:     `📝 New post in your community: "${title}"`,
      metadata:    { postId: post.id, communityId, actorId: userId },
    });

    // ✅ أبلغ كل الـ members (غير المنشئ وغير الكاتب)
    const memberIds = community.members
      .map((m) => m.id)
      .filter((id) => id !== userId && id !== community.createdById);

    await Promise.all(
      memberIds.map((memberId) =>
        emitNotification(io, {
          recipientId: memberId,
          actorId:     userId,
          type:        "POST",
          message:     `📝 New post in your community: "${title}"`,
          metadata:    { postId: post.id, communityId, actorId: userId },
        })
      )
    );

    return res.status(201).json({ message: "Post created", post });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


const deletePost = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
    const postId = Number(req.params.postId);
    const userId = req.user.id;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.communityId !== communityId) return res.status(404).json({ message: "Post not found" });

    const isAdmin = await isCommunityAdmin(userId, communityId);
    const isOwner = post.authorId === userId;
    const isSuperAdmin = req.user.role === "SUPER_ADMIN";

    if (!isAdmin && !isOwner && !isSuperAdmin) return res.status(403).json({ message: "Not authorized" });

    await prisma.post.delete({ where: { id: postId } });
    return res.json({ message: "Post deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// أضف الـ function دي في community.controller.js

/**
 * GET /api/communities/:communityId/analytics
 * بيحسب كل الداتا من الـ posts/questions الموجودة
 */
const getCommunityAnalytics = async (req, res) => {
  try {
    const communityId = Number(req.params.communityId);
  console.log(communityId);
  
    // ── تأكد إن الكميونتى موجودة ────────────────
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // ═══════════════════════════════════════════
    // 1. WEEKLY ACTIVITY — آخر 7 أيام
    // ═══════════════════════════════════════════
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const days = Array.from({ length: 7 }, (_, i) => {
      const start = new Date();
      start.setDate(start.getDate() - (6 - i));
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      return { start, end, label: start.toLocaleDateString("en-US", { weekday: "short" }) };
    });

    const weeklyActivity = await Promise.all(
      days.map(async ({ start, end, label }) => {
        const [questions, posts] = await Promise.all([
          prisma.communityQuestion.count({
            where: { communityId, createdAt: { gte: start, lte: end } },
          }),
          prisma.post.count({
            where: { communityId, createdAt: { gte: start, lte: end } },
          }),
        ]);
        return { day: label, questions, posts };
      })
    );

    // ═══════════════════════════════════════════
    // 2. MONTHLY GROWTH — آخر 6 شهور (members)
    //    بنعد الـ members اللي موجودين دلوقتي
    //    ونقسمهم على الأشهر بناءً على createdAt
    // ═══════════════════════════════════════════
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (5 - i));
      d.setHours(0, 0, 0, 0);

      const end = new Date(d);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);

      return {
        start: d,
        end,
        label: d.toLocaleDateString("en-US", { month: "short" }),
      };
    });

    const monthlyGrowth = await Promise.all(
      months.map(async ({ start, end, label }) => {
        // عدد الـ members اللي انضموا للكميونتى في الشهر ده
        // المودل Community -> members هو many-to-many
        // محتاج نعد بناءً على createdAt للـ User اللي عنده الـ community في communitiesJoined
        const count = await prisma.user.count({
          where: {
            communitiesJoined: { some: { id: communityId } },
            createdAt: { gte: start, lte: end },
          },
        });
        return { month: label, growth: count };
      })
    );

    // ═══════════════════════════════════════════
    // 3. ENGAGEMENT — نسب questions vs posts vs comments
    // ═══════════════════════════════════════════
    const [totalQuestions, totalPosts, totalComments] = await Promise.all([
      prisma.communityQuestion.count({ where: { communityId } }),
      prisma.post.count({ where: { communityId } }),
      prisma.postComment.count({ where: { post: { communityId } } }),
    ]);

    const totalEngagement = totalQuestions + totalPosts + totalComments || 1;

    const engagement = [
      {
        name: "Questions",
        value: Math.round((totalQuestions / totalEngagement) * 100),
        color: "#3b82f6",
        count: totalQuestions,
      },
      {
        name: "Posts",
        value: Math.round((totalPosts / totalEngagement) * 100),
        color: "#8b5cf6",
        count: totalPosts,
      },
      {
        name: "Comments",
        value: Math.round((totalComments / totalEngagement) * 100),
        color: "#10b981",
        count: totalComments,
      },
    ];

    return res.json({
      weeklyActivity,   // [{ day: "Mon", questions: 12, posts: 8 }, ...]
      monthlyGrowth,    // [{ month: "Jan", growth: 5 }, ...]
      engagement,       // [{ name, value, color, count }, ...]
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

 
// ═══════════════════════════════════════════════════
//  VOTES
// ═══════════════════════════════════════════════════
const vote = async (req, res) => {
  try {
    const io = req.app.get("io"); // 🔥 socket instance


    const userId = Number(req.user.id);
    const targetId = Number(req.body.targetId);
    const { targetType, value } = req.body;
    const parsedValue = Number(value);

    if (![1, -1].includes(parsedValue)) {
      return res.status(400).json({ message: "Invalid vote value" });
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_targetId_targetType: {
          userId,
          targetId,
          targetType,
        },
      },
    });

    let change = 0;

    if (!existingVote) {
      await prisma.vote.create({
        data: { userId, targetId, targetType, value: parsedValue },
      });
      change = parsedValue;

    } else if (existingVote.value === parsedValue) {
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });
      change = -parsedValue;

    } else {
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });
      change = -existingVote.value;
    }

    const model =
      targetType === "QUESTION"
        ? prisma.communityQuestion
        : prisma.communityAnswer;

    const updated = await model.update({
      where: { id: targetId },
      data: { votes: { increment: change } },
    });
    
    // ==============================
    // 🔥 CREATE NOTIFICATION
    // ==============================

    const notification = await prisma.notification.create({
      data: {
        userId: updated.authorId, // صاحب السؤال أو الإجابة
        message: `${value > 0 ? "👍" : "👎"} ${req.user.name} voted on your ${targetType.toLowerCase()}`,
        type: "VOTE",
        metadata: {
          targetId,
          targetType,
          change,
          fromUser: userId,
        },
      },
    });

 
    // =============== ===============
    // 🔥 REAL-TIME EMIT
    // ==============================
    io.to(`user_${updated.authorId}`).emit("new_notification", {
      id: notification.id,
      message: notification.message,
      type: notification.type,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
    });

    return res.json({ message: "Vote updated", change });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};
const getVotes = async (req, res) => {
  try {
    const userId = Number(req.user?.id); // ✅ String → Number
    const targetId = Number(req.params.targetId); // ✅ String → Number
    const { targetType } = req.params;


    // جيب الـ total votes من الجدول الأساسي
    const model = targetType === "QUESTION"
      ? prisma.communityQuestion
      : prisma.communityAnswer;

    const record = await model.findUnique({
      where: { id: targetId },
      select: { votes: true },
    });

    const totalVotes = record?.votes ?? 0;

    // جيب الـ userVote
    let userVote = 0;
    if (userId) {
      const vote = await prisma.vote.findUnique({
        where: {
          userId_targetId_targetType: {
            userId,   // ✅ Number
            targetId, // ✅ Number
            targetType,
          },
        },
      });
      userVote = vote?.value ?? 0;
    }

   

    return res.json({
      success: true,
      data: { totalVotes, userVote },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ═══════════════════════════════════════════════════
//  VIEWS
// ═══════════════════════════════════════════════════
const incrementView = async (req, res) => {
  try {
    const { targetId, targetType } = req.body;
    const userId = Number(req.user.id);

    const type = targetType.toUpperCase();
    const numericTargetId = Number(targetId);

    // 🔥 1. نجيب الـ target عشان نعرف owner
    const target =
      type === "POST"
        ? await prisma.post.findUnique({
            where: { id: numericTargetId },
            select: { authorId: true },
          })
        : await prisma.communityQuestion.findUnique({
            where: { id: numericTargetId },
            select: { authorId: true },
          });

    if (!target) {
      return res.status(404).json({ message: "Target not found" });
    }

    // 🔥 2. نعمل view
    const view = await prisma.view.create({
      data: {
        userId,
        targetId: numericTargetId,
        targetType: type,
      },
    });

    // 🔥 3. increment views
    const updated =
      type === "POST"
        ? await prisma.post.update({
            where: { id: numericTargetId },
            data: { views: { increment: 1 } },
            select: { views: true },
          })
        : await prisma.communityQuestion.update({
            where: { id: numericTargetId },
            data: { views: { increment: 1 } },
            select: { views: true },
          });

    // 🔥 4. notification (only if new view)
    // if (target.authorId !== userId) {
    //   await prisma.notification.create({
    //     data: {
    //       userId: target.authorId,
    //       type: "VIEW",
    //       message: "👀 حد فتح منشورك",
    //       metadata: {
    //         targetId: numericTargetId,
    //         targetType: type,
    //         actorId: userId,
    //       },
    //     },
    //   });
    // }

    return res.json({
      success: true,
      views: updated.views,
      alreadyViewed: false,
    });

  } catch (error) {
    // 🔥 duplicate view
    if (error.code === "P2002") {
      const type = req.body.targetType.toUpperCase();
      const id = Number(req.body.targetId);

      const current =
        type === "POST"
          ? await prisma.post.findUnique({
              where: { id },
              select: { views: true },
            })
          : await prisma.communityQuestion.findUnique({
              where: { id },
              select: { views: true },
            });

      return res.json({
        success: true,
        views: current?.views ?? 0,
        alreadyViewed: true,
      });
    }

    throw error;
  }
};
const getView = async (req, res) => {
  try {
    let { targetId, targetType } = req.params;

    if (!targetId || !targetType) {
      return res.status(400).json({ message: "Missing data" });
    }

    targetType = targetType.toUpperCase();  

    let views;

    if (targetType === "QUESTION") {
      views = await prisma.communityQuestion.findUnique({
        where: { id: Number(targetId) },
        select: { views: true },
      });
    } 
    else if (targetType === "POST") {
      views = await prisma.post.findUnique({
        where: { id: Number(targetId) },
        select: { views: true },
      });
    } 
    else {
      return res.status(400).json({ message: "Invalid target type" });
    }

    return res.json({
      success: true,
      views: views?.views ?? 0,
       message:'getted'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ═══════════════════════════════════════════════════
//  FEED
// ═══════════════════════════════════════════════════
// في community.controller.js — أضف الدالة دي

const getGlobalFeed = async (req, res) => {
  try {
    const {
      filter      = 'all',
      sort        = 'latest',
      page        = 1,
      limit       = 10,
      search      = '',
      quickFilter = '',
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    // ── Order By ──────────────────────────────────────────────
    const questionOrderBy = sort === 'popular'  ? { votes: 'desc' }
                          : sort === 'trending' ? { views: 'desc' }
                          :                       { createdAt: 'desc' };

    const postOrderBy     = sort === 'popular'  ? { likes: 'desc' }
                          : sort === 'trending' ? { views: 'desc' }
                          :                       { createdAt: 'desc' };

    // ── Question Where ────────────────────────────────────────
    const questionWhere = {};

    // Search — MySQL: contains بدون mode
    if (search?.trim()) {
      questionWhere.OR = [
        { title: { contains: search.trim() } },
        { body:  { contains: search.trim() } },
      ];
    }

    // Quick Filters — بس على questions
    switch (quickFilter) {
      case 'answered':
        questionWhere.answers = { some: {} }; // في إجابات
        break;

      case 'unanswered':
        questionWhere.answers = { none: {} }; // مفيش إجابات
        break;

      case 'trending':
        // views >= 100 عشان يتعتبر trending
        questionWhere.views = { gte: 100 };
        break;

      case 'featured':
        // votes >= 10 عشان يتعتبر featured
        questionWhere.votes = { gte: 10 };
        break;

      case 'recent': {
        // آخر 3 أيام
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        questionWhere.createdAt = { gte: threeDaysAgo };
        break;
      }
    }

    // ── Post Where ────────────────────────────────────────────
    const postWhere = {};
    if (search?.trim()) {
      postWhere.OR = [
        { title: { contains: search.trim() } },
        { body:  { contains: search.trim() } },
      ];
    }

    // ── Decide ماذا نجيب ──────────────────────────────────────
    // لو في quickFilter → posts مش بتتأثر — بس questions
    const fetchQuestions = filter === 'all' || filter === 'questions';
    const fetchPosts     = (filter === 'all' || filter === 'posts') && !quickFilter;

    // ── Prisma Queries ────────────────────────────────────────
    let questions = [];
    let posts     = [];

    if (fetchQuestions) {
      questions = await prisma.communityQuestion.findMany({
        where  : questionWhere,
        orderBy: questionOrderBy,
        include: {
          // ✅ الـ Schema: User عنده name و image (مش avatar)
          author: {
            select: {
              id   : true,
              name : true,
              avatar: true,   // ← صح حسب الـ User model
            },
          },
          // ✅ Community fields: id, name, slug, icon, color
          community: {
            select: {
              id   : true,
              name : true,
              slug : true,
              icon : true,
              color: true,
            },
          },
          // ✅ CommunityQuestion عنده answers (CommunityAnswer[])
          _count: {
            select: { answers: true },
          },
        },
      });
    }

    if (fetchPosts) {
      posts = await prisma.post.findMany({
        where  : postWhere,
        orderBy: postOrderBy,
        include: {
          // ✅ نفس الـ author select
          author: {
            select: {
              id   : true,
              name : true,
              avatar: true,
            },
          },
          community: {
            select: {
              id   : true,
              name : true,
              slug : true,
              icon : true,
              color: true,
            },
          },
          // ✅ Post عنده comments (PostComment[])
          _count: {
            select: { comments: true },
          },
        },
      });
    }

    // ── Format Questions ──────────────────────────────────────
    const formattedQuestions = questions.map((q) => ({
      id              : q.id,
      type            : 'question',
      title           : q.title,
      // ✅ body موجود في CommunityQuestion
      excerpt         : q.body.length > 150
                          ? q.body.slice(0, 150) + '...'
                          : q.body,
      // ✅ tags في الـ Schema نوعه Json — Prisma بيرجعه parsed
      tags            : Array.isArray(q.tags) ? q.tags : [],
      votes           : q.votes,
      views           : q.views,
      // ✅ _count.answers من CommunityAnswer[]
      answers         : q._count.answers,
      isAnswered      : q.isAnswered,
      author          : q.author,       // { id, name, image }
      community       : q.community?.name  ?? null,
      communitySlug   : q.community?.slug  ?? null,
      communityIcon   : q.community?.icon  ?? null,
      communityColor  : q.community?.color ?? null,
      createdAt       : q.createdAt,
      createdAtFormatted: formatRelativeTime(q.createdAt),
    }));

    // ── Format Posts ──────────────────────────────────────────
    const formattedPosts = posts.map((p) => ({
      id              : p.id,
      type            : 'post',
      title           : p.title,
      // ✅ body موجود في Post
      excerpt         : p.body.length > 150
                          ? p.body.slice(0, 150) + '...'
                          : p.body,
      // ✅ tags في Post نوعه Json
      tags            : Array.isArray(p.tags) ? p.tags : [],
      // ✅ image في Post nullable String
      image           : p.image ?? null,
      likes           : p.likes,
      views           : p.views,
      bookmarks       : p.bookmarks,
      // ✅ _count.comments من PostComment[]
      comments        : p._count.comments,
      // ✅ readTime في Post nullable String
      readTime        : p.readTime ?? null,
      author          : p.author,       // { id, name, image }
      community       : p.community?.name  ?? null,
      communitySlug   : p.community?.slug  ?? null,
      communityIcon   : p.community?.icon  ?? null,
      communityColor  : p.community?.color ?? null,
      createdAt       : p.createdAt,
      createdAtFormatted: formatRelativeTime(p.createdAt),
    }));

    // ── Merge + Sort ──────────────────────────────────────────
    const merged = [...formattedQuestions, ...formattedPosts];

    switch (sort) {
      case 'popular':
        merged.sort((a, b) =>
          ((b.votes ?? 0) + (b.likes ?? 0)) -
          ((a.votes ?? 0) + (a.likes ?? 0))
        );
        break;
      case 'trending':
        merged.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
        break;
      default: // latest
        merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // ── Paginate ──────────────────────────────────────────────
    const total     = merged.length;
    const pages     = Math.ceil(total / limitNum) || 1;
    const paginated = merged.slice(skip, skip + limitNum);

    return res.status(200).json({
      success   : true,
      data      : paginated,
      pagination: { page: pageNum, limit: limitNum, total, pages },
    });

  } catch (error) {
    console.error('[getGlobalFeed]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch feed',
      error  : process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ── Helper ────────────────────────────────────────────────────
const formatRelativeTime = (date) => {
  const diffMs   = Date.now() - new Date(date);
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHrs  = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1)  return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHrs  < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
  if (diffDays < 7)  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
// ═══════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════

module.exports = {
  createCommunity,
  updateCommunity,
  deleteCommunity,
  getAllCommunities,
  getCommunityBySlug,
  joinCommunity,
  leaveCommunity,
  isCommunityAdmin,
  getCommunityQuestions,
  createQuestion,
  deleteQuestion,
  getCommunityPosts,
  createPost,
  deletePost,
  getCommunityAnalytics,
  getQuestion,
  deleteAnswer,
  addAnswer,
  editAnswer,
  getMyAnswers,
  getAnswers,
  vote,
  getVotes,
  incrementView,
  getView,
  getGlobalFeed

};