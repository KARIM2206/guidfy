// learningPathController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
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

const addLearningPath = async (req, res, next) => {
  const { title, description, jobs, projects, estimatedDuration } = req.body;
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
        jobs: parseInt(jobs) || 0,
        projects: parseInt(projects) || 0,
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
  const user=await prisma.user.findUnique({where:{id:userId}})
  const role=user.role

  let where={};
  let whereEnrollments={};

  if(role=='STUDENT'){
    where.isPublished=true
    whereEnrollments.userId=userId
  }
  else if(role=='SUPER_ADMIN'){
    whereEnrollments={}
  }
  try {
    const learningPaths = await prisma.learningPath.findMany({
   where,
      include: {
        roadmaps: {
          include: { roadmap: true },
          orderBy: { order: "asc" },
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
          where: whereEnrollments},
        projects: true,
       
      },
     
      
      orderBy: { createdAt: "desc" },
    });
   
    res.json({ success: true, data: learningPaths ,message:"Learning Paths fetched successfully" });
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
          include: { roadmap: true },
          orderBy: { order: "asc" },
        },
        createdBy: true,
        enrollments:{
          where
        }
      },
    });

    if (!learningPath) return next(errorHandler("Learning Path not found", 404));
    res.json({ success: true, data: learningPath });
  } catch (error) {
    next(error);
  }
};


const getSingleLearningPathByTitle = async (req, res, next) => {
  try {
    const { title } = req.params;
    const normalizedTitle = title.toLowerCase();

    // نحاول الأول نجيب match مباشر
    let learningPath = await prisma.learningPath.findFirst({
      where: {
        title: normalizedTitle,
      },
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
      if (highestScore > 0.4) {
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
        jobs: parseInt(jobs) || 0,
        projects: parseInt(projects) || 0,
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
  const adminId=parseInt(req.user.id)
 const {section}=req.query
    if (!adminId || isNaN(adminId)) {
      return next(errorHandler("Valid Admin ID is required", 400));
    }

    // جلب جميع الليرننج باس اللي مخصصه للادمن ده
const learningPaths = await prisma.learningPath.findMany({
  
  where: {
    permissions: {
      some: {
        userId: parseInt(req.user.id),
        section:section
      },

    },
  },
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

    // 🔒 فقط SUPER_ADMIN
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        message: "Only SUPER_ADMIN can assign admins",
      });
    }

    // 🔥 هات القديم
    const oldPermissions = await prisma.learningPathPermission.findMany({
      where: {
        learningPathId,
        section: sectionUpper,
      },
    });

    const oldAdminIds = oldPermissions.map(p => p.userId);

    // 🔥 diff
    const addedAdmins = adminIds.filter(id => !oldAdminIds.includes(id));
    const removedAdmins = oldAdminIds.filter(id => !adminIds.includes(id));

    // 🔹 delete القديم
    await prisma.learningPathPermission.deleteMany({
      where: {
        learningPathId,
        section: sectionUpper,
      },
    });

    // 🔹 create الجديد
    const permissions = adminIds.map((adminId) => ({
      userId: adminId,
      learningPathId,
      section: sectionUpper,
    }));

    await prisma.learningPathPermission.createMany({
      data: permissions,
      skipDuplicates: true,
    });

    // 🔔 Notification helper
    const sendNotification = async (userIds, message, metadata) => {
      const io = req.app.get("io");

      for (const userId of [...new Set(userIds)]) {
        const notification = await prisma.notification.create({
          data: {
            userId,
            message,
            type: "SYSTEM",
            metadata,
          },
        });

        io?.to(`user_${userId}`).emit("new_notification", notification);
      }
    };

    // 🔥 get learningPath title
    const learningPath = await prisma.learningPath.findUnique({
      where: { id: learningPathId },
      select: { title: true },
    });

    // ✅ notify added
    if (addedAdmins.length > 0) {
      await sendNotification(
        addedAdmins,
        `🎯 You have been assigned to ${sectionUpper} section in "${learningPath?.title}"`,
        {
          type: "ASSIGN_SECTION",
          section: sectionUpper,
          learningPathId,
        }
      );
    }

    // ❌ notify removed
    if (removedAdmins.length > 0) {
      await sendNotification(
        removedAdmins,
        `❌ You have been removed from ${sectionUpper} section in "${learningPath?.title}"`,
        {
          type: "REMOVE_SECTION",
          section: sectionUpper,
          learningPathId,
        }
      );
    }

    res.json({
      message: "Admins assigned successfully",
      success: true,
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
    const { experience, skills, interest, hours_per_day, target_goal } = req.body;
    const userId = req.user.id;

    // 1️⃣ اطلب recommendation من الـ AI
    const flaskData = await getRecommendedPath({
      experience,
      skills,
      interest,
      hours_per_day
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
      if (bestMatch.rating > 0.4) {
        matchedPath = paths.find(p => p.title === bestMatch.target);
      }
    }

    console.log("AI path:", aiPath);
    console.log("Matched path:", matchedPath);

    // 3️⃣ حفظ recommendation
    const saved = await prisma.learningPathRecommendation.create({
      data: {
        experience,
        skills,
        interest,
        hoursPerDay: hours_per_day,
        targetGoal: target_goal ?? null,

        recommendedPath: aiPath,
        confidence: flaskData.top_paths?.[0]?.confidence ?? null,
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
      matched_path: matchedPath ?? null
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

    // لو الـ learningPathId null نحاول نلاقي بديل من topPaths
    if (!recommendation.learningPath && recommendation.topPaths?.length) {

      const possiblePaths = recommendation.topPaths.map(p => p.path);

      const matchedPath = await prisma.learningPath.findFirst({
        where: {
          title: { in: possiblePaths },
          isPublished: true
        },
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
          estimatedDuration: true,
          isPublished: true
        }
      });

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