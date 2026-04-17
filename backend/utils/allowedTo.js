const errorHandler = require("./errorHandler");

 const allowedTo = ( ...roles) => {
   return (req, res, next) => {
    const user = req.user;

    
    if (!roles.includes(user.role)) {
       return errorHandler("You are not allowed to access this route", 403);
    }
    next();
  }
};
module.exports = allowedTo;