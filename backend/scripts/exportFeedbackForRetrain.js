// scripts/exportFeedbackForRetrain.js

const fs = require("fs");
const path = require("path");
const prisma = require("../prismaClient");

const OUTPUT_PATH = path.join(
  __dirname,
  "..",
  "ai_service",
  "data",
  "feedback_log.jsonl"
);

async function exportFeedback() {
  console.log("[Export] Fetching feedback from DB...");

  const feedback = await prisma.jobRecommendationFeedback.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!feedback.length) {
    console.log("[Export] No feedback rows found — aborting.");
    return;
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

  const lines = feedback.map((row) =>
    JSON.stringify({
      userId: row.userId,
      jobId: row.jobId,
      action: row.action,
      matchDetails: row.matchDetails || {},
      createdAt: row.createdAt,
    })
  );

  fs.writeFileSync(OUTPUT_PATH, lines.join("\n"), "utf-8");

  console.log(
    `[Export] ✅ Exported ${feedback.length} rows → ${OUTPUT_PATH}`
  );
}

exportFeedback()
  .catch((err) => {
    console.error("[Export] Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });