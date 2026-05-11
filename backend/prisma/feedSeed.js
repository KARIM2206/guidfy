const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding JobRecommendationFeedback...");

  // هنفترض إن عندك userId = 1 و jobs موجودة
  const userId = 1;

  const jobs = await prisma.job.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  if (!jobs.length) {
    console.log("❌ No jobs found — seed aborted");
    return;
  }

  const feedbackSamples = [
    {
      action: "ACCEPTED",
      score: 0.9,
      skillOverlap: 0.8,
      expMatch: true,
      freshness: 0.95,
      careerFit: 0.9,
      learningGap: 0.1,
      lpAlignment: 0.9,
    },
    {
      action: "VIEWED",
      score: 0.6,
      skillOverlap: 0.4,
      expMatch: false,
      freshness: 0.8,
      careerFit: 0.5,
      learningGap: 0.4,
      lpAlignment: 0.6,
    },
    {
      action: "SKIPPED",
      score: 0.2,
      skillOverlap: 0.1,
      expMatch: false,
      freshness: 0.7,
      careerFit: 0.3,
      learningGap: 0.7,
      lpAlignment: 0.4,
    },
    {
      action: "ACCEPTED",
      score: 0.85,
      skillOverlap: 0.7,
      expMatch: true,
      freshness: 0.9,
      careerFit: 0.8,
      learningGap: 0.2,
      lpAlignment: 0.85,
    },
    {
      action: "VIEWED",
      score: 0.5,
      skillOverlap: 0.3,
      expMatch: false,
      freshness: 0.85,
      careerFit: 0.5,
      learningGap: 0.5,
      lpAlignment: 0.5,
    },
  ];

  let i = 0;

  for (const job of jobs) {
    const f = feedbackSamples[i % feedbackSamples.length];

    await prisma.jobRecommendationFeedback.create({
      data: {
        userId,
        jobId: job.id,
        action: f.action,
        score: f.score,
        skillOverlap: f.skillOverlap,
        expMatch: f.expMatch,
        freshness: f.freshness,
        careerFit: f.careerFit,
        learningGap: f.learningGap,
        lpAlignment: f.lpAlignment,
      }
    });

    i++;
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });