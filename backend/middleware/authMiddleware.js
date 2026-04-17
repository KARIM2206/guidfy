const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");
const errorHandler = require("../utils/errorHandler");

const protect = async (req, res, next) => {
  let token;

  // 1. شوف الهيدر
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // 2. استخرج التوكن
      token = req.headers.authorization.split(" ")[1];
//  //(req.headers.authorization, 'req.headere \n');

      // 3. Verify التوكن
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. هات الـ user من الـ DB
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) {
        return next(errorHandler("User not found", 404));
      }

      // 5. حط الـ user في req عشان تقدر توصله في أي route
      req.user = user;
      next();
    } catch (error) {
      return next(errorHandler("Not authorized, token failed", 401));
    }
  }

  if (!token) {
    return next(errorHandler("Not authorized, no token", 401));
  }
};

module.exports = { protect };
