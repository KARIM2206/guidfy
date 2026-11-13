// middleware/authMiddleware.js
// ✅ Supports both:
//    1. HttpOnly cookie  → token=<jwt>
//    2. Authorization header → Bearer <jwt>   (backward compat for AI / mobile clients)
'use strict';

const jwt          = require('jsonwebtoken');
const prisma       = require('../../config/prismaClient');
const errorHandler = require('../utils/errorHandler');

const protect = async (req, res, next) => {
  let token;

  // ── 1. Cookie-based token (preferred, HttpOnly)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // ── 2. Authorization header (fallback — keeps AI service / mobile clients working)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(errorHandler('Not authorized, no token', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch only the fields we need to avoid loading heavy relations
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id:        true,
        email:     true,
        name:      true,
        role:      true,
        avatar:    true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return next(errorHandler('User not found', 404));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(errorHandler('Not authorized, token failed', 401));
  }
};

module.exports = { protect };

