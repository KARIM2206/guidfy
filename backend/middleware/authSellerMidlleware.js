const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");
const errorHandler = require("../utils/errorHandler");

const authSeller = async (req, res, next) => {
  let token;
 //(req.headers);

  // 1. شوف الهيدر
  if (req.headers.authorizationseller && req.headers.authorizationseller.startsWith("Bearer")) {
    try {
      // 2. استخرج التوكن
      token = req.headers.authorizationseller.split(" ")[1];
 //('token in seller',token);

      // 3. Verify التوكن
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
 //(decoded,'de8ifuiuuuuuuuuuuuuuuuuuuuuuu');


      // 4. هات الـ user من الـ DB
      const user = await prisma.seller.findUnique({ where: { id:parseInt( decoded.id) } });
      if (!user) {
        return next(errorHandler("User not found", 404));
      }

      // 5. حط الـ user في req عشان تقدر توصله في أي route
      req.seller = user;
      next();
    } catch (error) {
      return next(errorHandler("Not authorized, token failed", 401));
    }
  }

  if (!token) {
    return next(errorHandler("Not authorized, no token", 401));
  }
};

module.exports = { authSeller };
