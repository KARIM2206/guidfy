const errorHandler = require("../utils/errorHandler");

const notFound = (req,res,next)=>{
    const error=new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}
const errorHandlerMiddleware=(err,req,res,next)=>{
  return errorHandler(err.message,err.statusCode||500,res);
}

module.exports={notFound,errorHandlerMiddleware};