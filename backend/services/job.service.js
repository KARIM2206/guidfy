const axios = require("axios");
const prisma = require("../prismaClient");

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

    // ── اتصل بـ n8n عشان يعمل fetch + save ──────────────────
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

    // ── اجيب الـ jobs من DB بعد ما n8n حفظهم ────────────────
    const jobs = await prisma.job.findMany({
      where: { learningPathId: parsedId },
      orderBy: { postedAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      totalFetched: n8nData.saved + (n8nData.skipped ?? 0),
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

const AI_URL = process.env.AI_SERVICE_URL;
const getJobRecommendations= async (userId) => {
  // 1. Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
     
  // 2. Get jobs (real DB)
  const jobs = await prisma.job.findMany({
    where: { status: "PUBLISHED" },
    take: 10,
    orderBy: { postedAt: "desc" },
  });
  
   const learningPath=await prisma.learningPath.findMany({
    where:{
      id:{in:jobs.learningPathId}
    }
   })
  // 3. Prepare payload (IMPORTANT)
  const payload = {
    user: {
      userId: user?.id,
      learningPathTitle: user?.learningPathTitle || "General",
      progressPercent: user?.progressPercent || 0,
      declaredSkills: user?.skills || [],
      location: user?.location || "Cairo",
    },
    jobs: jobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      learningPathId: job.learningPathId,
      learningPathTitle: job.learningPathTitle,
      applyLink: job.applyLink,
      postedAt: job.postedAt,
      source: job.source,
    })),
    topN: 10,
  };

  // 4. Call AI service
  const { data } = await axios.post(`${AI_URL}/recommend`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 60000, // مهم جدًا
  });

  return data.recommendations;
}
module.exports = { fetchJobsFromN8N };