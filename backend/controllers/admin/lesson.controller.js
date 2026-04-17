const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
const errorHandler = require("../../utils/errorHandler");
// Helper لحذف الفيديو
const deleteVideoFile = (filePath) => {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// ========================
// إضافة Lesson جديد
// ========================
const addLessonToStep = async (req, res, next) => {
  try {
    const {
      title,
      description,
      type,
      content,
      externalLink,
      thumbnail,
      duration,
      timeLimit,
      passingScore,
    } = req.body;

    const { stepId } = req.params;

    if (!title || !type)
      return next(errorHandler("Title and type are required", 400));

    // ── Validate BEFORE transaction ──────────────────────
    if (type === "VIDEO" && !req.file && !externalLink)
      return next(errorHandler("Video file or external URL is required", 400));

    if (type === "ARTICLE" && !content && !externalLink)
      return next(errorHandler("Content or external link is required", 400));

    // ── Order ────────────────────────────────────────────
    const lastLesson = await prisma.lesson.findFirst({
      where: { stepId: Number(stepId) },
      orderBy: { order: "desc" },
    });
    const newOrder = lastLesson ? lastLesson.order + 1 : 1;

    // ── Transaction ──────────────────────────────────────
    const lesson = await prisma.$transaction(async (tx) => {
      const newLesson = await tx.lesson.create({
        data: { title, description, type, order: newOrder, stepId: Number(stepId) },
      });

      if (type === "VIDEO") {
        await tx.videoLesson.create({
          data: {
            lessonId:   newLesson.id,
            videoUrl:   req.file ? `/uploads/lessons/${req.file.filename}` : externalLink,
            provider:   req.file ? "upload" : "external",
            thumbnail:  thumbnail || null,
            duration:   duration  || null,
            isExternal: req.file  ? false : true,
          },
        });
      }

      if (type === "ARTICLE") {
        await tx.articleLesson.create({
          data: {
            lessonId:   newLesson.id,
            content:    content || externalLink,
            title,
            isExternal: content ? false : true,
          },
        });
      }

      if (type === "QUIZ") {
        await tx.quiz.create({
          data: {
            lessonId:     newLesson.id,
            title:        `${title} Quiz`,
            timeLimit:    timeLimit    ? Number(timeLimit)    : null,
            passingScore: passingScore ? Number(passingScore) : null,
          },
        });
      }

      return newLesson;
    });

    // ── Notifications (بعد Transaction تمت بنجاح) ────────
    try {
      const step = await prisma.step.findUnique({
        where: { id: Number(stepId) },
        include: {
          roadmap: {
            select: {
              id:    true,
              title: true,
              learningPaths: {
                select: { learningPathId: true },
                take: 1,
              },
            },
          },
        },
      });

      const learningPathId = step?.roadmap?.learningPaths?.[0]?.learningPathId ?? null;

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
              message: `📚 Admin "${req.user.name}" added lesson "${title}" (${type}) to step "${step?.title}" in "${step?.roadmap?.title}"`,
              type:    "SYSTEM",
              metadata: {
                type:           "NEW_LESSON",
                lessonId:       lesson.id,
                lessonTitle:    title,
                lessonType:     type,
                stepId:         Number(stepId),
                stepTitle:      step?.title,
                roadmapId:      step?.roadmap?.id,
                roadmapTitle:   step?.roadmap?.title,
                learningPathId: learningPathId,
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
    } catch (notifError) {
      // مش هنوقف الـ response لو الـ notification فشلت
      console.error("Notification error (non-fatal):", notifError.message);
    }

    // ── Response ─────────────────────────────────────────
    res.status(201).json({
      lesson,
      message: "Lesson created successfully",
      success: true,
    });

  } catch (error) {
    console.error("addLessonToStep error:", error);

    if (req.file) {
      const filePath = path.join(process.cwd(), "uploads/lessons", req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.status(500).json({ message: error.message || "Failed to create lesson" });
  }
};
// ========================
// تحديث Lesson
// ========================
const updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      type,
      content,
      externalLink,
      thumbnail,
      duration,
      timeLimit,
      passingScore,
    } = req.body;

    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(id) },
      include: { video: true, article: true, quiz: true },
    });

    if (!lesson) return next(errorHandler("Lesson not found", 404));

    const updatedLesson = await prisma.$transaction(async (tx) => {
      // ===============================
      // لو النوع اتغير
      // ===============================
      if (type && type !== lesson.type) {
        // حذف الفيديو القديم لو موجود
        if (lesson.video && lesson.video.provider === "upload") {
          const oldPath = path.join(process.cwd(), lesson.video.videoUrl);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        if (lesson.video) await tx.videoLesson.delete({ where: { lessonId: lesson.id } });
        if (lesson.article) await tx.articleLesson.delete({ where: { lessonId: lesson.id } });
        if (lesson.quiz) await tx.quiz.delete({ where: { lessonId: lesson.id } });
      }

      // ===============================
      // تحديث بيانات Lesson الأساسية
      // ===============================
      const updated = await tx.lesson.update({
        where: { id: Number(id) },
        data: { title, description, type: type || lesson.type },
      });

      // ===============================
      // VIDEO
      // ===============================
      if ((type === "VIDEO" || lesson.type === "VIDEO")) {
        if (req.file || externalLink) {
          // حذف الفيديو القديم لو Upload
          if (lesson.video && lesson.video.provider === "upload") {
            const oldPath = path.join(process.cwd(), lesson.video.videoUrl);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }

          await tx.videoLesson.upsert({
            where: { lessonId: lesson.id },
            update: {
              videoUrl: req.file ? `/uploads/lessons/${req.file.filename}` : externalLink,
              provider: req.file ? "upload" : "external",
              thumbnail: thumbnail || lesson.video?.thumbnail || null,
              duration: duration || lesson.video?.duration || null,
              isExternal: req.file ? false : true,
            },
            create: {
              lessonId: lesson.id,
              videoUrl: req.file ? `/uploads/lessons/${req.file.filename}` : externalLink,
              provider: req.file ? "upload" : "external",
              thumbnail: thumbnail || null,
              duration: duration || null,
              isExternal: req.file ? false : true,
            },
          });
        }
      }

      // ===============================
      // ARTICLE
      // ===============================
      if ((type === "ARTICLE" || lesson.type === "ARTICLE")) {
        if (content || externalLink) {
          await tx.articleLesson.upsert({
            where: { lessonId: lesson.id },
            update: {
              content: content || externalLink,
              title,
              isExternal: content ? false : true,
            },
            create: {
              lessonId: lesson.id,
              content: content || externalLink,
              title,
              isExternal: content ? false : true,
            },
          });
        }
      }

      // ===============================
      // QUIZ
      // ===============================
      if ((type === "QUIZ" || lesson.type === "QUIZ")) {
        await tx.quiz.upsert({
          where: { lessonId: lesson.id },
          update: { title: `${title} Quiz`, timeLimit, passingScore },
          create: { lessonId: lesson.id, title: `${title} Quiz`, timeLimit, passingScore },
        });
      }

      return updated;
    });

    res.json({ updatedLesson, success: true, message: "Lesson updated successfully" });
  } catch (error) {
    console.error(error);
    if (req.file) {
      const filePath = path.join(process.cwd(), "uploads/lessons", req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.status(500).json({ message: "Failed to update lesson" });
  }
};
// ========================
// جلب الدروس مع المحتوى
// ========================
const getLessonsByStep = async (req, res) => {
  try {
    const { stepId } = req.params;
    const lessons = await prisma.lesson.findMany({
      where: { stepId: Number(stepId) },
      orderBy: { order: "asc" },
      include: { video: true, article: true, quiz: {include:{attempts:true}} },
    });
   console.log(lessons)
    res.status(200).json({ lessons, success: true, message: "Lessons fetched in step successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lessons", details: error.message });
  }
};


 const getSingleLesson = async (req, res) => {
  try {
    const { id } = req.params

    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(id) },
      include: { video: true, article: true, quiz: true },
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" })
    }

    res.json(lesson)
  } catch (error) {
    res.status(500).json({ message: "Error fetching lesson" })
  }
}


 const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(id) },
      include: { video: true },
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // ===============================
    // حذف الفيديو من السيرفر
    // ===============================
    if (lesson.video) {
      const filePath = path.join(process.cwd(), lesson.video.videoPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.$transaction(async (tx) => {

      await tx.lesson.delete({
        where: { id: Number(id) },
      });

      // تعديل الترتيب
      await tx.lesson.updateMany({
        where: {
          stepId: lesson.stepId,
          order: { gt: lesson.order },
        },
        data: {
          order: { decrement: 1 },
        },
      });
    });

    res.json({ message: "Lesson deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete lesson" });
  }
};
 const reorderLesson = async (req, res) => {
  const { lessonId, newOrder } = req.body

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId }
  })

  if (!lesson) {
    return res.status(404).json({ message: "Lesson not found" })
  }

  await prisma.$transaction(async (tx) => {
    if (newOrder > lesson.order) {
      await tx.lesson.updateMany({
        where: {
          stepId: lesson.stepId,
          order: {
            gt: lesson.order,
            lte: newOrder
          }
        },
        data: { order: { decrement: 1 } }
      })
    } else {
      await tx.lesson.updateMany({
        where: {
          stepId: lesson.stepId,
          order: {
            gte: newOrder,
            lt: lesson.order
          }
        },
        data: { order: { increment: 1 } }
      })
    }

    await tx.lesson.update({
      where: { id: lessonId },
      data: { order: newOrder }
    })
  })

  res.json({ message: "Lesson reordered successfully" })
}
module.exports = { addLessonToStep, getLessonsByStep, getSingleLesson, updateLesson, deleteLesson, 
  reorderLesson }