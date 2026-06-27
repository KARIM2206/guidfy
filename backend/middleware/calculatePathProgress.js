const prismaClient = require("../prismaClient");
const prisma = prismaClient;
exports.calculateLearningPathProgress = async (learningPathId, userId) => {
  const learningPath = await prisma.learningPath.findUnique({
    where: { id: learningPathId },
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
        }
      }
    }
  });

  if (!learningPath) return { totalLessons: 0, completedLessons: 0, progressPercentage: 0, completed: false };

  const userProgress = await prisma.userLessonProgress.findMany({
    where: { userId, completed: true }
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

  const progressPercentage = publishedRoadmapsCount > 0 
    ? Math.round(totalRoadmapPercentage / publishedRoadmapsCount) 
    : 0;

  return {
    totalLessons: 0,
    completedLessons: 0,
    progressPercentage,
    completed: progressPercentage === 100
  };
};