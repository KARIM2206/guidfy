// src/routes/recommendation.route.js
const express = require('express');
const { getRecommendations } = require('../services/recommendation.service');
// const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma =require('../prismaClient'); // أو استخدم الـ instance الموجود عندك
const {protect}=require('../middleware/authMiddleware');
const checkUser=require('../middleware/checkUser');
// GET /api/recommendations
// يحتاج user مسجّل دخول (ضع الـ auth middleware بتاعك قبله)
router.get('/',protect,checkUser, async (req, res) => {
  try {
    const userId = req.user?.id; // عدّل حسب الـ auth middleware بتاعك

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await getRecommendations(userId, prisma);
    return res.json(result);
  } catch (err) {
    console.error('[Recommendation Error]', err.message);

    // لو الـ AI service مش شغال
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'AI service unavailable' });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;