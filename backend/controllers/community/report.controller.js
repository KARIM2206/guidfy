// controllers/report.controller.js
const prisma = require('../../prismaClient');

// ═══════════════════════════════════════════════════
//  CREATE REPORT
// ═══════════════════════════════════════════════════

const createReport = async (req, res) => {
  try {
    const reporterId  = req.user.id;
    const { targetType, targetId, communityId, reason, description } = req.body;

    if (!targetType || !targetId || !communityId || !reason) {
      return res.status(400).json({ message: 'targetType, targetId, communityId, and reason are required' });
    }

    const community = await prisma.community.findUnique({ where: { id: Number(communityId) } });
    if (!community) return res.status(404).json({ message: 'Community not found' });

    // ─── Prevent duplicate reports ───────────────────
    const existing = await prisma.communityReport.findFirst({
      where: {
        reporterId,
        targetType,
        targetId:   Number(targetId),
        communityId: Number(communityId),
        status:      'PENDING',
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'You already reported this content' });
    }

    const report = await prisma.communityReport.create({
      data: {
        reporterId,
        targetType,
        targetId:    Number(targetId),
        communityId: Number(communityId),
        reason,
        description: description || null,
      },
      include: {
        reporter: { select: { id: true, name: true, avatar: true } },
      },
    });

    return res.status(201).json({ message: 'Report submitted', report });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ═══════════════════════════════════════════════════
//  GET MY REPORTS
// ═══════════════════════════════════════════════════

const getMyReports = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const page       = Number(req.query.page)  || 1;
    const limit      = Number(req.query.limit) || 10;
    const skip       = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.communityReport.findMany({
        where:   { reporterId },
        include: { community: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.communityReport.count({ where: { reporterId } }),
    ]);

    return res.json({
      data:       reports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ═══════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════

module.exports = { createReport, getMyReports };