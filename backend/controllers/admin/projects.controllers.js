const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const errorHandler = require("../../utils/errorHandler");
const sendNotification = async (req, userIds, data) => {
  const io = req.app.get("io");

  const uniqueUserIds = [...new Set(userIds)];

  for (const userId of uniqueUserIds) {
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
// 🟢 Create Project
const createProject = async (req, res) => {
  try {
    const { title, description, technologies, githubUrl, isFeatured, learningPathId } = req.body;

    const learningPath = await prisma.learningPath.findUnique({
      where: { id: parseInt(learningPathId) },
    });

    if (!learningPath) {
      return res.status(404).json({ message: "Learning Path not found" });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/projects/${req.file.filename}`;
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        image: imageUrl,
        technologies: Array.isArray(technologies)
          ? technologies
          : technologies.split(",").map((t) => t.trim()),
        githubUrl,
        isFeatured: isFeatured === "true" || isFeatured === true,
        learningPathId: parseInt(learningPathId),
        createdById: req.user.id,
      },
    });

    // 🔔 notify SUPER_ADMIN
    const superAdmins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN" },
      select: { id: true },
    });

    await sendNotification(
      req,
      superAdmins.map(sa => sa.id),
      {
        message: `📁 Admin "${req.user.name}" added project "${project.title}"`,
        metadata: {
          type: "NEW_PROJECT",
          projectId: project.id,
          projectTitle: project.title,
        },
      }
    );

    res.status(201).json({
      message: "Project created successfully",
      project,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🟡 Update Project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, technologies, githubUrl, isFeatured, learningPathId } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (req.user.role !== "SUPER_ADMIN" && project.createdById !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    let imageUrl = project.image;
    if (req.file) {
      imageUrl = `/uploads/projects/${req.file.filename}`;
    }

    const updatedProject = await prisma.project.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        image: imageUrl,
        technologies: Array.isArray(technologies)
          ? technologies
          : technologies.split(",").map((t) => t.trim()),
        githubUrl,
        isFeatured: isFeatured === "true" || isFeatured === true,
        learningPathId: learningPathId ? parseInt(learningPathId) : undefined,
      },
    });

    // 🔔 notify SUPER_ADMIN
    const superAdmins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN" },
      select: { id: true },
    });

    await sendNotification(
      req,
      superAdmins.map(sa => sa.id),
      {
        message: `✏️ Admin "${req.user.name}" updated project "${updatedProject.title}"`,
        metadata: {
          type: "UPDATE_PROJECT",
          projectId: updatedProject.id,
        },
      }
    );

    res.json({
      message: "Project updated successfully",
      updatedProject,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔴 Delete Project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
    });

    if (!project) return res.status(404).json({ message: "Project not found" });

    if (req.user.role !== "SUPER_ADMIN" && project.createdById !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await prisma.project.delete({ where: { id: Number(id) } });

    let notifyUsers = [];

    if (req.user.role === "ADMIN") {
      const superAdmins = await prisma.user.findMany({
        where: { role: "SUPER_ADMIN" },
        select: { id: true },
      });
      notifyUsers = superAdmins.map(sa => sa.id);
    }

    if (req.user.role === "SUPER_ADMIN") {
      notifyUsers = [project.createdById];
    }

    await sendNotification(req, notifyUsers, {
      message: `🗑️ ${req.user.role} "${req.user.name}" deleted project "${project.title}"`,
      metadata: {
        type: "DELETE_PROJECT",
        projectId: project.id,
      },
    });

    res.json({ message: "Project deleted successfully", success: true });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📦 Get single Project
const getSingleProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
      include: { learningPath: true },
    });

    if (!project) return next(errorHandler("Project not found", 404));

    res.json({ message: "Project fetched successfully", project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📃 Get all Projects created by Admin
const getAllProjectsByAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projects = await prisma.project.findMany({
      where: { createdById: userId },
      include: { learningPath: true },
    });
console.log(projects);

    res.json({ message: "Projects fetched successfully", projects });
  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};

// 📃 Get all Projects
const getAllProjects = async (req, res, next) => {
  const { title } = req.query;

  try {
    let where = {};

    // ✅ تحقق إن title موجود فعلاً
    if (title && title !== "undefined") {
      where.learningPath = {
        is: {
          title: {
            contains: title, // ❌ شيل mode
          },
        },
      };
    }

    // 🔒 student يشوف بس published
    if (req.user.role === "STUDENT") {
      where.status = "PUBLISHED";
    }

    const projects = await prisma.project.findMany({
      where,
      include: { learningPath: true },
    });

    res.json({
      message: "Projects fetched successfully",
      projects,
    });

  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};
const changeProjectStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Only SUPER_ADMIN can change status" });
    }

    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
      include: {
        learningPath: {
          include: {
            enrollments: true,
            assignedAdmins: true,
          },
        },
      },
    });

    if (!project) {
      return next(errorHandler("Project not found", 404));
    }

    const updatedProject = await prisma.project.update({
      where: { id: Number(id) },
      data: { status },
    });

    const studentIds = project.learningPath.enrollments.map(e => e.userId);
    const adminIds = project.learningPath.assignedAdmins.map(a => a.adminId);

    const allUsers = [...studentIds, ...adminIds];

    await sendNotification(req, allUsers, {
      message: `🚀 Project "${project.title}" status changed to "${status}"`,
      metadata: {
        type: "CHANGE_PROJECT_STATUS",
        projectId: project.id,
        status,
      },
    });

    res.json({
      message: "Project status updated successfully",
      project: updatedProject,
      success: true,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const assignAdminsToProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminIds } = req.body;

    // 🔒 فقط Super Admin
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Only SUPER_ADMIN can assign admins" });
    }

    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
      include: {
        assignments: true, // 🔥 مهم جدًا
      },
    });

    if (!project) {
      return next(errorHandler("Project not found", 404));
    }

    // 🔥 الأدمنز الحاليين
    const oldAdmins = project.assignments.map(a => a.adminId);
console.log('oldAdmins \n', oldAdmins);

    // 🔥 حساب الفرق
    const addedAdmins = adminIds.filter(id => !oldAdmins.includes(id));
    const removedAdmins = oldAdmins.filter(id => !adminIds.includes(id));

    // 🔥 remove old
    if (removedAdmins.length > 0) {
      await prisma.projectAssignment.deleteMany({
        where: {
          projectId: Number(id),
          adminId: { in: removedAdmins },
        },
      });
    }

    // 🔥 add new
    if (addedAdmins.length > 0) {
      await prisma.projectAssignment.createMany({
        data: addedAdmins.map(adminId => ({
          projectId: Number(id),
          adminId,
        })),
        skipDuplicates: true,
      });
    }

    // 🔔 Notification function
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

    // ✅ notify added admins
    if (addedAdmins.length > 0) {
      await sendNotification(
        addedAdmins,
        `🎯 You have been assigned to project "${project.title}"`,
        {
          type: "ASSIGN_PROJECT",
          projectId: project.id,
          projectTitle: project.title,
        }
      );
    }

    // ❌ notify removed admins
    if (removedAdmins.length > 0) {
      await sendNotification(
        removedAdmins,
        `❌ You have been removed from project "${project.title}"`,
        {
          type: "REMOVE_PROJECT",
          projectId: project.id,
        }
      );
    }

    res.json({
      message: "Admins assigned successfully",
      success: true,
    });

  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};
module.exports = {
  createProject,
  updateProject,
  deleteProject,
  getSingleProject,
  getAllProjectsByAdmin,
  getAllProjects,
  changeProjectStatus,
  assignAdminsToProject
};