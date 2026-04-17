const errorHandler = (message, statusCode, res) => {
const error = new Error(message);
error.statusCode = statusCode;
return error;
};
module.exports = errorHandler;
