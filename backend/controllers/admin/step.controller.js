// controllers/stepController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper: إرسال notification للـ SUPER_ADMIN
const notifySuperAdmins = async (message, metadata = {}) => {
  const superAdmins = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN" },
    select: { id: true },
  });

  if (superAdmins.length === 0) return;

  await prisma.notification.createMany({
    data: superAdmins.map((sa) => ({
      userId: sa.id,
      message,
      type: "SYSTEM",
      metadata,
    })),
  });

  return superAdmins.map((sa) => sa.id);
};

const addStepToRoadmap = async (req, res) => {
  const { title, description, roadmapId } = req.body;
  const admin = req.user;

  try {
    if (!title || !description || !roadmapId) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // ✅ هات آخر order
    const lastStep = await prisma.step.findFirst({
      where: { roadmapId: Number(roadmapId) },
      orderBy: { order: "desc" },
    });

    const newOrder = lastStep ? lastStep.order + 1 : 1;

    // ✅ create step
    const step = await prisma.step.create({
      data: {
        title,
        description,
        order: newOrder,
        roadmapId: Number(roadmapId),
      },
    });
    // ── جيب اسم الـ roadmap ──────────────────────────
   const roadmap = await prisma.roadmap.findUnique({
  where: { id: Number(roadmapId) },
  include: {
    learningPaths: {
      select: { id: true }
    }
  }
});
console.log(`Roadmap fetched for notification:`, roadmap?.learningPaths);

    // ── جيب كل الـ SUPER_ADMINs ──────────────────────
    const superAdmins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN" },
      select: { id: true },
    });

    if (superAdmins.length > 0) {
      const io = req.app.get("io");

      for (const sa of superAdmins) {
        // ✅ save في DB
        const notification = await prisma.notification.create({
          data: {
            userId: sa.id,
            message: `📌 Admin "${admin.name}" added a new step "${title}" to roadmap "${roadmap?.title}"`,
            type: "SYSTEM",
            metadata: {
              type: "NEW_STEP",
              stepId: step.id,
              stepTitle: title,
              roadmapId: Number(roadmapId),
              roadmapTitle: roadmap?.title,
              adminId: admin.id,
              adminName: admin.name,
              learningPathId: roadmap?.learningPaths?.[0]?.id || null,
            },
          },
        });
        // console.log(`Notification created for SUPER_ADMIN ${sa.id}:`, notification);
        // ✅ emit real-time بنفس الـ pattern
        io?.to(`user_${sa.id}`).emit("new_notification", {
          id: notification.id,
          message: notification.message,
          type: notification.type,
          metadata: notification.metadata,
          createdAt: notification.createdAt,
        });
      }
    }

    res.json({ success: true, message: "Step added successfully", data: step });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

const getStepsByRoadmap = async (req, res) => {
  try {
    const { roadmapId } = req.params;

    const steps = await prisma.step.findMany({
      where: { roadmapId: Number(roadmapId) },
      orderBy: { order: "asc" },
      include: {
        lessons: {
          select: { video: true, article: true, quiz: true },
        },
      },
    });

    res.json({ success: true, data: steps, message: "Steps fetched successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

const getSingleStep = async (req, res) => {
  try {
    const { id } = req.params;

    const step = await prisma.step.findUnique({
      where: { id: Number(id) },
      include: { lessons: true, roadmap: true },
    });

    if (!step) return res.status(404).json({ success: false, message: "Step not found" });

    res.json({ success: true, data: step });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

const updateStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;

    const existingStep = await prisma.step.findUnique({ where: { id: Number(id) } });
    if (!existingStep) return res.status(404).json({ success: false, message: "Step not found" });

    const updatedStep = await prisma.step.update({
      where: { id: Number(id) },
      data: {
        title: title ?? existingStep.title,
        description: description ?? existingStep.description,
        order: order ?? existingStep.order,
      },
    });

    res.json({ success: true, message: "Step updated successfully", data: updatedStep });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

const deleteStep = async (req, res) => {
  try {
    const { id } = req.params;

    const existingStep = await prisma.step.findUnique({ where: { id: Number(id) } });
    if (!existingStep) return res.status(404).json({ success: false, message: "Step not found" });

    await prisma.step.delete({ where: { id: Number(id) } });

    res.json({ success: true, message: "Step deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

module.exports = { addStepToRoadmap, getStepsByRoadmap, getSingleStep, updateStep, deleteStep };