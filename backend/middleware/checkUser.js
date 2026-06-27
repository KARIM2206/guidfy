// middleware/checkUser.js
'use strict';

const prisma = require('../prismaClient'); // ✅ Singleton — no new PrismaClient()

/**
 * Verifies the authenticated user still exists in DB and refreshes req.user
 * with DB-sourced data. Used after `protect` middleware.
 */
const checkUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('checkUser error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = checkUser;