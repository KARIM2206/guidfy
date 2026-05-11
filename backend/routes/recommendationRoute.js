const express  = require('express');
const { getRecommendations } = require('../services/recommendation.service');
const prisma   = require('../prismaClient');
const { protect }  = require('../middleware/authMiddleware');
const checkUser    = require('../middleware/checkUser');

const router = express.Router();

router.get('/', protect, checkUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const result = await getRecommendations(userId, prisma);
    return res.json(result);
  } catch (err) {
    console.error('[Recommendation Error]', err); // err كامل مش بس message
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'AI service unavailable' });
    }
    return res.status(500).json({
      message: 'Internal server error',
      detail:  err.message   // مؤقتاً للـ debugging
    });
  }
});

module.exports = router;