// roadmapController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ==========================
// Helper: check SUPER_ADMIN
// ==========================
const checkSuperAdmin = (user) => {
  if (user.role !== "SUPER_ADMIN") {
    const err = new Error("Forbidden: Only SUPER_ADMIN can perform this action");
    err.status = 403;
    throw err;
  }
};

// ==========================
// Create Roadmap with Assignment
// ==========================
// ==========================
// Create Roadmap with Assignment & Order Handling
// ==========================
const addRoadmap = async (req, res) => {
  const { title, description, category, level, estimatedDuration, learningPathId, assignedAdminIds, order } = req.body;
  const currentUser = req.user;

  try {
    checkSuperAdmin(currentUser);

    // تحقق من صحة Admins
    if (assignedAdminIds && assignedAdminIds.length > 0) {
      const admins = await prisma.user.findMany({
        where: { id: { in: assignedAdminIds.map(Number) } },
        select: { id: true, role: true },
      });
      if (admins.length !== assignedAdminIds.length || admins.some(a => a.role !== "ADMIN")) {
        return res.status(400).json({ success: false, message: "All assignedAdminIds must be valid ADMIN users" });
      }
    }

    const slug = title.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const roadmap = await prisma.$transaction(async (tx) => {
      const status = assignedAdminIds && assignedAdminIds.length > 0 ? "ASSIGNED" : "DRAFT";

      // إنشاء Roadmap أولاً
      const roadmapCreated = await tx.roadmap.create({
        data: {
          title,
          slug,
          description,
          category: category ? category.toUpperCase() : undefined,
          level: level ? level.toUpperCase() : undefined,
          estimatedDuration: parseInt(estimatedDuration) || 0,
          status,
          createdById: currentUser.id,
        },
      });

      // التعامل مع LearningPath و Order
      if (learningPathId) {
        let nextOrder = order;
        if (nextOrder == null) {
          // لو مفيش order محدد: last + 1
          const last = await tx.learningPathRoadmap.findFirst({
            where: { learningPathId: Number(learningPathId) },
            orderBy: { order: "desc" },
          });
          nextOrder = last ? last.order + 1 : 0;
        } else {
          // لو فيه order محدد: shift أي roadmap >= order
          await tx.learningPathRoadmap.updateMany({
            where: {
              learningPathId: Number(learningPathId),
              order: { gte: nextOrder },
            },
            data: { order: { increment: 1 } },
          });
        }

        // ربط roadmap بالlearning path بالترتيب
        await tx.learningPathRoadmap.create({
          data: {
            learningPathId: Number(learningPathId),
            roadmapId: roadmapCreated.id,
            order: nextOrder,
          },
        });
      }

      // إنشاء assignments
      if (assignedAdminIds && assignedAdminIds.length > 0) {
        const assignments = assignedAdminIds.map(adminId => ({
          roadmapId: roadmapCreated.id,
          adminId: Number(adminId),
        }));
        await tx.roadmapAssignment.createMany({ data: assignments, skipDuplicates: true });
      }

      return roadmapCreated;
    });

    res.status(201).json({ success: true, message: "Roadmap created successfully", data: roadmap });
  } catch (error) {
    console.error("Error creating roadmap:", error);
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message || "Failed to create roadmap" });
  }
};

// ==========================
// Update Roadmap Order
// ==========================
const updateRoadmap = async (req, res) => {
  const { id } = req.params;
  const { title, description, category, level, estimatedDuration, assignedAdminIds, learningPathId, order } = req.body;
  const currentUser = req.user;

  try {
    checkSuperAdmin(currentUser);

    const existing = await prisma.roadmap.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ success: false, message: "Roadmap not found" });

    const updatedRoadmap = await prisma.$transaction(async (tx) => {
      // تحديث roadmap الأساسي
      const roadmapUpdated = await tx.roadmap.update({
        where: { id: Number(id) },
        data: {
          title,
          description,
          category,
          level,
          estimatedDuration: parseInt(estimatedDuration) || 0,
          status: assignedAdminIds && assignedAdminIds.length > 0 ? "ASSIGNED" : "DRAFT",
        },
      });

      // تحديث assignments
      if (assignedAdminIds) {
        await tx.roadmapAssignment.deleteMany({ where: { roadmapId: Number(id) } });
        if (assignedAdminIds.length > 0) {
          const assignments = assignedAdminIds.map(adminId => ({ roadmapId: Number(id), adminId }));
          await tx.roadmapAssignment.createMany({ data: assignments, skipDuplicates: true });
        }
      }

      // تحديث LearningPath order
      if (learningPathId != null && order != null) {
        // shift أي roadmap >= order
        await tx.learningPathRoadmap.updateMany({
          where: {
            learningPathId: Number(learningPathId),
            order: { gte: order },
            roadmapId: { not: Number(id) }, // استثناء roadmap نفسه
          },
          data: { order: { increment: 1 } },
        });

        // upsert الربط
        await tx.learningPathRoadmap.upsert({
          where: {
            learningPathId_roadmapId: { learningPathId: Number(learningPathId), roadmapId: Number(id) },
          },
          update: { order },
          create: {
            learningPathId: Number(learningPathId),
            roadmapId: Number(id),
            order,
          },
        });
      }

      return roadmapUpdated;
    });

    res.json({ success: true, message: "Roadmap updated successfully", data: updatedRoadmap });
  } catch (error) {
    console.error("Error updating roadmap:", error);
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message || "Failed to update roadmap" });
  }
};

