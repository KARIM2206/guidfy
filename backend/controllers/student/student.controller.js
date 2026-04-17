const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const errorHandler = require("../../utils/errorHandler");


// controllers/student/student.controller.js

const enrollStudentInLearningPath = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { learningPathId } = req.body;
  
    // ==========================
    // Validation
    // ==========================
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!learningPathId || isNaN(Number(learningPathId))) {
      return res.status(400).json({
        success: false,
        message: "Valid learningPathId is required",
      });
    }

    const parsedLearningPathId = Number(learningPathId);

    // ==========================
    // Check if learning path exists
    // ==========================
    const learningPath = await prisma.learningPath.findUnique({
      where: { id: parsedLearningPathId },
    });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: "Learning path not found",
      });
    }

    // ==========================
    // Create Enrollment safely
    // ==========================
    const enrollment = await prisma.userLearningPath.create({
      data: {
        userId,
        learningPathId: parsedLearningPathId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Student enrolled successfully",
      data: enrollment,
    });

  } catch (error) {

    // Handle unique constraint (already enrolled)
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Student is already enrolled in this learning path",
      });
    }

    console.error("Enrollment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to enroll student",
      details: error.message,
    });
  }
};

const getStudentRoadmaps = async (req, res) => {
  try {
    const userId   = req.user?.id;
    const userRole = req.user?.role;
    const { title } = req.params;

    // ── Validation ────────────────────────────────────────
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!title) {
      return res.status(400).json({ success: false, message: "title is required" });
    }

    const isSuperAdmin = userRole === "SUPER_ADMIN";

    // ── Fetch Learning Path ───────────────────────────────
    const learningPath = await prisma.learningPath.findFirst({
      where: {
        title,
        enrollments: isSuperAdmin ? {} : { some: { userId } },
      },
      include: {
        enrollments: {
          where: isSuperAdmin ? {} : { userId },
        },
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        roadmaps: {
          where: {
            roadmap: {
              isPublished: isSuperAdmin ? undefined : true,
            },
          },
          orderBy: { order: "asc" }, // ← الترتيب هنا مهم جداً
          include: {
            roadmap: {
              include: {
                // جيب progress بتاع الـ roadmap بتاع اليوزر
                roadmapProgress: {
                  where: { userId },
                },
                steps: {
                  orderBy: { order: "asc" },
                  include: {
                    lessons: {
                      orderBy: { order: "asc" },
                      include: {
                        progress: { where: { userId } },
                          video: true,  
                          article: true,
                          quiz: {
                            include: {
                            attempts: { select: { score: true } },}
                          }
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
        message: isSuperAdmin
          ? "Learning path not found"
          : "You are not enrolled in this learning path",
      });
    }

    // ── Format Roadmaps مع Locking Logic ─────────────────
    // القاعدة:
    // - الـ roadmap الأولى (order=1) دايمًا مفتوحة
    // - كل roadmap بعدها محتاجة الـ roadmap اللي قبلها تكون completed 100%
    // - SuperAdmin: كل حاجة مفتوحة

    let previousRoadmapCompleted = true; // الأولى دايمًا مفتوحة

    const formattedRoadmaps = learningPath.roadmaps.map((item) => {
      const roadmap = item.roadmap;

      // ── هل الـ roadmap دي completed؟ ───────────────────
      // بنحسبها من الـ steps بتاعتها
      let stepUnlockedFound = false;

      const formattedSteps = roadmap.steps.map((step) => {
        const totalLessons     = step.lessons.length;
        const completedLessons = step.lessons.filter(
          (l) => l.progress?.[0]?.completed
        ).length;

        const stepProgressPercentage = totalLessons === 0
          ? 0
          : Math.round((completedLessons / totalLessons) * 100);

        const isStepCompleted = stepProgressPercentage === 100;

        // Step locking — بس لو الـ roadmap نفسها مفتوحة
        let stepLocked = false;
        if (!isSuperAdmin) {
          // لو الـ roadmap نفسها locked → كل steps فيها locked
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

        // Lesson locking
        let lessonUnlockedFound = false;
        const formattedLessons = step.lessons.map((lesson) => {
          const isLessonCompleted = lesson.progress?.[0]?.completed ?? false;

          let lessonLocked = false;
          if (!isSuperAdmin) {
            if (!previousRoadmapCompleted || stepLocked) {
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
            completed: isLessonCompleted,
            locked   : lessonLocked,
            progress : lesson.progress,
          };
        });

        return {
          ...step,
          lessons : formattedLessons,
          locked  : stepLocked,
          progress: {
            totalLessons,
            completedLessons,
            progressPercentage: stepProgressPercentage,
            completed         : isStepCompleted,
          },
        };
      });

      // ── حساب الـ roadmap progress ──────────────────────
      const totalSteps     = formattedSteps.length;
      const completedSteps = formattedSteps.filter(
        (s) => s.progress.completed
      ).length;

      const roadmapProgressPercentage = totalSteps === 0
        ? 0
        : Math.round((completedSteps / totalSteps) * 100);

      const isRoadmapCompleted = roadmapProgressPercentage === 100;

      // ── Roadmap Locking ────────────────────────────────
      // الـ roadmap locked لو الـ roadmap اللي قبلها مش completed
      const roadmapLocked = isSuperAdmin ? false : !previousRoadmapCompleted;

      // ── جهز الـ previous flag للـ roadmap الجاية ───────
      // بس لو الـ roadmap الحالية مفتوحة
      if (!roadmapLocked) {
        previousRoadmapCompleted = isRoadmapCompleted;
      }
      // لو locked → فضل false عشان كل اللي بعدها locked كمان

      return {
        ...item,
        locked: roadmapLocked,
        roadmap: {
          ...roadmap,
          steps: formattedSteps,
          progress: {
            totalSteps,
            completedSteps,
            progressPercentage: roadmapProgressPercentage,
            completed         : isRoadmapCompleted,
          },
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
// controllers/student/student.controller.js
// GET /api/student/roadmap/:roadmapId/steps
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
          select: {
            id: true,
            type: true,
            stepId: true,
            progress: {
              where: { userId },
              select: { completed: true },
            },
          },
        },
      },
    });

    // ======================================
    // 🔢 Calculate Progress + Unlock Logic
    // ======================================

    let stepUnlockedFound = false;

    const formattedSteps = steps.map((step) => {
      const totalLessons = step.lessons.length;

      const completedLessonsCount = step.lessons.filter(
        (lesson) => lesson.progress?.[0]?.completed
      ).length;

      const progressPercentage =
        totalLessons === 0
          ? 0
          : Math.round((completedLessonsCount / totalLessons) * 100);

      const isStepCompleted = progressPercentage === 100;

      // 🔓 Step Lock Logic
      let stepLocked = true;

      if (!stepUnlockedFound) {
        stepLocked = false;
        if (!isStepCompleted) {
          stepUnlockedFound = true;
        }
      }

      return {
        ...step,
        progress: {
          totalLessons,
          completedLessons: completedLessonsCount,
          progressPercentage,
          completed: isStepCompleted,
        },
        locked: stepLocked,
      };
    });

    res.json({
      success: true,
      data: formattedSteps,
      message: "Steps fetched successfully with calculated progress",
    });
  } catch (error) {
    return next(
      errorHandler(
        error.message || "Failed to fetch student roadmap steps",
        500
      )
    );
  }
};

// Helper: Unlock lessons sequentially
const unlockLessonsSequentially = (lessons) => {
  let lessonUnlockedFound = false;

  return lessons.map((lesson) => {
    const isLessonCompleted = lesson.progress?.[0]?.completed || false;

    let lessonLocked = true;
    if (!lessonUnlockedFound) {
      lessonLocked = false; // أول lesson مفتوح
      if (!isLessonCompleted) lessonUnlockedFound = true; // بعد أول lesson غير مكتمل الباقي يقفل
    }

    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      externalLink: lesson.externalLink,
      thumbnail: lesson.thumbnail,
      timeLimit: lesson.timeLimit,
      passingScore: lesson.passingScore,
      video: lesson.video,
      article: lesson.article,
      quiz: lesson.quiz,
      type: lesson.type,
      completed: isLessonCompleted,
      locked: lessonLocked,
     progress: lesson.progress
    };
  });
};

// GET /api/lesson/:lessonId
const getStudentLessonsByStepId = async (req, res, next) => {
  const { stepId } = req.params;

  try {
    const lessons = await prisma.lesson.findMany({
      where: { stepId: Number(stepId) },
      include: {
        progress: {
          where: { userId: req.user.id }, // عشان unlock logic
        },
        video: true,
        article: true,
        quiz: {
          include:{
            attempts : {
              where: { userId: req.user.id },
            }
          }
        },
      },
      orderBy: { order: "asc" },
    });

    // if (!lessons || lessons.length === 0)
    //   return next(errorHandler("Lessons not found", 404));

    const formattedLessons = unlockLessonsSequentially(lessons);

    res.json({
      success: true,
      data: formattedLessons,
      message: "Lessons fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};
// ==========================
// Student: Update Step Progress
// ==========================
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

// ==========================
// Student: Update Lesson Progress
// ==========================
const updateLessonProgress = async (req, res) => {
  try {
    const userId   = req.user?.id;
    const { lessonId, completed } = req.body;

    // ── Validation ────────────────────────────────────────
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!lessonId || typeof completed !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "lessonId and completed (boolean) are required",
      });
    }

    const parsedLessonId = Number(lessonId);
    if (isNaN(parsedLessonId)) {
      return res.status(400).json({ success: false, message: "Invalid lessonId" });
    }

    // ── تأكد إن الـ lesson موجودة ────────────────────────
    const lesson = await prisma.lesson.findUnique({
      where : { id: parsedLessonId },
      select: { stepId: true },
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    const { stepId } = lesson;

    // ── تأكد إن الـ step موجودة ──────────────────────────
    const step = await prisma.step.findUnique({
      where : { id: stepId },
      select: { roadmapId: true },
    });

    if (!step) {
      return res.status(404).json({ success: false, message: "Step not found" });
    }

    const { roadmapId } = step;

    // ── جيب كل IDs محتاجينها مرة واحدة ──────────────────
    const [stepLessons, roadmapSteps] = await Promise.all([
      prisma.lesson.findMany({
        where : { stepId },
        select: { id: true },
      }),
      prisma.step.findMany({
        where : { roadmapId },
        select: { id: true },
      }),
    ]);

    const stepLessonIds  = stepLessons.map((l) => l.id);
    const roadmapStepIds = roadmapSteps.map((s) => s.id);

    // ── Transaction: كل الـ updates في عملية واحدة ───────
    const lessonProgress = await prisma.$transaction(async (tx) => {

      // 1️⃣ Update Lesson Progress
      const updatedLessonProgress = await tx.userLessonProgress.upsert({
        where: {
          userId_lessonId: { userId, lessonId: parsedLessonId },
        },
        update: {
          completed,
          completedAt: completed ? new Date() : null,
        },
        create: {
          userId,
          lessonId   : parsedLessonId,
          completed,
          completedAt: completed ? new Date() : null,
        },
      });

      // 2️⃣ Calculate Step Progress
      const lessonsProgress = await tx.userLessonProgress.findMany({
        where: {
          userId,
          lessonId : { in: stepLessonIds },
          completed: true,
        },
        select: { id: true },
      });

      const completedLessonsCount  = lessonsProgress.length;
      const stepProgressPercentage = stepLessons.length === 0
        ? 0
        : Math.round((completedLessonsCount / stepLessons.length) * 100);
      const stepCompleted = stepProgressPercentage === 100;

      // 3️⃣ Update Step Progress
      await tx.userStepProgress.upsert({
        where : { userId_stepId: { userId, stepId } },
        update: { completed: stepCompleted, progressPercentage: stepProgressPercentage },
        create: { userId, stepId, completed: stepCompleted, progressPercentage: stepProgressPercentage },
      });

      // 4️⃣ Calculate Roadmap Progress
      const stepsProgress = await tx.userStepProgress.findMany({
        where: {
          userId,
          stepId   : { in: roadmapStepIds },
          completed: true,
        },
        select: { id: true },
      });

      const completedStepsCount      = stepsProgress.length;
      const roadmapProgressPercentage = roadmapSteps.length === 0
        ? 0
        : Math.round((completedStepsCount / roadmapSteps.length) * 100);
      const roadmapCompleted = roadmapProgressPercentage === 100;

      // 5️⃣ Update Roadmap Progress
      await tx.userRoadmapProgress.upsert({
        where : { userId_roadmapId: { userId, roadmapId } },
        update: { completed: roadmapCompleted, progressPercentage: roadmapProgressPercentage },
        create: { userId, roadmapId, completed: roadmapCompleted, progressPercentage: roadmapProgressPercentage },
      });

      return updatedLessonProgress;
    });

    // ── Response ──────────────────────────────────────────
    return res.json({
      success: true,
      message: "Progress updated successfully",
      data   : lessonProgress,
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
const getStepProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const stepId = Number(req.params.stepId);

    // كل دروس الستيب
    const stepLessons = await prisma.lesson.findMany({
      where: { stepId },
      select: { id: true },
    });

    if (!stepLessons.length) {
      return res.status(404).json({
        success: false,
        message: "Step has no lessons",
      });
    }

    // بروجرس الدروس
    const lessonsProgress = await prisma.userLessonProgress.findMany({
      where: {
        userId,
        lessonId: { in: stepLessons.map(l => l.id) },
      },
    });

    const completedLessonsCount = lessonsProgress.filter(
      l => l.completed
    ).length;

    const totalLessons = stepLessons.length;

    const progressPercentage = Math.round(
      (completedLessonsCount / totalLessons) * 100
    );

    const completed = progressPercentage === 100;

    res.json({
      success: true,
      data: {
        stepId,
        completedLessons: completedLessonsCount,
        totalLessons,
        progressPercentage,
        completed,
      },
    });

  } catch (error) {
    console.error("Error getting step progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch step progress",
      details: error.message,
    });
  }
};
const getRoadmapProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const roadmapId = Number(req.params.roadmapId);

    // كل الستيبس بتاعت الرودماب
    const roadmapSteps = await prisma.step.findMany({
      where: { roadmapId },
      select: { id: true },
    });

    if (!roadmapSteps.length) {
      return res.status(404).json({
        success: false,
        message: "Roadmap has no steps",
      });
    }

    const stepIds = roadmapSteps.map(s => s.id);

    // كل دروس الرودماب
    const roadmapLessons = await prisma.lesson.findMany({
      where: { stepId: { in: stepIds } },
      select: { id: true },
    });

    const totalLessons = roadmapLessons.length;

    const lessonsProgress = await prisma.userLessonProgress.findMany({
      where: {
        userId,
        lessonId: { in: roadmapLessons.map(l => l.id) },
      },
    });

    const completedLessonsCount = lessonsProgress.filter(
      l => l.completed
    ).length;

    const progressPercentage = totalLessons === 0
      ? 0
      : Math.round((completedLessonsCount / totalLessons) * 100);

    const completed = progressPercentage === 100;

    res.json({
      success: true,
      data: {
        roadmapId,
        completedLessons: completedLessonsCount,
        totalLessons,
        progressPercentage,
        completed,
      },
    });

  } catch (error) {
    console.error("Error getting roadmap progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch roadmap progress",
      details: error.message,
    });
  }
};
const getUserContent = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const { targetType } = req.query;
console.log('user id \n', userId);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    let model;
    let where = {};
   let include={}
    switch (targetType) {
      case "QUESTION":
        model = prisma.communityQuestion;
        where = { authorId: userId };
        include = { author: { select: { id: true, name: true, avatar: true } },
         answers: { select: { id: true } } };
        break;

      case "ANSWER":
        model = prisma.communityAnswer;
        where = { authorId: userId };
        include = { author: { select: { id: true, name: true, avatar: true } },
         question: { select: { id: true, title: true } } };
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
      model.findMany({
        where,
       include,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),

      model.count({
        where,
      }),
    ]);

    return res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + data.length < total,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
module.exports = { getStudentRoadmaps,enrollStudentInLearningPath, updateStepProgress, updateLessonProgress , getStudentRoadmapStepsById, getStudentLessonsByStepId, getStepProgress, getRoadmapProgress,enrollStudentInLearningPath,getUserContent };