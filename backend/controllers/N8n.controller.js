const { default: axios } = require('axios');
const prisma = require('../prismaClient');
const crypto = require("crypto");


/**
 * N8N Controller
 * ==============
 * Endpoints:
 *   POST /api/n8n/save-jobs       ← called by n8n webhook (internal)
 *   GET  /api/n8n/jobs/:learningPathId
 *   POST /api/n8n/fetch-jobs      ← called by frontend to trigger n8n
 */


// ── Helper: Generate deterministic unique ID ───────────────────────────────
function generateExternalId(job) {
  /**
   * Uses applyLink as primary unique key (most reliable).
   * Falls back to title+company+location+postedAt composite.
   */
  if (job.applyLink && typeof job.applyLink === 'string' && job.applyLink.trim()) {
    return crypto
      .createHash('md5')
      .update(job.applyLink.trim().toLowerCase())
      .digest('hex');
  }

  // Fallback for jobs without applyLink (rare)
  const normalized = [
    (job.title    || '').toLowerCase().trim().replace(/\s+/g, ' '),
    (job.company  || '').toLowerCase().trim(),
    (job.location || '').toLowerCase().trim(),
    (job.postedAt || new Date().toISOString()),
  ].join('|');

  return crypto.createHash('md5').update(normalized).digest('hex');
}


