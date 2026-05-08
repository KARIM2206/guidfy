const { default: axios } = require('axios');
const prisma = require('../prismaClient');
const crypto = require("crypto");


/**
 * POST /api/n8n/save-jobs
 * Internal endpoint — بيتنادى من n8n بعد ما يجيب الـ jobs من SerpAPI
 */


// ── Helper ───────────────────────────────────────────────────
function generateExternalId(job) {
  const normalized = [
    (job.title   || '').toLowerCase().trim().replace(/\s+/g, ' '),
    (job.company || '').toLowerCase().trim(),
  ].join('|');
  return crypto.createHash('md5').update(normalized).digest('hex');
}

// ── Controller ───────────────────────────────────────────────
const saveJobs = async (req, res) => {
  try {
    const { jobs, learningPathId } = req.body;

    // Validation
    if (!learningPathId) {
      return res.status(400).json({ success: false, message: 'learningPathId is required' });
    }

    const parsedLearningPathId = Number(learningPathId);
    if (isNaN(parsedLearningPathId)) {
      return res.status(400).json({ success: false, message: 'Invalid learningPathId' });
    }

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(200).json({ success: true, message: 'No jobs to save', saved: 0, skipped: 0 });
    }

    const learningPath = await prisma.learningPath.findUnique({ where: { id: parsedLearningPathId } });
    if (!learningPath) {
      return res.status(404).json({ success: false, message: 'Learning path not found' });
    }

    // ── جيب الوظايف الموجودة مرة واحدة بدل ما نتحقق في كل iteration
    const existingJobs = await prisma.job.findMany({
      where: { learningPathId: parsedLearningPathId },
      select: { externalId: true, title: true, company: true },
    });

    const existingExternalIds = new Set(existingJobs.map(j => j.externalId).filter(Boolean));

    // title+company normalized → لمنع الوظايف المتشابهة حتى لو externalId مختلف
    const existingTitleCompanyKeys = new Set(
      existingJobs.map(j =>
        `${(j.title   || '').toLowerCase().trim().replace(/\s+/g, ' ')}|${(j.company || '').toLowerCase().trim()}`
      )
    );

    const results = { saved: 0, skipped: 0, errors: [] };

    for (const job of jobs) {
      const externalId      = generateExternalId(job);
      const titleCompanyKey = `${(job.title   || '').toLowerCase().trim().replace(/\s+/g, ' ')}|${(job.company || '').toLowerCase().trim()}`;

      // ── Skip لو موجودة فعلاً (بالـ hash أو بالـ title+company)
      if (existingExternalIds.has(externalId) || existingTitleCompanyKeys.has(titleCompanyKey)) {
        results.skipped++;
        continue;
      }

      try {
        await prisma.job.create({
          data: {
            title:           job.title    || 'Unknown Title',
            description:     job.description || 'No description',
            company:         job.company  || 'Unknown Company',
            location:        job.location || 'Unknown',
            applyLink:       job.applyLink,
            jobType:         job.jobType  || 'ONSITE',
            source:          job.source   || 'serpapi',
            postedAt:        job.postedAt ? new Date(job.postedAt) : new Date(),
            learningPathId:  parsedLearningPathId,
            createdById:     job.createdById || 1,
            status:          'DRAFT',
            externalId,
          },
        });

        // أضفها للـ Sets عشان الـ duplicates في نفس الـ batch ما يتخزنوش
        existingExternalIds.add(externalId);
        existingTitleCompanyKeys.add(titleCompanyKey);
        results.saved++;

      } catch (err) {
        results.errors.push({ title: job.title, error: err.message });
      }
    }

    return res.status(200).json({
      success:  true,
      message:  'Jobs processed successfully',
      saved:    results.saved,
      skipped:  results.skipped,
      ...(results.errors.length > 0 && { errors: results.errors }),
    });

  } catch (error) {
    console.error('saveJobs error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
const getJobs=async (req,res) => {
    try {
        const {learningPathId}=req.params;
        const {page=1,limit=10}=req.query;
        if(!learningPathId){
            return res.status(400).json({
                success:false,
                message:'learningPathId is required'
            })
        }
        console.log('learningPathId',learningPathId)
        
        const parsedLearningPathId=Number(learningPathId);
        if(isNaN(parsedLearningPathId)){
            return res.status(400).json({
                success:false,
                message:'Invalid learningPathId'
            })
        }
        const learningPath=await prisma.learningPath.findUnique({
            where:{id:parsedLearningPathId}
        });
        if(!learningPath){
            return res.status(404).json({
                success:false,
                message:'Learning path not found'
            })
        }
        console.log('path \n',learningPath)
        const jobs=await prisma.job.findMany({
            where:{learningPathId:parsedLearningPathId},
            skip:Number((page-1)*limit),
            take:Number(limit),
            orderBy:{createdAt:'desc'}
        });
        return res.status(200).json({
            success:true,
            message:'Jobs fetched successfully',
            total:jobs.length,
            jobs
        })
    } catch (error) {
        console.error('getJobs error:',error);
        return res.status(500).json({
            success:false,
            message:'Internal server error',
            error:error.message
        })
    }
}
// controllers/N8n.controller.js — أضف الفنكشن دي جنب getJobs

const fetchJobsFromN8N = async (req, res) => {
  try {
    const { learningPathId, jobTitle, location = "Egypt" } = req.query;

    if (!learningPathId || !jobTitle) {
      return res.status(400).json({
        success: false,
        message: "learningPathId and jobTitle are required",
      });
    }

    const parsedId = Number(learningPathId);
    if (isNaN(parsedId)) {
      return res.status(400).json({ success: false, message: "Invalid learningPathId" });
    }

    const learningPath = await prisma.learningPath.findUnique({ where: { id: parsedId } });
    if (!learningPath) {
      return res.status(404).json({ success: false, message: "Learning path not found" });
    }

    let n8nResponse;
    try {
      n8nResponse = await axios.post(
        "http://localhost:5678/webhook/get-linkedin-jobs",
        { jobTitle, location, learningPathId: parsedId },
        { headers: { "Content-Type": "application/json" }, timeout: 60000 }
      );
    } catch (axiosError) {
      return res.status(502).json({
        success: false,
        message: "Failed to connect to n8n",
        error: axiosError.message,
      });
    }

    const n8nData = n8nResponse.data;

    if (!n8nData?.success) {
      return res.status(502).json({
        success: false,
        message: n8nData?.message || "n8n returned an error",
      });
    }

    const jobs = await prisma.job.findMany({
      where: { learningPathId: parsedId },
      orderBy: { postedAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      totalSaved:   n8nData.saved   ?? 0,
      totalSkipped: n8nData.skipped ?? 0,
      total:        jobs.length,
      jobs,
    });

  } catch (error) {
    console.error("fetchJobsFromN8N error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


module.exports = { saveJobs,getJobs,fetchJobsFromN8N };