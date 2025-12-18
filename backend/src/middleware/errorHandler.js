const {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} = require('../utils/errors');

/**
 * Error handler middleware
 * Must be placed after all routes
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Handle known application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: errors,
      },
    });
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';

    return res.status(409).json({
      success: false,
      error: {
        message: `${field} already exists`,
        code: 'DUPLICATE_ERROR',
        field,
      },
    });
  }

  // Handle Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid reference to related resource',
        code: 'FOREIGN_KEY_ERROR',
      },
    });
  }

  // Handle multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'File size too large',
        code: 'FILE_SIZE_ERROR',
      },
    });
  }

  if (err.message && err.message.includes('File type not allowed')) {
    return res.status(400).json({
      success: false,
      error: {
        message: err.message,
        code: 'FILE_TYPE_ERROR',
      },
    });
  }

  // Handle JWT errors (if not caught by auth middleware)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      },
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      },
    });
  }

  // Handle unknown errors
  console.error('Unhandled error:', err);

  return res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      code: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
};

module.exports = { errorHandler, notFoundHandler };
