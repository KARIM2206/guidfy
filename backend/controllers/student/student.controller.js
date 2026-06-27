
const prisma = require('../../prismaClient');
const errorHandler = require("../../utils/errorHandler");
console.log(Object.keys(prisma));
// ═══════════════════════════════════════════════════════════════════════
// Helper: يتعامل مع Prisma progress Array (one-to-many relation)
// ═══════════════════════════════════════════════════════════════════════
const getProgressFromArray = (progressArray) => {
  if (!progressArray || !Array.isArray(progressArray) || progressArray.length === 0) {
    return { completed: false, progressPercentage: 0, completedAt: null };
  }
  const p = progressArray[0];
  return {
    completed: p?.completed ?? false,
    progressPercentage: p?.progressPercentage ?? 0,
    completedAt: p?.completedAt ?? null,
  };
};

// ═══════════════════════════════════════════════════════════════════════
// Helper: يحسب Step Progress من Lessons
// ═══════════════════════════════════════════════════════════════════════
const calculateStepProgress = (lessons) => {
  const total = lessons.length;
  if (total === 0) {
    return { totalLessons: 0, completedLessons: 0, progressPercentage: 0, completed: false };
  }
  const completed = lessons.filter((l) => l._progress?.completed ?? l.completed ?? false).length;
  const percentage = Math.round((completed / total) * 100);
  return {
    totalLessons: total,
    completedLessons: completed,
    progressPercentage: percentage,
    completed: percentage === 100,
  };
};

// ═══════════════════════════════════════════════════════════════════════
// Helper: يحسب Roadmap Progress من Steps
// ═══════════════════════════════════════════════════════════════════════
const calculateRoadmapProgress = (steps) => {
  const total = steps.length;
  if (total === 0) {
    return { totalSteps: 0, completedSteps: 0, progressPercentage: 0, completed: false };
  }
  const completed = steps.filter((s) => s.progress?.completed ?? false).length;
  const totalPercentage = steps.reduce((sum, s) => sum + (s.progress?.progressPercentage ?? 0), 0);
  const percentage = Math.round(totalPercentage / total);
  return {
    totalSteps: total,
    completedSteps: completed,
    progressPercentage: percentage,
    completed: percentage === 100,
  };
};

