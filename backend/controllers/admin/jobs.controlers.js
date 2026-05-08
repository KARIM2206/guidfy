const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const errorHandler = require("../../utils/errorHandler");
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
// 🟢 Create Job
 const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      company,
      location,
      salary,
      jobType,
      deadline,
      learningPathId,
    } = req.body;
console.log('learningPathId:', learningPathId);


    // تأكد إن الـ LearningPath موجود
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
        learningPathId:parseInt(learningPathId),
        createdById: req.user.id,
      },
    });
   const superAdmins = await prisma.user.findMany({
        where:  { role: "SUPER_ADMIN" },
        select: { id: true },
      });

      if (superAdmins.length > 0) {
        const io = req.app.get("io");

        for (const sa of superAdmins) {
          const notification = await prisma.notification.create({
            data: {
              userId:  sa.id,
              message: `📚 Admin "${req.user.name}" added job "${job.title}" to learning-path "${learningPath?.title}" "`,
              type:    "SYSTEM",
              metadata: {
                type:           "NEW_JOB",
                jobId:         job.id,
                jobTitle:      job.title,
                
              
                learningPathId:parseInt(learningPathId) || learningPathId,
                adminId:        req.user.id,
                adminName:      req.user.name,
              },
            },
          });

          io?.to(`user_${sa.id}`).emit("new_notification", {
            id:        notification.id,
            message:   notification.message,
            type:      notification.type,
            metadata:  notification.metadata,
            createdAt: notification.createdAt,
          });
        }
      }
    res.status(201).json({
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      company,
      location,
      salary,
      jobType,
      deadline,
      learningPathId,
    } = req.body;

    const job = await prisma.job.findUnique({
      where: { id: Number(id) },
      include: { learningPath: true },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (req.user.role !== "SUPER_ADMIN" && job.createdById !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

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
        learningPathId,
      },
      include: { learningPath: true },
    });

    // 🔔 Notification
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
      message: "Job updated successfully",
      updatedJob,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: Number(id) },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (req.user.role !== "SUPER_ADMIN" && job.createdById !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await prisma.job.delete({
      where: { id: Number(id) },
    });

    const ioUsers = [];

    // 🔥 لو ADMIN حذف → نبعت للسوبر أدمنز
    if (req.user.role === "ADMIN") {
      const superAdmins = await prisma.user.findMany({
        where: { role: "SUPER_ADMIN" },
        select: { id: true },
      });

      ioUsers.push(...superAdmins.map(sa => sa.id));
    }

    // 🔥 لو SUPER_ADMIN حذف → نبعت للأدمن صاحب الجوب
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
      message: "Job deleted successfully",
      success: true,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
 const getSingleJob = async (req, res,next) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: Number(id) },
    });

    if (!job) {
      return next(errorHandler("Job not found", 404));
    }

    res.json({
      message: "Job fetched successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

 const getAllJobsToCreatedByAdmin = async (req, res,next) => {
  try {
    const userId = req.user.id;
    const jobs = await prisma.job.findMany(
      {
        where: {
          createdById: userId,
        },
        include: {
          learningPath: true,
        },
      }
    );

    res.json({
      message: "Jobs fetched successfully",
      jobs,
    });
  } catch (error) {
   return next(errorHandler( error.message, 500 ));// res.status(500).json({ error: error.message );
  }
};
const getAlljobs=async(req,res,next)=>{
  try {
    const jobs = await prisma.job.findMany();
    res.json({
      message: "Jobs fetched successfully",
      jobs,
    });
  } catch (error) {
   return next(errorHandler( error.message, 500 ));// res.status(500).json({ error: error.message );
  }
}
const getAlljobsToStudentByLearningPathTitle=async(req,res,next)=>{
  try {
    const { learningPathTitle } = req.params;
    const jobs = await prisma.job.findMany(
      {
        where: {
          learningPath: {
            title: learningPathTitle,
          },
        },
        include: {
          learningPath: true,
        },
      }
    );
    res.json({
      message: "Jobs fetched successfully",
      jobs,
    });
  } catch (error) {
   return next(errorHandler( error.message, 500 ));// res.status(500).json({ error: error.message );
  }
}
const changeStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // ❌ بس SUPER_ADMIN & admin
    if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN") {
      return next(errorHandler("Only Super Admin and admin can change status", 403));
    }

    const job = await prisma.job.findUnique({
      where: { id: Number(id) },
      include: {
        learningPath: {
          include: {
            enrollments: true, // students
            assignedAdmins: true, // admins مسندين للـ learning path
          },
        },
        createdBy: true, // الادمن اللي عمل الجوب
      },
    });

    if (!job) {
      return next(errorHandler("Job not found", 404));
    }

    const updatedJob = await prisma.job.update({
      where: { id: Number(id) },
      data: { status },
    });

    // 🔥 جمع كل اليوزرز + الأدمنز
    const studentIds = job.learningPath.enrollments.map(e => e.userId);
    const learningPathAdminIds = job.learningPath.assignedAdmins.map(a => a.adminId);
    
    // إضافة الادمن اللي عمل الجوب إذا كان مختلف
    const allAdminIds = [job.createdById, ...learningPathAdminIds];
    const uniqueAdminIds = [...new Set(allAdminIds)];
    
    const allUsers = [...new Set([...studentIds, ...uniqueAdminIds])];

    console.log('Job ID:', job.id, 'Learning Path ID:', job.learningPathId);
    console.log('Students:', studentIds);
    console.log('Learning Path Admins:', learningPathAdminIds);
    console.log('Job Creator (Admin):', job.createdById);
    console.log('All users to notify:', allUsers);

    // 🔔 Notification
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
      message: "Job status updated successfully",
      data: updatedJob,
    });

  } catch (error) {
    return next(errorHandler(error.message, 500));
  }
};
module.exports = {
  createJob,
  updateJob,
  deleteJob,
  getSingleJob,
  getAllJobsToCreatedByAdmin,
  getAlljobs,
  changeStatus,
  getAlljobsToStudentByLearningPathTitle
};