// ── Helper: Normalize title+company key for deduplication ──────────────────
function generateTitleCompanyKey(job) {
  const title = (job.title || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
  const company = (job.company || '').toLowerCase().trim();
  return `${title}|${company}`;
}


// ═══════════════════════════════════════════════════════════════════════════
// POST /api/n8n/save-jobs
// Called by n8n webhook after fetching from SerpAPI
// ═══════════════════════════════════════════════════════════════════════════

const saveJobs = async (req, res) => {
  try {
    const { jobs, learningPathId } = req.body;

    // ── Validation ─────────────────────────────────────────────────────────
    if (!learningPathId) {
      return res.status(400).json({
        success: false,
        message: 'learningPathId is required'
      });
    }

    const parsedLearningPathId = Number(learningPathId);
    if (isNaN(parsedLearningPathId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid learningPathId'
      });
    }

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No jobs to save',
        saved: 0,
        skipped: 0
      });
    }

    // ── Verify learning path exists ────────────────────────────────────────
    const learningPath = await prisma.learningPath.findUnique({
      where: { id: parsedLearningPathId }
    });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    // ── Preload existing jobs for deduplication ────────────────────────────
    const existingJobs = await prisma.job.findMany({
      where: { learningPathId: parsedLearningPathId },
      select: {
        externalId: true,
        title: true,
        company: true,
        applyLink: true
      }
    });

    const existingExternalIds = new Set(
      existingJobs.map(j => j.externalId).filter(Boolean)
    );

    const existingTitleCompanyKeys = new Set(
      existingJobs.map(j => generateTitleCompanyKey(j))
    );

    // ── Process each job ─────────────────────────────────────────────────
    const results = {
      saved: 0,
      skipped: 0,
      updated: 0,
      errors: []
    };

    // Track within-batch duplicates
    const processedInBatch = new Set();

    for (const job of jobs) {
      const externalId = generateExternalId(job);
      const titleCompanyKey = generateTitleCompanyKey(job);

      // Skip if already processed in this batch
      if (processedInBatch.has(externalId)) {
        results.skipped++;
        continue;
      }

      // Skip if exists in database (by externalId or title+company)
      if (existingExternalIds.has(externalId) || existingTitleCompanyKeys.has(titleCompanyKey)) {
        results.skipped++;
        continue;
      }

      try {
        // Use upsert to handle race conditions gracefully
        await prisma.job.upsert({
          where: { externalId },
          update: {
            title:       job.title || 'Unknown Title',
            description: job.description || 'No description',
            company:     job.company || 'Unknown Company',
            location:    job.location || 'Unknown',
            applyLink:   job.applyLink || null,
            jobType:     job.jobType || 'FULL_TIME',
            source:      job.source || 'serpapi',
            postedAt:    job.postedAt ? new Date(job.postedAt) : new Date(),
            updatedAt:   new Date(),
            status:      'DRAFT',
            learningPathId: parsedLearningPathId,
            createdById: job.createdById || 1,
          },
          create: {
            title:           job.title || 'Unknown Title',
            description:     job.description || 'No description',
            company:         job.company || 'Unknown Company',
            location:        job.location || 'Unknown',
            applyLink:       job.applyLink || null,
            jobType:         job.jobType || 'FULL_TIME',
            source:          job.source || 'serpapi',
            postedAt:        job.postedAt ? new Date(job.postedAt) : new Date(),
            learningPathId:  parsedLearningPathId,
            createdById:     job.createdById || 1,
            status:          'DRAFT',
            externalId,
          }
        });

        // Mark as processed
        processedInBatch.add(externalId);
        existingExternalIds.add(externalId);
        existingTitleCompanyKeys.add(titleCompanyKey);

        results.saved++;

      } catch (err) {
        // Log but don't fail entire batch
        console.error(`[saveJobs] Failed to save: ${job.title}`, err.message);
        results.errors.push({
          title: job.title,
          externalId,
          error: err.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Jobs processed successfully',
      saved: results.saved,
      skipped: results.skipped,
      updated: results.updated,
      totalProcessed: jobs.length,
      ...(results.errors.length > 0 && { errors: results.errors }),
    });

  } catch (error) {
    console.error('[saveJobs] Fatal error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// GET /api/n8n/jobs/:learningPathId
// Fetch saved jobs for a learning path
// ═══════════════════════════════════════════════════════════════════════════

const getJobs = async (req, res) => {
  try {
    const { learningPathId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    if (!learningPathId) {
      return res.status(400).json({
        success: false,
        message: 'learningPathId is required'
      });
    }

    const parsedLearningPathId = Number(learningPathId);
    if (isNaN(parsedLearningPathId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid learningPathId'
      });
    }

    const learningPath = await prisma.learningPath.findUnique({
      where: { id: parsedLearningPathId }
    });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    const where = { learningPathId: parsedLearningPathId };
    if (status) {
      where.status = status;
    }

    const skip = Number((page - 1) * limit);
    const take = Number(limit);

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take,
        orderBy: { postedAt: 'desc' },
      }),
      prisma.job.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Jobs fetched successfully',
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      jobs
    });

  } catch (error) {
    console.error('[getJobs] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// POST /api/n8n/fetch-jobs
// Called by frontend to trigger n8n workflow and fetch new jobs
// ═══════════════════════════════════════════════════════════════════════════

const fetchJobsFromN8N = async (req, res) => {
  try {
    const { learningPathId, jobTitle, location = "Egypt" } = req.query;

    if (!learningPathId || !jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'learningPathId and jobTitle are required'
      });
    }

    const parsedId = Number(learningPathId);
    if (isNaN(parsedId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid learningPathId'
      });
    }

    const learningPath = await prisma.learningPath.findUnique({
      where: { id: parsedId }
    });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    // ── Call n8n production webhook ──────────────────────────────────────
    let n8nResponse;
    try {
      n8nResponse = await axios.post(
        'http://localhost:5678/webhook/get-linkedin-jobs',
        {
          jobTitle,
          location,
          learningPathId: parsedId,
          createdById: req.user?.id || 1
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000
        }
      );
    } catch (axiosError) {
      console.error('[fetchJobsFromN8N] n8n connection failed:', axiosError.message);
      return res.status(502).json({
        success: false,
        message: 'Failed to connect to n8n workflow',
        error: axiosError.message,
        code: axiosError.code
      });
    }

    const n8nData = n8nResponse.data;

    if (!n8nData?.success) {
      return res.status(502).json({
        success: false,
        message: n8nData?.message || 'n8n workflow returned an error',
        n8nError: n8nData?.error
      });
    }

    // ── Return fresh jobs from database ──────────────────────────────────
    const jobs = await prisma.job.findMany({
      where: { learningPathId: parsedId },
      orderBy: { postedAt: 'desc' },
      take: 50
    });

    return res.status(200).json({
      success: true,
      message: 'Jobs fetched and saved successfully',
      n8nResult: {
        totalJobs: n8nData.totalJobs || 0,
        totalSaved: n8nData.saved || 0,
        totalSkipped: n8nData.skipped || 0,
        errors: n8nData.errors || []
      },
      total: jobs.length,
      jobs
    });

  } catch (error) {
    console.error('[fetchJobsFromN8N] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// DELETE /api/n8n/jobs/:id
// Soft delete a job
// ═══════════════════════════════════════════════════════════════════════════

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid job id is required'
      });
    }

    const job = await prisma.job.update({
      where: { id: Number(id) },
      data: { status: 'ARCHIVED', updatedAt: new Date() }
    });

    return res.status(200).json({
      success: true,
      message: 'Job archived successfully',
      job
    });

  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    console.error('[deleteJob] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  saveJobs,
  getJobs,
  fetchJobsFromN8N,
  deleteJob
};