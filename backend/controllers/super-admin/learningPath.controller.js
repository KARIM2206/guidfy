
const prisma = require("../../prismaClient");
const errorHandler = require("../../utils/errorHandler");
const { getRecommendedPath } = require("../../services/learningPathService");
const stringSimilarity = require("string-similarity");
// ==========================
// Add Learning Path
// ==========================
const fs = require("fs");
const path = require("path");
const { get } = require("http");
const e = require("express");
const { default: axios } = require("axios");
const { log } = require("console");

const addLearningPath = async (req, res, next) => {
  const { title, description, estimatedDuration } = req.body;
  const currentUser = req.user;

  try {
    if (!title || !description || !estimatedDuration) {
      return next(errorHandler("All required fields must be provided", 400));
    }

    const imagePath = req.file
      ? `/uploads/learning-path/${req.file.filename}`
      : null;

    const learningPath = await prisma.learningPath.create({
      data: {
        title,
        description,
      //  jobs: 0,
        estimatedDuration: Number(estimatedDuration),
        createdById: currentUser.id,
        image: imagePath,
      },
    });

    res.status(201).json({
      success: true,
      message: "Learning Path created successfully",
      data: learningPath,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================
// Get All Learning Paths
// ==========================
const getAllLearningPaths = async (req, res, next) => {
  const userId = req.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const role = user.role;

  const { search, topic, level, duration, special } = req.query;

  let where = { isPublished: true }; // ✅ ALWAYS only show published paths in the student grid!
  let whereEnrollments = {};

  if (role === 'STUDENT') {
    whereEnrollments.userId = userId;
  } else if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    // Admins see all enrollments, but still only published paths
  }

  // البحث النصي
  const searchText = search || topic;
  if (searchText) {
    where.OR = [
      { title: { contains: searchText } },          // بدون mode
      { description: { contains: searchText } }
    ];
  }

  // فلتر المدة
  if (duration && duration !== 'Any Duration') {
    const match = duration.match(/(\d+)-(\d+)\s*hrs/);
    if (match) {
      const minHours = parseInt(match[1], 10);
      const maxHours = parseInt(match[2], 10);
      where.estimatedDuration = {
        gte: minHours,
        lte: maxHours,
      };
    }
  }

  // يمكن إضافة فلاتر level و special عندما تصبح الحقول موجودة في الموديل

  try {
    const learningPaths = await prisma.learningPath.findMany({
      where,
      include: {
        roadmaps: {
          include: { 
            roadmap: {
              include: {
                steps: {
                  include: {
                    lessons: { select: { id: true } }
                  }
                }
              }
            } 
          },
          orderBy: { order: 'asc' },
        },
        assignedAdmins: {
          select: {
            admin: true,
            adminId: true,
          },
        },
        permissions: true,
        createdBy: true,
        enrollments: {
          where: whereEnrollments,
        },
        projects: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // ── Compute user progress for Learning Paths ──
    let userCompletedLessonIds = new Set();
    const userProgress = await prisma.userLessonProgress.findMany({
      where: { userId, completed: true }
    });
    userProgress.forEach(p => {
      userCompletedLessonIds.add(p.lessonId);
    });

    const formattedPaths = learningPaths.map(path => {
      let pathProgress = 0;
      if (path.roadmaps && path.roadmaps.length > 0) {
        let publishedRoadmapsCount = 0;
        let totalRoadmapPercentage = 0;

        path.roadmaps.forEach(r => {
          if (r.roadmap && r.roadmap.isPublished) {
            publishedRoadmapsCount++;
            let stepsCount = 0;
            let totalStepsPercentage = 0;

            if (r.roadmap.steps) {
              stepsCount = r.roadmap.steps.length;
              r.roadmap.steps.forEach(step => {
                let stepPercentage = 0;
                if (step.lessons && step.lessons.length > 0) {
                  let totalLessons = step.lessons.length;
                  let completedLessons = 0;
                  step.lessons.forEach(lesson => {
                    if (userCompletedLessonIds.has(lesson.id)) completedLessons++;
                  });
                  stepPercentage = Math.round((completedLessons / totalLessons) * 100);
                }
                totalStepsPercentage += stepPercentage;
              });
            }

            let roadmapPercentage = stepsCount > 0 ? Math.round(totalStepsPercentage / stepsCount) : 0;
            totalRoadmapPercentage += roadmapPercentage;
          }
        });

        if (publishedRoadmapsCount > 0) {
          pathProgress = Math.round(totalRoadmapPercentage / publishedRoadmapsCount);
        }
      }

      const formattedEnrollments = (path.enrollments || []).map(e => ({
        ...e,
        // Only set progress if it's the current user's enrollment
        ...(e.userId === userId ? { progress: pathProgress } : {})
      }));

      // Remove nested steps/lessons before sending to client to save bandwidth
      const cleanedRoadmaps = path.roadmaps.map(r => {
        if (r.roadmap) {
          delete r.roadmap.steps;
        }
        return r;
      });

      return {
        ...path,
        currentUserProgress: pathProgress,
        roadmaps: cleanedRoadmaps,
        enrollments: formattedEnrollments
      };
    });

    res.json({
      success: true,
      data: formattedPaths,
      message: 'Learning Paths fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ==========================
// Get All Learning Paths (For Super Admin)
// ==========================
const getAllLearningPathsSuperAdmin = async (req, res, next) => {
  try {
    const { search, topic, duration } = req.query;
    let where = {};

    // البحث النصي
    const searchText = search || topic;
    if (searchText) {
      where.OR = [
        { title: { contains: searchText } },
        { description: { contains: searchText } }
      ];
    }

    if (duration && duration !== 'Any Duration') {
      const match = duration.match(/(\d+)-(\d+)\s*hrs/);
      if (match) {
        const minHours = parseInt(match[1], 10);
        const maxHours = parseInt(match[2], 10);
        where.estimatedDuration = {
          gte: minHours,
          lte: maxHours,
        };
      }
    }

    const learningPaths = await prisma.learningPath.findMany({
      where,
      include: {
        roadmaps: {
          include: { roadmap: true },
          orderBy: { order: 'asc' },
        },
        assignedAdmins: {
          select: {
            admin: true,
            adminId: true,
          },
        },
        permissions: true,
        createdBy: true,
        projects: true,
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: learningPaths,
      message: 'All Learning Paths fetched successfully for Super Admin',
    });
  } catch (error) {
    next(error);
  }
};

// ==========================
// Get Single Learning Path
// ==========================
const getSingleLearningPath = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user=await prisma.user.findUnique({where:{id:Number(req.user.id)}})
    let where={};
    if(user.role=='STUDENT'){
      where.userId=Number(req.user.id)
    }
    // else if(user.role=='SUPER_ADMIN'){
    //   w
    // }
    const learningPath = await prisma.learningPath.findUnique({
      where: { id: Number(id) },
      include: {
        roadmaps: {
          include: { 
            roadmap: {
              include: {
                steps: {
                  include: {
                    lessons: { select: { id: true } }
                  }
                }
              }
            } 
          },
          orderBy: { order: "asc" },
        },
        createdBy: true,
        enrollments:{
          where
        }
      },
    });

    if (!learningPath) return next(errorHandler("Learning Path not found", 404));

    // ── Compute user progress for Learning Path ──
    let pathProgress = 0;
    if (learningPath.roadmaps && learningPath.roadmaps.length > 0) {
      const userProgress = await prisma.userLessonProgress.findMany({
        where: { userId: Number(req.user.id), completed: true }
      });
      const userCompletedLessonIds = new Set(userProgress.map(p => p.lessonId));
      
      let publishedRoadmapsCount = 0;
      let totalRoadmapPercentage = 0;

      learningPath.roadmaps.forEach(r => {
        if (r.roadmap && r.roadmap.isPublished) {
          publishedRoadmapsCount++;
          let stepsCount = 0;
          let totalStepsPercentage = 0;

          if (r.roadmap.steps) {
            stepsCount = r.roadmap.steps.length;
            r.roadmap.steps.forEach(step => {
              let stepPercentage = 0;
              if (step.lessons && step.lessons.length > 0) {
                let totalLessons = step.lessons.length;
                let completedLessons = 0;
                step.lessons.forEach(lesson => {
                  if (userCompletedLessonIds.has(lesson.id)) completedLessons++;
                });
                stepPercentage = Math.round((completedLessons / totalLessons) * 100);
              }
              totalStepsPercentage += stepPercentage;
            });
          }

          let roadmapPercentage = stepsCount > 0 ? Math.round(totalStepsPercentage / stepsCount) : 0;
          totalRoadmapPercentage += roadmapPercentage;
        }
      });

      if (publishedRoadmapsCount > 0) {
        pathProgress = Math.round(totalRoadmapPercentage / publishedRoadmapsCount);
      }
    }

    const formattedEnrollments = (learningPath.enrollments || []).map(e => ({
      ...e,
      // Only set progress if it's the current user's enrollment
      ...(e.userId === Number(req.user.id) ? { progress: pathProgress } : {})
    }));

    learningPath.enrollments = formattedEnrollments;
    learningPath.currentUserProgress = pathProgress;

    // Clean up
    learningPath.roadmaps.forEach(r => {
      if (r.roadmap) delete r.roadmap.steps;
    });

    res.json({ success: true, data: learningPath });
  } catch (error) {
    next(error);
  }
};


const getSingleLearningPathByTitle = async (req, res, next) => {
  try {
    const { title } = req.params;
    const normalizedTitle = title.toLowerCase();
    
    let whereCondition = { title: normalizedTitle, isPublished: true };
    let fuzzyWhereCondition = { isPublished: true };

    // نحاول الأول نجيب match مباشر
    let learningPath = await prisma.learningPath.findFirst({
      where: whereCondition,
      include: {
        roadmaps: {
          where: { roadmap: { isPublished: true } },
          orderBy: { order: "asc" },
          include: {
            roadmap: {
              select: {
                id: true,
                title: true,
                description: true,
                isPublished: true,
                createdAt: true,
              },
            },
          },
        },
        createdBy: true,
      },
    });

    // لو ملقيناش match مباشر نعمل fuzzy search
    if (!learningPath) {
      const allPaths = await prisma.learningPath.findMany({
        where: fuzzyWhereCondition,
        select: { id: true, title: true },
      });

      let bestMatch = null;
      let highestScore = 0;

      for (const path of allPaths) {
        const score = stringSimilarity.compareTwoStrings(
          normalizedTitle,
          path.title.toLowerCase()
        );

        if (score > highestScore) {
          highestScore = score;
          bestMatch = path;
        }
      }

      // لو نسبة التشابه كويسة
      if (highestScore > 0.3) {
        learningPath = await prisma.learningPath.findFirst({
          where: { id: bestMatch.id },
          include: {
            roadmaps: {
              where: { roadmap: { isPublished: true } },
              orderBy: { order: "asc" },
              include: {
                roadmap: {
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    isPublished: true,
                    createdAt: true,
                  },
                },
              },
            },
            createdBy: true,
          },
        });
      }
    }

    res.json({ success: true, data: learningPath });

  } catch (error) {
    return next(errorHandler(error, 500));
  }
};

// ==========================
// Update Learning Path + Roadmaps
// ==========================
const updateLearningPath = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, jobs, projects, estimatedDuration } = req.body;

  try {
    const existing = await prisma.learningPath.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return next(errorHandler("Learning Path not found", 404));
    }

    let newImagePath = existing.image;

    // لو فيه صورة جديدة
    if (req.file) {
      // حذف الصورة القديمة
      if (existing.image) {
        const oldPath = path.join(__dirname, "..", existing.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      newImagePath = `/uploads/learning-path/${req.file.filename}`;
    }

    const updated = await prisma.learningPath.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        estimatedDuration: Number(estimatedDuration),
        image: newImagePath,
      },
    });

    res.json({
      success: true,
      message: "Learning Path updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
const deleteLearningPath = async (req, res, next) => {
  const { id } = req.params;

  try {
    const existing = await prisma.learningPath.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return next(errorHandler("Learning Path not found", 404));
    }

    await prisma.$transaction(async (tx) => {
      await tx.learningPathRoadmap.deleteMany({
        where: { learningPathId: Number(id) },
      });

      await tx.learningPath.delete({
        where: { id: Number(id) },
      });
    });

    // حذف الصورة من السيرفر
    if (existing.image) {
      const imagePath = path.join(__dirname, "..", existing.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({
      success: true,
      message: "Learning Path deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================
// Toggle Publish
// ==========================
const toggleLearningPathPublish = async (req, res, next) => {
  const { id } = req.params;

  try {
    const learningPath = await prisma.learningPath.findUnique({ where: { id: Number(id) } });
    if (!learningPath) return next(errorHandler("Learning Path not found", 404));

    const updated = await prisma.learningPath.update({
      where: { id: Number(id) },
      data: { isPublished: !learningPath.isPublished },
    });

    res.json({
      success: true,
      message: `Learning Path ${updated.isPublished ? "Published" : "Unpublished"} successfully`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
const assignAdminsToLearningPath = async (req, res, next) => {
  try {
    const learningPathId = Number(req.params.learningPathId);
    const { adminIds } = req.body;

    if (!learningPathId) {
      return next(errorHandler("Valid Learning Path ID is required", 400));
    }

    if (!Array.isArray(adminIds)) {
      return next(errorHandler("Admin IDs must be an array", 400));
    }

    await prisma.learningPathAdmin.deleteMany({
      where: { learningPathId },
    });

    if (adminIds.length > 0) {
      await prisma.learningPathAdmin.createMany({
        data: adminIds.map((adminId) => ({
          learningPathId,
          adminId: Number(adminId),
        })),
      });
    }

    return res.status(200).json({
      message: "Admins assigned successfully",
    });
  } catch (err) {
    next(err);
  }
};

const getLearningPathsForAdmin = async (req, res, next) => {
  try {
    const adminId = parseInt(req.user.id);
    const { section } = req.query;
    const role = req.user.role; // ✅ Get role

    if (!adminId || isNaN(adminId)) {
      return next(errorHandler("Valid Admin ID is required", 400));
    }

    let whereCondition = {};
    if (role !== 'SUPER_ADMIN') {
      whereCondition = {
        permissions: {
          some: {
            userId: adminId,
            section: section
          },
        },
      };
    }

    // جلب الليرننج باس اللي مخصصه للادمن ده أو كل حاجة لو سوبر أدمن
    const learningPaths = await prisma.learningPath.findMany({
      where: whereCondition,
      select: {
        id: true,
        title: true,
        isPublished: true,
        assignedAdmins: {
          select: {
            adminId: true,
            assignedAt: true,
          },
        },
        permissions: true,
        _count: {
          select: { jobsList: true }
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: learningPaths,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
const assignAdminsToSection = async (req, res, next) => {
  try {
    const learningPathId = Number(req.params.learningPathId);
    const { section, adminIds } = req.body;
    const sectionUpper = section.toUpperCase();

    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Only SUPER_ADMIN can assign admins" });
    }

    const normalizedAdminIds = Array.isArray(adminIds)
      ? adminIds.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
      : [];

    // 🔥 هات القديم
    const oldPermissions = await prisma.learningPathPermission.findMany({
      where: { learningPathId, section: sectionUpper },
    });
    const oldAdminIds = oldPermissions.map((p) => p.userId);

    // 🔥 diff
    const addedAdmins = normalizedAdminIds.filter((id) => !oldAdminIds.includes(id));
    const removedAdmins = oldAdminIds.filter((id) => !normalizedAdminIds.includes(id));

    // 🔹 delete القديم
    await prisma.learningPathPermission.deleteMany({
      where: { learningPathId, section: sectionUpper },
    });

    // 🔹 create الجديد
    await prisma.learningPathPermission.createMany({
      data: normalizedAdminIds.map((adminId) => ({
        userId: adminId,
        learningPathId,
        section: sectionUpper,
      })),
      skipDuplicates: true,
    });

    // ✅ ارجع الـ LearningPath مع permissions
    const updatedLearningPath = await prisma.learningPath.findUnique({
      where: { id: learningPathId },
      include: {
        permissions: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        roadmaps: true,
        createdBy: true,
      },
    });

    // ✅ حوّل permissions لـ assignedAdmins format
    const formattedLearningPath = {
      ...updatedLearningPath,
      assignedAdmins: updatedLearningPath.permissions
        .filter((p) => p.section === sectionUpper)
        .map((p) => ({
          adminId: p.userId,
          admin: p.user,
        })),
    };

    // 🔔 Notifications
    const io = req.app.get("io");
    const sendNotification = async (userIds, message, metadata) => {
      for (const userId of [...new Set(userIds)]) {
        const notification = await prisma.notification.create({
          data: { userId, message, type: "SYSTEM", metadata },
        });
        io?.to(`user_${userId}`).emit("new_notification", notification);
      }
    };

    const lp = await prisma.learningPath.findUnique({
      where: { id: learningPathId },
      select: { title: true },
    });

    if (addedAdmins.length > 0) {
      await sendNotification(
        addedAdmins,
        `🎯 Assigned to ${sectionUpper} in "${lp?.title}"`,
        { type: "ASSIGN_SECTION", section: sectionUpper, learningPathId }
      );
    }

    if (removedAdmins.length > 0) {
      await sendNotification(
        removedAdmins,
        `❌ Removed from ${sectionUpper} in "${lp?.title}"`,
        { type: "REMOVE_SECTION", section: sectionUpper, learningPathId }
      );
    }

    res.json({
      success: true,
      message: "Admins assigned successfully",
      data: formattedLearningPath,
      addedAdmins,
      removedAdmins,
    });

  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};
// recommend ai for learning path 



async function recommendLearningPath(req, res, next) {
  try {
    const { experience, skills, interest, hours_per_day, target_goal, answers_map } = req.body;
    const userId = Number(req.user.id);
    const safeSkills = Array.isArray(skills) ? skills : [];
    const safeHours = Number(hours_per_day) || 0;

    // 1️⃣ اطلب recommendation من الـ AI
    const flaskData = await getRecommendedPath({
      experience: experience || '',
      skills: safeSkills,
      interest: interest || '',
      hours_per_day: safeHours,
      answers_map: answers_map || {}
    });

    const aiPath = flaskData.recommended_path;

    // 2️⃣ هات كل الـ paths المنشورة
    const paths = await prisma.learningPath.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true
      }
    });
    console.log('paths in recommendLearningPath', paths);

    let matchedPath = null;

    if (paths.length) {
      const titles = paths.map(p => p.title);

      const match = stringSimilarity.findBestMatch(aiPath, titles);

      const bestMatch = match.bestMatch;

      // threshold للتأكد أن التشابه مقبول
      if (bestMatch.rating > 0.3) {
        matchedPath = paths.find(p => p.title === bestMatch.target);
      }
    }
    if (!matchedPath) {
      matchedPath = paths.find(p =>
        p.title.toLowerCase().includes(aiPath.toLowerCase()) ||
        aiPath.toLowerCase().includes(p.title.toLowerCase())
      );
    }
    console.log("AI path:", aiPath);
    console.log("Matched path:", matchedPath);

    // 3️⃣ حفظ recommendation
    const saved = await prisma.learningPathRecommendation.create({
      data: {
        experience: experience || 'Beginner',
        skills: safeSkills,
        interest: interest || '',
        hoursPerDay: safeHours,
        targetGoal: target_goal ?? null,

        recommendedPath: aiPath,
        confidence: (() => {
          const conf = flaskData.top_paths?.[0]?.confidence;
          if (conf === "HIGH") return 0.95;
          if (conf === "MEDIUM") return 0.75;
          if (conf === "LOW") return 0.50;
          const parsed = parseFloat(conf);
          return isNaN(parsed) ? null : parsed;
        })(),
        topPaths: flaskData.top_paths ?? [],

        userId,
        learningPathId: matchedPath?.id ?? null
      }
    });

    return res.status(200).json({
      success: true,
      message: "Learning Path recommended successfully",
      recommended_path: aiPath,
      top_paths: flaskData.top_paths ?? [],
      saved_id: saved.id,
      matched_path: matchedPath ?? null,
      explanation: flaskData.explanation ?? [],
      triggered_rules: flaskData.triggered_rules ?? [],
      user_profile: flaskData.user_profile,
      roadmap: flaskData.roadmap,
      score_breakdown: flaskData.score_breakdown
    });

  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
}
// controllers/student/learningPath.controller.js

async function getMyRecommendations(req, res, next) {
  try {
    const userId = parseInt(req.user.id) || req.user.id;

    let recommendation = await prisma.learningPathRecommendation.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        learningPath: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            estimatedDuration: true,
            isPublished: true,
          }
        }
      }
    });

    if (!recommendation) {
      return res.status(200).json({
        success: true,
        message: "No recommendations yet",
        data: null
      });
    }

    if (!recommendation.learningPath && recommendation.topPaths?.length) {
      const possiblePaths = recommendation.topPaths.map(p => p.name || p.path).filter(Boolean);

      // جيب كل الـ published paths وعمل الـ matching في JavaScript
      // عشان SQLite مش بيدعم mode: 'insensitive' في Prisma
      const allPaths = await prisma.learningPath.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
          estimatedDuration: true,
          isPublished: true
        }
      });

      const matchedPath = allPaths.find(p =>
        possiblePaths.some(possible =>
          p.title.toLowerCase().includes(possible.toLowerCase()) ||
          possible.toLowerCase().includes(p.title.toLowerCase())
        )
      );

      if (matchedPath) {
        recommendation.learningPath = matchedPath;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Recommendations fetched successfully",
      data: recommendation
    });

  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
}
   

module.exports = {
  addLearningPath,
  getAllLearningPaths,
  getAllLearningPathsSuperAdmin,
  getSingleLearningPath,
  updateLearningPath,
  deleteLearningPath,
  toggleLearningPathPublish,
  getSingleLearningPathByTitle,
  assignAdminsToLearningPath,
  getLearningPathsForAdmin,
  assignAdminsToSection,
  recommendLearningPath,
  getMyRecommendations
};