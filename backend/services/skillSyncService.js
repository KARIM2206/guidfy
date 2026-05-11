// backend/services/skillSyncService.js
const { batchExtractSkills } = require('./recommendation.service');
const prisma = require('../prismaClient');

/**
 * يمشي على كل الـ Steps/Lessons اللي skills بتاعتها null
 * ويستخرجها من الـ AI ويخزنها في الـ DB
 */
async function syncMissingSkills() {
  // ── Steps ──────────────────────────────────────────────────────────────
  const stepsWithoutSkills = await prisma.step.findMany({
    where: {
      OR: [
        { skills: { equals: null } },
      ],
    },
    select: { id: true, title: true, description: true },
  });

  if (stepsWithoutSkills.length > 0) {
    console.log(`[SkillSync] Processing ${stepsWithoutSkills.length} steps...`);

    const extracted = await batchExtractSkills(
      stepsWithoutSkills.map(s => ({
        id:          s.id,
        title:       s.title,
        description: s.description || '',
      }))
    );

    for (const { jobId, skills } of extracted) {
      if (skills?.length > 0) {
        await prisma.step.update({
          where: { id: jobId },
          data:  { skills },
        });
      }
    }
    console.log(`[SkillSync] Steps done.`);
  }

  // ── Lessons ─────────────────────────────────────────────────────────────
  const lessonsWithoutSkills = await prisma.lesson.findMany({
    where: {
      OR: [
        { skills: { equals: null } },
      ],
    },
    select: { id: true, title: true, description: true },
  });

  if (lessonsWithoutSkills.length > 0) {
    console.log(`[SkillSync] Processing ${lessonsWithoutSkills.length} lessons...`);

    const extracted = await batchExtractSkills(
      lessonsWithoutSkills.map(l => ({
        id:          l.id,
        title:       l.title,
        description: l.description || '',
      }))
    );

    for (const { jobId, skills } of extracted) {
      if (skills?.length > 0) {
        await prisma.lesson.update({
          where: { id: jobId },
          data:  { skills },
        });
      }
    }
    console.log(`[SkillSync] Lessons done.`);
  }
}

module.exports = { syncMissingSkills };