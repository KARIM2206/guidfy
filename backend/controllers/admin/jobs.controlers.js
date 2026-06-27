const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const errorHandler = require("../../utils/errorHandler");

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

const sendNotificationToSuperAdmins = async (req, data) => {
  const superAdmins = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN" },
    select: { id: true },
  });

  const io = req.app.get("io");

  for (const sa of superAdmins) {
    const notification = await prisma.notification.create({
      data: {
        userId: sa.id,
        message: data.message,
        type: "SYSTEM",
        metadata: data.metadata,
      },
    });

    io?.to(`user_${sa.id}`).emit("new_notification", notification);
  }
};

const sendNotification = async (req, userIds, data) => {
  const io = req.app.get("io");

  for (const userId of userIds) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        message: data.message,
        type: "SYSTEM",
        metadata: data.metadata,
      },
    });

    io?.to(`user_${userId}`).emit("new_notification", notification);
  }
};

// ═══════════════════════════════════════════════════
// CRUD
// ═══════════════════════════════════════════════════

const createJob = async (req, res) => {
  try {
    const { title, description, company, location, salary, jobType, deadline, learningPathId } = req.body;

    const learningPath = await prisma.learningPath.findUnique({
      where: { id: parseInt(learningPathId) },
    });

    if (!learningPath) {
      return res.status(404).json({ message: "Learning Path not found" });
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        company,
        location,
        salary,
        jobType,
        deadline: deadline ? new Date(deadline) : null,
        learningPathId: parseInt(learningPathId),
        createdById: req.user.id,
        status: 'PUBLISHED',
      },
    });

    // Notify super admins
    await sendNotificationToSuperAdmins(req, {
      message: `📚 Admin "${req.user.name}" added job "${job.title}" to learning-path "${learningPath?.title}"`,
      metadata: {
        type: "NEW_JOB",
        jobId: job.id,
        jobTitle: job.title,
        learningPathId: parseInt(learningPathId),
        adminId: req.user.id,
        adminName: req.user.name,
      },
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, company, location, salary, jobType, deadline, learningPathId } = req.body;

    const job = await prisma.job.findUnique({
      where: { id: Number(id) },
    });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // if (req.user.role !== "SUPER_ADMIN" && job.createdById !== req.user.id) {
    //   return res.status(403).json({ success: false, message: "Not allowed" });
    // }

    const updatedJob = await prisma.job.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        company,
        location,
        salary,
        jobType,
        deadline: deadline ? new Date(deadline) : undefined,
        learningPathId: learningPathId ? parseInt(learningPathId) : undefined,
      },
    });

    await sendNotificationToSuperAdmins(req, {
      message: `✏️ Admin "${req.user.name}" updated job "${updatedJob.title}"`,
      metadata: {
        type: "UPDATE_JOB",
        jobId: updatedJob.id,
        jobTitle: updatedJob.title,
        adminId: req.user.id,
        adminName: req.user.name,
      },
    });

    res.json({
      success: true,
      message: "Job updated successfully",
      data: updatedJob,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: Number(id) },
    });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // if (req.user.role !== "SUPER_ADMIN" && job.createdById !== req.user.id) {
    //   return res.status(403).json({ success: false, message: "Not allowed" });
    // }

    await prisma.job.delete({ where: { id: Number(id) } });

    const ioUsers = [];

    if (req.user.role === "ADMIN") {
      const superAdmins = await prisma.user.findMany({
        where: { role: "SUPER_ADMIN" },
        select: { id: true },
      });
      ioUsers.push(...superAdmins.map(sa => sa.id));
    }

    if (req.user.role === "SUPER_ADMIN") {
      ioUsers.push(job.createdById);
    }

    await sendNotification(req, ioUsers, {
      message: `🗑️ ${req.user.role} "${req.user.name}" deleted job "${job.title}"`,
      metadata: {
        type: "DELETE_JOB",
        jobId: job.id,
        jobTitle: job.title,
        deletedBy: req.user.id,
      },
    });

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSingleJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: Number(id) },
      include: { learningPath: true, createdBy: { select: { id: true, name: true, email: true } } },
    });

    if (!job) {
      return next(errorHandler("Job not found", 404));
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllJobsToCreatedByAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = { createdById: req.user.id };

    if (status) {
      where.status = status === 'ACTIVE' ? 'PUBLISHED' : status;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { learningPath: true },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

const getAlljobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search, learningPathId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};

    // ✅ Fix 1: متخليش "ALL" يعدي
    if (status && status !== 'ALL' && status !== '') {
      where.status = status === 'ACTIVE' ? 'PUBLISHED' : status;
    }

    // ✅ Fix 2: تأكد إن الـ learningPathId رقم صح
    if (learningPathId && learningPathId !== '' && !isNaN(Number(learningPathId))) {
      where.learningPathId = Number(learningPathId);
    }

    // ✅ Fix 3: Search validation
    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // ✅ Fix 4: Filter by admin (لو عايز)
    // if (req.user?.role === 'ADMIN') {
    //   where.learningPath = {
    //     admins: { some: { id: req.user.id } }
    //   };
    // }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          learningPath: { select: { id: true, title: true } },
          createdBy: { select: { id: true, name: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

const getAlljobsToStudentByLearningPathTitle = async (req, res, next) => {
  try {
    const { learningPathId } = req.params; // ← غيّرنا من Title لـ Id
    
    // ✅ إظهار الـ PUBLISHED فقط للطلاب، أما السوبر أدمن يرى كل شيء
    const role = req.user?.role;
    let whereCondition = { learningPathId: Number(learningPathId) };
    
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      whereCondition.status = 'PUBLISHED';
    }

    const jobs = await prisma.job.findMany({
      where: whereCondition,
      include: { learningPath: true },
    });

    res.json({ success: true, data: jobs });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

const changeStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN") {
      return next(errorHandler("Only Super Admin and admin can change status", 403));
    }

    const job = await prisma.job.findUnique({
      where: { id: Number(id) },
      include: {
        learningPath: {
          include: {
            enrollments: true,
            assignedAdmins: true,
          },
        },
        createdBy: true,
      },
    });

    if (!job) {
      return next(errorHandler("Job not found", 404));
    }

    const dbStatus = status === "ACTIVE" ? "PUBLISHED" : status;

    const updatedJob = await prisma.job.update({
      where: { id: Number(id) },
      data: { status: dbStatus },
    });

    const studentIds = job.learningPath?.enrollments?.map(e => e.userId) || [];
    const learningPathAdminIds = job.learningPath?.assignedAdmins?.map(a => a.adminId) || [];
    const allAdminIds = [job.createdById, ...learningPathAdminIds];
    const uniqueAdminIds = [...new Set(allAdminIds)];
    const allUsers = [...new Set([...studentIds, ...uniqueAdminIds])];

    await sendNotification(req, allUsers, {
      message: `🚀 Job "${job.title}" status changed to "${status}"`,
      metadata: {
        type: "CHANGE_STATUS",
        jobId: job.id,
        jobTitle: job.title,
        status,
        changedBy: req.user.id,
      },
    });

    res.json({
      success: true,
      message: "Job status updated successfully",
      data: updatedJob,
    });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

// ═══════════════════════════════════════════════════
// IMPORTED JOBS (from Scraper)
// ═══════════════════════════════════════════════════

const getImportedJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      source: { not: null },
      status: 'DRAFT',
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { learningPath: { select: { id: true, title: true } } },
        skip,
        take: Number(limit),
        orderBy: { scrapedAt: 'desc' },
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

const approveImportedJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.update({
      where: { id: Number(id) },
      data: { status: 'PUBLISHED' },
    });

    res.json({
      success: true,
      message: "Job approved successfully",
      data: job,
    });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

const rejectImportedJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await prisma.job.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: "Job rejected and deleted",
    });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

const approveAllImported = async (req, res, next) => {
  try {
    const result = await prisma.job.updateMany({
      where: { status: 'DRAFT', source: { not: null } },
      data: { status: 'PUBLISHED' },
    });

    res.json({
      success: true,
      message: `${result.count} jobs approved`,
      count: result.count,
    });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

const removeDuplicateJobs = async (req, res, next) => {
  try {
    // Find duplicates by externalId or title+company
    const duplicates = await prisma.$queryRaw`
      SELECT MIN(id) as keepId, externalId, title, company
      FROM Job
      WHERE externalId IS NOT NULL OR (title IS NOT NULL AND company IS NOT NULL)
      GROUP BY externalId, title, company
      HAVING COUNT(*) > 1
    `;

    let deletedCount = 0;

    for (const dup of duplicates) {
      const toDelete = await prisma.job.findMany({
        where: {
          AND: [
            { id: { not: Number(dup.keepId) } },
            {
              OR: [
                { externalId: dup.externalId },
                { AND: [{ title: dup.title }, { company: dup.company }] },
              ],
            },
          ],
        },
        select: { id: true },
      });

      await prisma.job.deleteMany({
        where: { id: { in: toDelete.map(j => j.id) } },
      });

      deletedCount += toDelete.length;
    }

    res.json({
      success: true,
      message: `${deletedCount} duplicate jobs removed`,
      count: deletedCount,
    });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

// ═══════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════

const getJobsStats = async (req, res, next) => {
  try {
    const [
      totalJobs,
      publishedJobs,
      draftJobs,
      importedJobs,
      totalApplications,
      jobsThisWeek,
    ] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: 'PUBLISHED' } }),
      prisma.job.count({ where: { status: 'DRAFT' } }),
      prisma.job.count({ where: { source: { not: null } } }),
      prisma.jobApplication.count(),
      prisma.job.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Weekly growth calculation
    const jobsLastWeek = await prisma.job.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const weeklyGrowth = jobsLastWeek > 0
      ? Math.round(((jobsThisWeek - jobsLastWeek) / jobsLastWeek) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        totalJobs,
        publishedJobs,
        draftJobs,
        importedJobs,
        totalApplications,
        jobsThisWeek,
        weeklyGrowth,
      },
    });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

// ═══════════════════════════════════════════════════
// SCRAPER STATUS
// ═══════════════════════════════════════════════════

const getScraperStatus = async (req, res, next) => {
  try {
    // Get last scraper run info from jobs with source
    const lastScrapedJob = await prisma.job.findFirst({
      where: { source: { not: null } },
      orderBy: { scrapedAt: 'desc' },
      select: { scrapedAt: true, source: true },
    });

    const jobsInLastRun = await prisma.job.count({
      where: {
        scrapedAt: {
          gte: lastScrapedJob?.scrapedAt ? new Date(lastScrapedJob.scrapedAt.getTime() - 60000) : new Date(0),
        },
      },
    });

    res.json({
      success: true,
      data: {
        isRunning: false, // TODO: implement actual scraper status check
        lastRun: lastScrapedJob?.scrapedAt || null,
        currentSource: lastScrapedJob?.source || null,
        jobsFound: jobsInLastRun,
      },
    });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

const startScraper = async (req, res, next) => {
  try {
    const { sources } = req.body;

    // TODO: integrate with n8n or your scraper service
    // This is a placeholder that returns success

    res.json({
      success: true,
      message: "Scraper started",
      sources: sources || ['linkedin', 'indeed'],
    });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

const stopScraper = async (req, res, next) => {
  try {
    // TODO: implement actual scraper stop logic

    res.json({
      success: true,
      message: "Scraper stopped",
    });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

const getScraperLogs = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    // TODO: implement actual logs from scraper service
    // Return placeholder logs
    const logs = [
      { timestamp: new Date(), level: 'info', message: 'Scraper service ready' },
    ];

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

const getScraperHistory = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    // Get recent scraping activity from jobs
    const history = await prisma.job.groupBy({
      by: ['source', 'scrapedAt'],
      where: { source: { not: null } },
      _count: { id: true },
      orderBy: { scrapedAt: 'desc' },
      take: Number(limit),
    });

    const formatted = history.map(h => ({
      id: `${h.source}-${h.scrapedAt.getTime()}`,
      source: h.source,
      startedAt: h.scrapedAt,
      jobsFound: h._count.id,
      success: true,
      duration: 60, // placeholder
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

// ═══════════════════════════════════════════════════
// GET JOBS BY LEARNING PATH (for Super Admin assignment view)
// ═══════════════════════════════════════════════════
// ═══════════════════════════════════════════════════
// jobs.controller.js — أضف الـ endpoint ده
// ═══════════════════════════════════════════════════

const getJobsByLearningPath = async (req, res, next) => {
  try {
    const { learningPathId } = req.params;
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // 🔒 Check access
    if (req.user.role !== 'SUPER_ADMIN') {
      const hasAccess = await prisma.learningPathPermission.findFirst({
        where: {
          learningPathId: Number(learningPathId),
          userId: req.user.id,
          section: 'JOB',
        },
      });

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this learning path',
        });
      }
    }

    // ✅ بناء الـ WHERE بـ AND array
    const whereConditions = [
      { learningPathId: Number(learningPathId) },
    ];

    if (status && status !== 'ALL' && status !== '') {
      whereConditions.push({ status: status === 'ACTIVE' ? 'PUBLISHED' : status });
    }

    // ✅ MySQL: شيل mode: 'insensitive' — contains شغال case-insensitive لوحده
    if (search && search.trim() !== '') {
      whereConditions.push({
        OR: [
          { title: { contains: search } },        // ← شلت mode: 'insensitive'
          { company: { contains: search } },      // ← شلت mode: 'insensitive'
          { location: { contains: search } },     // ← شلت mode: 'insensitive'
        ],
      });
    }

    const where = { AND: whereConditions };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          learningPath: { select: { id: true, title: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.job.count({ where }),
    ]);

    // Get assigned admins
    const permissions = await prisma.learningPathPermission.findMany({
      where: {
        learningPathId: Number(learningPathId),
        section: 'JOB',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    res.json({
      success: true,
      data: jobs,
      assignedAdmins: permissions.map((p) => p.user),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

// ═══════════════════════════════════════════════════
// Endpoint جديد: Get Admin's Assigned Learning Paths with JOB section
// ═══════════════════════════════════════════════════

const getAdminLearningPaths = async (req, res, next) => {
  try {
    const { section = 'JOB' } = req.query;
    const sectionUpper = section.toUpperCase();
    const userRole = req.user.role;

    let learningPaths = [];

    // ── SUPER_ADMIN: جيب كل الـ Learning Paths ──
    if (userRole === 'SUPER_ADMIN') {
      const allPaths = await prisma.learningPath.findMany({
        include: {
          _count: { select: { jobsList: true } },
          // ✅ الفلترة هنا جوه الـ permissions relation مش على LearningPath نفسه
          permissions: {
            where: { section: sectionUpper },
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          },
        },
      });

      learningPaths = allPaths.map((lp) => ({
        ...lp,
        assignedAdmins: lp.permissions.map((perm) => ({
          adminId: perm.userId,
          admin: perm.user,
        })),
      }));
    } 
    // ── ADMIN عادي: جيب بس اللي معاه permission ──
    else {
      const permissions = await prisma.learningPathPermission.findMany({
        where: {
          userId: req.user.id,
          section: sectionUpper,
        },
        include: {
          learningPath: {
            include: {
              _count: { select: { jobsList: true } },
              permissions: {
                where: { section: sectionUpper },
                include: {
                  user: {
                    select: { id: true, name: true, email: true, role: true },
                  },
                },
              },
            },
          },
        },
      });

      learningPaths = permissions.map((p) => ({
        ...p.learningPath,
        assignedAdmins: p.learningPath.permissions.map((perm) => ({
          adminId: perm.userId,
          admin: perm.user,
        })),
      }));
    }

    res.json({
      success: true,
      data: learningPaths,
      message: 'Learning paths fetched successfully',
    });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

// ═══════════════════════════════════════════════════
// SAVED JOBS (STUDENT)
// ═══════════════════════════════════════════════════

const toggleSavedJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Check if it's already saved
    const existing = await prisma.userSavedJob.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId: Number(jobId),
        },
      },
    });

    if (existing) {
      // Unsave
      await prisma.userSavedJob.delete({
        where: { id: existing.id },
      });
      return res.json({ success: true, message: 'Job removed from saved list', saved: false });
    } else {
      // Save
      await prisma.userSavedJob.create({
        data: {
          userId,
          jobId: Number(jobId),
        },
      });
      return res.json({ success: true, message: 'Job saved successfully', saved: true });
    }
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

const getSavedJobs = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const savedJobs = await prisma.userSavedJob.findMany({
      where: { userId },
      include: {
        job: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format them so the frontend gets an array of jobs with an extra 'savedAt' field
    const formattedJobs = savedJobs.map((sj) => ({
      ...sj.job,
      savedAt: sj.createdAt,
      isSaved: true,
    }));

    res.json({ success: true, data: formattedJobs });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

module.exports = {
  // CRUD
  createJob,
  updateJob,
  deleteJob,
  getSingleJob,
  getAllJobsToCreatedByAdmin,
  getAlljobs,
   getJobsByLearningPath,
  getAdminLearningPaths,
  changeStatus,
  getAlljobsToStudentByLearningPathTitle,

  // Imported Jobs
  getImportedJobs,
  approveImportedJob,
  rejectImportedJob,
  approveAllImported,
  removeDuplicateJobs,

  // Stats
  getJobsStats,

  // Scraper
  getScraperStatus,
  startScraper,
  stopScraper,
  getScraperLogs,
  getScraperHistory,

  // Saved Jobs
  toggleSavedJob,
  getSavedJobs,
};