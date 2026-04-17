const prismaClient = require("../prismaClient");
const prisma = prismaClient;
exports. calculateLearningPathProgress = async (learningPathId, userId) => {

  // إجمالي الدروس داخل كل Roadmaps التابعة للـ LearningPath
  const totalLessons = await prisma.lesson.count({
    where: {
      step: {
        roadmap: {
          learningPaths: {
            some: {
              learningPathId: learningPathId
            }
          }
        }
      }
    }
  });

  // الدروس التي أكملها الطالب داخل نفس الـ LearningPath
  const completedLessons = await prisma.userLessonProgress.count({
    where: {
      userId: userId,
      completed: true,
      lesson: {
        step: {
          roadmap: {
            learningPaths: {
              some: {
                learningPathId: learningPathId
              }
            }
          }
        }
      }
    }
  });

  const progressPercentage =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);

  return {
    totalLessons,
    completedLessons,
    progressPercentage,
    completed: progressPercentage === 100
  };
};