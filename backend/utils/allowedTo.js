// utils/allowedTo.js
// ✅ Fix: original was calling errorHandler() but not passing to next(),
//    so the error was silently lost and the route would hang.
'use strict';

const allowedTo = (...roles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'You are not allowed to access this route',
      });
    }

    next();
  };
};

module.exports = allowedTo;