// ═══════════════════════════════════════════════════════════════════════
// POST /api/student/enroll
// ═══════════════════════════════════════════════════════════════════════
const enrollStudentInLearningPath = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { learningPathId } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!learningPathId || isNaN(Number(learningPathId))) {
      return res.status(400).json({ success: false, message: "Valid learningPathId is required" });
    }

    const parsedId = Number(learningPathId);
    const learningPath = await prisma.learningPath.findUnique({ where: { id: parsedId } });
    if (!learningPath) return res.status(404).json({ success: false, message: "Learning path not found" });

    const enrollment = await prisma.userLearningPath.create({
      data: { userId, learningPathId: parsedId },
    });

    return res.status(201).json({
      success: true,
      message: "Student enrolled successfully",
      data: enrollment,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ success: false, message: "Already enrolled" });
    }
    console.error("Enrollment Error:", error);
    return res.status(500).json({ success: false, message: "Failed to enroll", details: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// GET /api/student/roadmaps/title/:title
// ═══════════════════════════════════════════════════════════════════════
const getStudentRoadmaps = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { title } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!title) return res.status(400).json({ success: false, message: "title is required" });

    const isSuperAdmin = userRole === "SUPER_ADMIN";

    // ── Fetch Learning Path مع كل Relations ─────────────────────────
    const learningPath = await prisma.learningPath.findFirst({
      where: {
        title,
        isPublished: true, // ✅ لا تعرض مسار غير منشور أبداً لأي شخص
        enrollments: isSuperAdmin ? {} : { some: { userId } },
      },
      include: {
        enrollments: { where: isSuperAdmin ? {} : { userId } },
        createdBy: { select: { id: true, name: true, avatar: true } },
        roadmaps: {
          where: { roadmap: { isPublished: isSuperAdmin ? undefined : true } },
          orderBy: { order: "asc" },
          include: {
            roadmap: {
              include: {
                // ✅ take: 1 عشان Array مترجعش فاضية
                roadmapProgress: { where: { userId }, take: 1 },
                steps: {
                  orderBy: { order: "asc" },
                  include: {
                    lessons: {
                      orderBy: { order: "asc" },
                      include: {
                        // ✅ take: 1 عشان Array مترجعش فاضية
                        progress: { where: { userId }, take: 1 },
                        video: true,
                        article: true,
                        quiz: { include: { attempts: { where: { userId }, select: { score: true } } } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!learningPath) {
      return res.status(isSuperAdmin ? 404 : 403).json({
        success: false,
        message: isSuperAdmin ? "Learning path not found" : "You are not enrolled in this learning path",
      });
    }

    // ── Format Roadmaps مع Locking + Progress ────────────────────────
    let previousRoadmapCompleted = true;

    const formattedRoadmaps = learningPath.roadmaps.map((item) => {
      const roadmap = item.roadmap;

      // ✅ جيب Roadmap Progress من الـ Array
      const roadmapProg = getProgressFromArray(roadmap.roadmapProgress);
      let stepUnlockedFound = false;

      const formattedSteps = roadmap.steps.map((step) => {
        const totalLessons = step.lessons.length;

        // ✅ Format Lessons مع Progress صحيح
        let lessonUnlockedFound = false;
        const formattedLessons = step.lessons.map((lesson) => {
          // ✅ الـ progress هنا Array بسبب Prisma relation
          const lessonProg = getProgressFromArray(lesson.progress);
          const isLessonCompleted = lessonProg.completed;

          let lessonLocked = false;
          if (!isSuperAdmin) {
            if (!previousRoadmapCompleted) {
              lessonLocked = true;
            } else {
              lessonLocked = true;
              if (!lessonUnlockedFound) {
                lessonLocked = false;
                if (!isLessonCompleted) lessonUnlockedFound = true;
              }
            }
          }

          return {
            ...lesson,
            completed: isLessonCompleted, // ✅ ده اللي الـ Frontend بيشوفه
            locked: lessonLocked,
            progress: lesson.progress, // ✅ Array الأصلية للـ Debug
            _progress: lessonProg, // ✅ Object normalized
          };
        });

        // ✅ احسب Step Progress من الـ Lessons المُformaّتة
        const stepProg = calculateStepProgress(formattedLessons);
        const isStepCompleted = stepProg.completed;

        // Step Locking
        let stepLocked = false;
        if (!isSuperAdmin) {
          if (!previousRoadmapCompleted) {
            stepLocked = true;
          } else {
            stepLocked = true;
            if (!stepUnlockedFound) {
              stepLocked = false;
              if (!isStepCompleted) stepUnlockedFound = true;
            }
          }
        }

        return {
          ...step,
          lessons: formattedLessons,
          locked: stepLocked,
          progress: stepProg, // ✅ Progress محسوب من الـ Backend
        };
      });

      // ✅ احسب Roadmap Progress من الـ Steps
      const roadmapProgress = calculateRoadmapProgress(formattedSteps);
      const isRoadmapCompleted = roadmapProgress.completed;

      // Roadmap Locking
      const roadmapLocked = isSuperAdmin ? false : !previousRoadmapCompleted;
      if (!roadmapLocked) {
        previousRoadmapCompleted = isRoadmapCompleted;
      }

      return {
        ...item,
        locked: roadmapLocked,
        roadmap: {
          ...roadmap,
          steps: formattedSteps,
          progress: roadmapProgress, // ✅ Progress محسوب من الـ Backend
          _roadmapProgress: roadmapProg, // ✅ من الـ DB مباشرة (للـ Debug)
        },
      };
    });

    return res.json({
      success: true,
      data: {
        ...learningPath,
        roadmaps: formattedRoadmaps,
      },
    });
  } catch (error) {
    console.error("[getStudentRoadmaps]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch roadmaps",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// GET /api/student/roadmap/:roadmapId/steps
// ═══════════════════════════════════════════════════════════════════════
const getStudentRoadmapStepsById = async (req, res, next) => {
  const { roadmapId } = req.params;
  const userId = req.user.id;

  try {
    const steps = await prisma.step.findMany({
      where: { roadmapId: Number(roadmapId) },
      orderBy: { order: "asc" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: {
            // ✅ include كامل عشان نحسب Progress
            progress: { where: { userId }, take: 1 },
          },
        },
      },
    });

    let stepUnlockedFound = false;

    const formattedSteps = steps.map((step) => {
      // ✅ Format Lessons مع Progress
      const formattedLessons = step.lessons.map((lesson) => {
        const prog = getProgressFromArray(lesson.progress);
        return {
          ...lesson,
          completed: prog.completed,
          _progress: prog,
        };
      });

      const totalLessons = formattedLessons.length;
      const completedLessons = formattedLessons.filter((l) => l.completed).length;
      const progressPercentage = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
      const isStepCompleted = progressPercentage === 100;

      let stepLocked = true;
      if (!stepUnlockedFound) {
        stepLocked = false;
        if (!isStepCompleted) stepUnlockedFound = true;
      }

      return {
        ...step,
        lessons: formattedLessons,
        progress: {
          totalLessons,
          completedLessons,
          progressPercentage,
          completed: isStepCompleted,
        },
        locked: stepLocked,
      };
    });

    res.json({
      success: true,
      data: formattedSteps,
      message: "Steps fetched successfully",
    });
  } catch (error) {
    return next(errorHandler(error.message || "Failed to fetch steps", 500));
  }
};

// ═══════════════════════════════════════════════════════════════════════
// GET /api/student/lessons/step/:stepId
// ═══════════════════════════════════════════════════════════════════════
const getStudentLessonsByStepId = async (req, res, next) => {
  const { stepId } = req.params;
  const userId = req.user.id;

  try {
    const lessons = await prisma.lesson.findMany({
      where: { stepId: Number(stepId) },
      include: {
        progress: { where: { userId }, take: 1 },
        video: true,
        article: true,
        quiz: { include: { attempts: { where: { userId } } } },
      },
      orderBy: { order: "asc" },
    });

    let lessonUnlockedFound = false;

    const formattedLessons = lessons.map((lesson) => {
      const prog = getProgressFromArray(lesson.progress);
      const isLessonCompleted = prog.completed;

      let lessonLocked = true;
      if (!lessonUnlockedFound) {
        lessonLocked = false;
        if (!isLessonCompleted) lessonUnlockedFound = true;
      }

      return {
        ...lesson,
        completed: isLessonCompleted,
        locked: lessonLocked,
        progress: lesson.progress,
        _progress: prog,
      };
    });

    res.json({
      success: true,
      data: formattedLessons,
      message: "Lessons fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════
// PUT /api/student/lessons/progress — بيحدث Lesson + Step + Roadmap
// ═══════════════════════════════════════════════════════════════════════
const updateLessonProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { lessonId, completed } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!lessonId || typeof completed !== "boolean") {
      return res.status(400).json({ success: false, message: "lessonId and completed (boolean) required" });
    }

    const parsedLessonId = Number(lessonId);
    if (isNaN(parsedLessonId)) return res.status(400).json({ success: false, message: "Invalid lessonId" });

    // ── جيب Lesson + Step + Roadmap IDs ─────────────────────────────
    const lesson = await prisma.lesson.findUnique({
      where: { id: parsedLessonId },
      select: { stepId: true },
    });
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });

    const { stepId } = lesson;
    const step = await prisma.step.findUnique({
      where: { id: stepId },
      select: { roadmapId: true },
    });
    if (!step) return res.status(404).json({ success: false, message: "Step not found" });

    const { roadmapId } = step;

    // ── جيب كل IDs محتاجينها ────────────────────────────────────────
    const [stepLessons, roadmapSteps] = await Promise.all([
      prisma.lesson.findMany({ where: { stepId }, select: { id: true } }),
      prisma.step.findMany({ where: { roadmapId }, select: { id: true } }),
    ]);

    const stepLessonIds = stepLessons.map((l) => l.id);
    const roadmapStepIds = roadmapSteps.map((s) => s.id);

    // ── Transaction: كل الـ Updates في عملية واحدة ──────────────────
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Update Lesson Progress
      const lessonProgress = await tx.userLessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId: parsedLessonId } },
        update: { completed, completedAt: completed ? new Date() : null },
        create: { userId, lessonId: parsedLessonId, completed, completedAt: completed ? new Date() : null },
      });

      // 2️⃣ Calculate Step Progress
      const lessonsProgress = await tx.userLessonProgress.findMany({
        where: { userId, lessonId: { in: stepLessonIds }, completed: true },
        select: { id: true },
      });

      const completedLessons = lessonsProgress.length;
      const stepProgressPercentage = stepLessons.length === 0 ? 0 : Math.round((completedLessons / stepLessons.length) * 100);
      const stepCompleted = stepProgressPercentage === 100;

      // 3️⃣ Update Step Progress
      const stepProgress = await tx.userStepProgress.upsert({
        where: { userId_stepId: { userId, stepId } },
        update: { completed: stepCompleted, progressPercentage: stepProgressPercentage },
        create: { userId, stepId, completed: stepCompleted, progressPercentage: stepProgressPercentage },
      });

      // 4️⃣ Calculate Roadmap Progress
      const stepsProgress = await tx.userStepProgress.findMany({
        where: { userId, stepId: { in: roadmapStepIds } },
        select: { id: true, progressPercentage: true, completed: true },
      });

      const completedSteps = stepsProgress.filter(s => s.completed).length;
      let totalPercentage = 0;
      stepsProgress.forEach(s => {
        totalPercentage += s.progressPercentage || 0;
      });
      const roadmapProgressPercentage = roadmapSteps.length === 0 ? 0 : Math.round(totalPercentage / roadmapSteps.length);
      const roadmapCompleted = roadmapProgressPercentage === 100;

      // 5️⃣ Update Roadmap Progress
      const roadmapProgress = await tx.userRoadmapProgress.upsert({
        where: { userId_roadmapId: { userId, roadmapId } },
        update: { completed: roadmapCompleted, progressPercentage: roadmapProgressPercentage },
        create: { userId, roadmapId, completed: roadmapCompleted, progressPercentage: roadmapProgressPercentage },
      });

      return { lessonProgress, stepProgress, roadmapProgress };
    });

    // ── Response مع كل الـ Progress المحدث ──────────────────────────
    return res.json({
      success: true,
      message: "Progress updated successfully",
      data: {
        lessonProgress: result.lessonProgress,
        stepProgress: result.stepProgress,
        roadmapProgress: result.roadmapProgress,
      },
    });
  } catch (error) {
    console.error("[updateLessonProgress]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update progress",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// PUT /api/student/steps/progress
// ═══════════════════════════════════════════════════════════════════════
const updateStepProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { stepId, completed } = req.body;

    const progress = await prisma.userStepProgress.upsert({
      where: { userId_stepId: { userId, stepId: Number(stepId) } },
      update: { completed, progressPercentage: completed ? 100 : 0 },
      create: { userId, stepId: Number(stepId), completed, progressPercentage: completed ? 100 : 0 },
    });

    res.json({ success: true, data: progress });
  } catch (error) {
    console.error("Error updating step progress:", error);
    res.status(500).json({ success: false, message: "Failed to update step progress", details: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// GET /api/student/steps/:stepId/progress
// ═══════════════════════════════════════════════════════════════════════
const getStepProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const stepId = Number(req.params.stepId);

    const stepLessons = await prisma.lesson.findMany({
      where: { stepId },
      select: { id: true },
    });

    if (!stepLessons.length) {
      return res.status(404).json({ success: false, message: "Step has no lessons" });
    }

    const lessonsProgress = await prisma.userLessonProgress.findMany({
      where: { userId, lessonId: { in: stepLessons.map((l) => l.id) } },
    });

    const completedLessons = lessonsProgress.filter((l) => l.completed).length;
    const totalLessons = stepLessons.length;
    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

    res.json({
      success: true,
      data: {
        stepId,
        completedLessons,
        totalLessons,
        progressPercentage,
        completed: progressPercentage === 100,
      },
    });
  } catch (error) {
    console.error("Error getting step progress:", error);
    res.status(500).json({ success: false, message: "Failed to fetch step progress", details: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// GET /api/student/roadmaps/:roadmapId/progress
// ═══════════════════════════════════════════════════════════════════════
const getRoadmapProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const roadmapId = Number(req.params.roadmapId);

    const roadmapSteps = await prisma.step.findMany({
      where: { roadmapId },
      select: { id: true },
    });

    if (!roadmapSteps.length) {
      return res.status(404).json({ success: false, message: "Roadmap has no steps" });
    }

    const stepIds = roadmapSteps.map((s) => s.id);
    const stepsProgress = await prisma.userStepProgress.findMany({
      where: { userId, stepId: { in: stepIds } },
    });

    const completedSteps = stepsProgress.filter((s) => s.completed).length;
    let totalPercentage = 0;
    stepsProgress.forEach((s) => {
      totalPercentage += s.progressPercentage || 0;
    });

    const progressPercentage = roadmapSteps.length === 0 ? 0 : Math.round(totalPercentage / roadmapSteps.length);

    res.json({
      success: true,
      data: {
        roadmapId,
        completedLessons,
        totalLessons,
        progressPercentage,
        completed: progressPercentage === 100,
      },
    });
  } catch (error) {
    console.error("Error getting roadmap progress:", error);
    res.status(500).json({ success: false, message: "Failed to fetch roadmap progress", details: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// GET /api/student/user-content
// ═══════════════════════════════════════════════════════════════════════
const getUserContent = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const { targetType } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let model, where = {}, include = {};

    switch (targetType) {
      case "QUESTION":
        model = prisma.communityQuestion;
        where = { authorId: userId };
        include = { author: { select: { id: true, name: true, avatar: true } }, answers: { select: { id: true } } };
        break;
      case "ANSWER":
        model = prisma.communityAnswer;
        where = { authorId: userId };
        include = { author: { select: { id: true, name: true, avatar: true } }, question: { select: { id: true, title: true } } };
        break;
      case "POST":
        model = prisma.post;
        where = { authorId: userId };
        include = { author: { select: { id: true, name: true, avatar: true } } };
        break;
      default:
        return res.status(400).json({ message: "Invalid type" });
    }

    const [data, total] = await Promise.all([
      model.findMany({ where, include, orderBy: { createdAt: "desc" }, skip, take: limit }),
      model.count({ where }),
    ]);

    return res.json({
      success: true,
      data,
      pagination: { page, limit, total, hasMore: skip + data.length < total },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message || "Something went wrong" });
  }
};

module.exports = {
  getStudentRoadmaps,
  enrollStudentInLearningPath,
  updateStepProgress,
  updateLessonProgress,
  getStudentRoadmapStepsById,
  getStudentLessonsByStepId,
  getStepProgress,
  getRoadmapProgress,
  getUserContent,
};