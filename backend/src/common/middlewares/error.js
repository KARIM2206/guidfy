// middleware/error.js — unified error handling
'use strict';

/**
 * 404 handler — catches any request that fell through all routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global error handler — MUST have 4 parameters (err, req, res, next)
 * so Express recognises it as error-handling middleware.
 */
// eslint-disable-next-line no-unused-vars
const errorHandlerMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message    = err.message    || 'Internal Server Error';

  // Never leak stack traces to clients in production
  const body = {
    success: false,
    error:   message,
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};

module.exports = { notFound, errorHandlerMiddleware };

