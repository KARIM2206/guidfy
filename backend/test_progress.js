const prisma = require('./prismaClient');

async function testProgress() {
  const email = "student@example.com"; // Adjust email if needed
  // Fetch a user
  const user = await prisma.user.findFirst({
    where: { role: 'STUDENT' },
    include: {
      roadmapProgress: true,
      enrolledLearningPaths: true,
      stepProgress: true,
      lessonProgress: true
    }
  });

  if (!user) {
    console.log("No student found");
    return;
  }

  console.log("User:", user.email);
  console.log("Enrolled Learning Paths:", user.enrolledLearningPaths);
  console.log("Roadmap Progress:", user.roadmapProgress);
  console.log("Step Progress:", user.stepProgress.slice(0, 2));
  console.log("Lesson Progress:", user.lessonProgress.slice(0, 2));

  // Check if there is any learning path progress 
  const paths = await prisma.learningPath.findMany({
    include: {
      roadmaps: true,
      enrollments: { where: { userId: user.id } }
    }
  });

  for (const path of paths) {
    if (path.enrollments.length > 0) {
      console.log(`\nLearning Path: ${path.title}`);
      console.log("Enrollment:", path.enrollments[0]);
      console.log("Roadmaps:", path.roadmaps);
    }
  }
}

testProgress().catch(console.error).finally(() => prisma.$disconnect());
