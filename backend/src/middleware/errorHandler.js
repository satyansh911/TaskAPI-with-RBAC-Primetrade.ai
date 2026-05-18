const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Handle PostgreSQL unique violation
  if (err.code === '23505') {
    statusCode = 409;
    message = 'A record with this value already exists.';
  }

  // Handle PostgreSQL foreign key violation
  if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced resource does not exist.';
  }

  // Log non-operational errors (programming bugs)
  if (!err.isOperational) {
    logger.error(`[UnhandledError] ${err.stack}`);
  } else {
    logger.warn(`[OperationalError] ${statusCode} - ${message}`);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === 'development' && !err.isOperational && { stack: err.stack }),
  });
};

/**
 * 404 handler for unmatched routes
 */
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = { errorHandler, notFound };
