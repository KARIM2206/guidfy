// backend/services/skillSyncService.js
const { batchExtractSkills } = require('../services/recommendation.service'); // تم توحيد الاستدعاء من aiService لضمان عمل الـ Mapping
const prisma = require('../prismaClient');

/**
 * يمر على كل الـ Jobs والـ Steps والـ Lessons التي مهاراتها null أو فارغة،
 * ويستخرجها من الـ AI ويحدثها في الـ DB بصيغة JSON String سليمة.
 */
async function syncMissingSkills() {
  try {
    console.log("🔄 [SkillSync] Starting Global Synchronization Pipeline...");

    // ══════════════════════════════════════════════════════
    // 1️⃣ الـ JOBS (الوظائف) - إصلاح ثغرة الفلترة وتجنب Strict Schema Checks
    // ══════════════════════════════════════════════════════
    const allJobs = await prisma.job.findMany({
      select: { id: true, title: true, description: true, skills: true },
    });

    // فلترة السجلات التي مهاراتها فارغة أو غير معرّفة داخل الـ Memory
    const jobsWithoutSkills = allJobs.filter(j => {
      return !j.skills || j.skills === '[]' || String(j.skills).trim() === '';
    });

    if (jobsWithoutSkills.length > 0) {
      console.log(`💼 [SkillSync] Found ${jobsWithoutSkills.length} jobs without skills. Extracting...`);

      const extractedJobs = await batchExtractSkills(
        jobsWithoutSkills.map(j => ({
          id:          j.id,
          title:       j.title,
          description: j.description || '',
        }))
      );

      let updatedJobsCount = 0;
      for (const item of extractedJobs) {
        const id = item.jobId || item.id;
        if (!id || !item.skills) continue;

        const cleanSkills = item.skills.map(s => {
          if (typeof s === 'string') return s.toLowerCase().trim();
          if (s && typeof s === 'object' && s.canonical) return String(s.canonical).toLowerCase().trim();
          return null;
        }).filter(Boolean);

        if (cleanSkills.length > 0) {
          await prisma.job.update({
            where: { id: Number(id) },
            data:  { skills: JSON.stringify(cleanSkills) },
          });
          updatedJobsCount++;
        }
      }
      console.log(`✅ [SkillSync] Successfully updated ${updatedJobsCount} jobs in DB.`);
    } else {
      console.log(`✅ [SkillSync] No jobs found with missing skills.`);
    }

    // ══════════════════════════════════════════════════════
    // 2️⃣ الـ STEPS (الخطوات التعليمية) - إصلاح موازٍ
    // ══════════════════════════════════════════════════════
    const allSteps = await prisma.step.findMany({
      select: { id: true, title: true, description: true, skills: true },
    });

    const stepsWithoutSkills = allSteps.filter(s => {
      return !s.skills || s.skills === '[]' || String(s.skills).trim() === '';
    });

    if (stepsWithoutSkills.length > 0) {
      console.log(`Tracks [SkillSync] Found ${stepsWithoutSkills.length} steps without skills. Extracting...`);

      const extractedSteps = await batchExtractSkills(
        stepsWithoutSkills.map(s => ({
          id:          s.id,
          title:       s.title,
          description: s.description || '',
        }))
      );

      let updatedStepsCount = 0;
      for (const item of extractedSteps) {
        const id = item.jobId || item.id;
        if (!id || !item.skills) continue;

        const cleanSkills = item.skills.map(s => {
          if (typeof s === 'string') return s.toLowerCase().trim();
          if (s && typeof s === 'object' && s.canonical) return String(s.canonical).toLowerCase().trim();
          return null;
        }).filter(Boolean);

        if (cleanSkills.length > 0) {
          await prisma.step.update({
            where: { id: Number(id) },
            data:  { skills: JSON.stringify(cleanSkills) },
          });
          updatedStepsCount++;
        }
      }
      console.log(`✅ [SkillSync] Successfully updated ${updatedStepsCount} steps in DB.`);
    } else {
      console.log(`✅ [SkillSync] No steps found with missing skills.`);
    }

    // ══════════════════════════════════════════════════════
    // 3️⃣ الـ LESSONS (الدروس) - إصلاح موازٍ
    // ══════════════════════════════════════════════════════
    const allLessons = await prisma.lesson.findMany({
      select: { id: true, title: true, description: true, skills: true },
    });

    const lessonsWithoutSkills = allLessons.filter(l => {
      return !l.skills || l.skills === '[]' || String(l.skills).trim() === '';
    });

    if (lessonsWithoutSkills.length > 0) {
      console.log(`📖 [SkillSync] Found ${lessonsWithoutSkills.length} lessons without skills. Extracting...`);

      const extractedLessons = await batchExtractSkills(
        lessonsWithoutSkills.map(l => ({
          id:          l.id,
          title:       l.title,
          description: l.description || '',
        }))
      );

      let updatedLessonsCount = 0;
      for (const item of extractedLessons) {
        const id = item.jobId || item.id;
        if (!id || !item.skills) continue;

        const cleanSkills = item.skills.map(s => {
          if (typeof s === 'string') return s.toLowerCase().trim();
          if (s && typeof s === 'object' && s.canonical) return String(s.canonical).toLowerCase().trim();
          return null;
        }).filter(Boolean);

        if (cleanSkills.length > 0) {
          await prisma.lesson.update({
            where: { id: Number(id) },
            data:  { skills: JSON.stringify(cleanSkills) },
          });
          updatedLessonsCount++;
        }
      }
      console.log(`✅ [SkillSync] Successfully updated ${updatedLessonsCount} lessons in DB.`);
    } else {
      console.log(`✅ [SkillSync] No lessons found with missing skills.`);
    }

    console.log(`🎉 [SkillSync] All database entities are now fully operational and populated!`);
  } catch (error) {
    console.error(`❌ [SkillSync] Critical error during synchronization:`, error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// ── تأمين التشغيل المباشر للـ Script من الـ Terminal ──────────────────
if (require.main === module) {
  syncMissingSkills();
}

module.exports = { syncMissingSkills };