// ==========================
// Get All Roadmaps
// ==========================
const getAllRoadmaps = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", level, category,learningPathId } = req.query;
    const skip = (page - 1) * limit;

    const filters = {};
    if (search) filters.title = { contains: search };
    if (level) filters.level = level;
    if (category) filters.category = category;
    if (learningPathId) filters.learningPaths = { some: { learningPathId: Number(learningPathId) } };

    const [roadmaps, total] = await Promise.all([
      prisma.roadmap.findMany({
        where: filters,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          steps: { include: { lessons: true } },
          createdBy: true,
          enrollments: true,
          learningPaths: true,
          roadmapProgress: true,
          assignments: { include: { admin: true } },
        },
      }),
      prisma.roadmap.count({ where: filters }),
    ]);

    res.status(200).json({
      success: true,
      data: roadmaps,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    res.status(500).json({ success: false, message: "Failed to fetch roadmaps", details: error.message });
  }
};

// ==========================
// Get Single Roadmap
// ==========================
const getSingleRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: Number(id) },
      include: {
        steps: { include: { lessons: true } },
        createdBy: true,
        enrollments: true,
        assignments: { include: { admin: true } },
        learningPaths: true,
      },
    });

    if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found" });

    res.json({ success: true, data: roadmap });
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    res.status(500).json({ success: false, message: "Failed to fetch roadmap هى ل", details: error.message });
  }
};
const getMyAssignedRoadmaps = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, level, search } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const userId = req.user.id;
const user = await prisma.user.findUnique({
  where: { id: userId }
});

const role = user.role;

    // Base filters based on role
    let where = {};
    console.log(role,'role in getMyAssignedRoadmaps');
    if (role == "ADMIN") {
      where.assignments = { some: { adminId: userId } };
    } else if (role === "STUDENT") {
      where.isPublished = true;
    }
console.log(where,'where in getMyAssignedRoadmaps');

    // Optional filters
    if (category) {
      where.category = category;
    }
    if (level) {
      where.level = level;
    }
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const [roadmaps, total] = await Promise.all([
      prisma.roadmap.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: "desc" },
        include: {
          assignments: {
            include: {
              admin: true, // تفاصيل Admin لكل Assignment
            },
          },
          learningPaths: {
            include: { learningPath: true },
          },
        },
      }),
      prisma.roadmap.count({ where }),
    ]);
console.log(roadmaps,'roadmaps  in getMyAssignedRoadmaps');

    res.json({
      success: true,
      data: roadmaps,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching assigned roadmaps:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned roadmaps",
      details: error.message,
    });
  }
};

// ==========================
// Update Roadmap + Assignments
// ==========================


// ==========================
// Delete Roadmap + Cascade
// ==========================
const deleteRoadmap = async (req, res) => {
  try {
    const roadmapId = Number(req.params.id);

    await prisma.$transaction(async (tx) => {
      // احذف كل الدروس المرتبطة بالخطوات
      await tx.lesson.deleteMany({
        where: { step: { roadmapId } },
      });

      // احذف كل الخطوات المرتبطة بالRoadmap
      await tx.step.deleteMany({ where: { roadmapId } });

      // الحصول على جميع LearningPathRoadmap المرتبطة بهذا Roadmap
      const linkedLearningPaths = await tx.learningPathRoadmap.findMany({
        where: { roadmapId },
        select: { id: true, learningPathId: true, order: true },
      });

      // حذف Roadmap من كل LearningPath
      await tx.learningPathRoadmap.deleteMany({
        where: { roadmapId },
      });

      // إعادة ترتيب Roadmaps في كل LearningPath
      const groupedByLP = linkedLearningPaths.reduce((acc, item) => {
        if (!acc[item.learningPathId]) acc[item.learningPathId] = [];
        acc[item.learningPathId].push(item);
        return acc;
      }, {});

      for (const lpId in groupedByLP) {
        // ترتيب الباقيين بناءً على order القديم بدون Roadmap المحذوف
        const remaining = groupedByLP[lpId]
          .filter((r) => r.id !== roadmapId)
          .sort((a, b) => a.order - b.order);

        // تحديث orders بشكل متسلسل من 1
        for (let i = 0; i < remaining.length; i++) {
          await tx.learningPathRoadmap.update({
            where: { id: remaining[i].id },
            data: { order: i + 1 },
          });
        }
      }

      // حذف Roadmap نفسه
      await tx.roadmap.delete({ where: { id: roadmapId } });
    });

    res.json({ success: true, message: "Roadmap deleted successfully and LearningPath orders updated" });
  } catch (error) {
    console.error("Error deleting roadmap:", error);
    res.status(500).json({ success: false, message: "Failed to delete roadmap", details: error.message });
  }
};

// ==========================
// Toggle Publish Status
// ==========================
const toggleRoadmapPublish = async (req, res) => {
  const { id } = req.params;
  try {
    const roadmap = await prisma.roadmap.findUnique({ where: { id: Number(id) } });
    if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found" });

    const updated = await prisma.roadmap.update({
      where: { id: Number(id) },
      data: { isPublished: !roadmap.isPublished },
      include: { createdBy: true },
    });

    res.json({
      success: true,
      message: `Roadmap ${updated.isPublished ? "Published" : "Unpublished"} successfully`,
      data: updated,
    });
  } catch (error) {
    console.error("Error toggling publish:", error);
    res.status(500).json({ success: false, message: "Failed to toggle publish status" });
  }
};

module.exports = {
  addRoadmap,
  getAllRoadmaps,
  getSingleRoadmap,
  updateRoadmap,
  deleteRoadmap,
  toggleRoadmapPublish,
    getMyAssignedRoadmaps,

};