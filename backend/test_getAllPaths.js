const prisma = require('./prismaClient');

async function testProgress() {
  const userId = 1; // From previous test we know the student is userId 1

  const learningPaths = await prisma.learningPath.findMany({
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
      enrollments: {
        where: { userId },
      },
    },
  });

  let userCompletedLessonIds = new Set();
  const userProgress = await prisma.userLessonProgress.findMany({
    where: { userId, completed: true }
  });
  userProgress.forEach(p => {
    userCompletedLessonIds.add(p.lessonId);
  });

  console.log("Completed lesson IDs for user:", Array.from(userCompletedLessonIds));

  const formattedPaths = learningPaths.map(path => {
    let pathProgress = 0;
    let totalLessons = 0;
    let completedLessons = 0;

    if (path.roadmaps && path.roadmaps.length > 0) {
      path.roadmaps.forEach(r => {
        if (r.roadmap && r.roadmap.steps) {
          r.roadmap.steps.forEach(step => {
            if (step.lessons) {
              totalLessons += step.lessons.length;
              step.lessons.forEach(lesson => {
                if (userCompletedLessonIds.has(lesson.id)) {
                  completedLessons++;
                }
              });
            }
          });
        }
      });

      if (totalLessons > 0) {
        pathProgress = Math.round((completedLessons / totalLessons) * 100);
      }
    }

    const formattedEnrollments = (path.enrollments || []).map(e => ({
      ...e,
      progress: pathProgress
    }));

    return {
      title: path.title,
      totalLessons,
      completedLessons,
      pathProgress,
      enrollments: formattedEnrollments
    };
  });

  console.log(JSON.stringify(formattedPaths, null, 2));
}

testProgress().catch(console.error).finally(() => prisma.$disconnect());
