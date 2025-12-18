const {
  successResponse: helperSuccessResponse,
  errorResponse: helperErrorResponse,
} = require('./helpers');

/**
 * Success response with HTTP status
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    ...(data && { data }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Error response with HTTP status
 */
const errorResponse = (res, message, statusCode = 500, details = null) => {
  const response = {
    success: false,
    error: {
      message,
      ...(details && { details }),
    },
  };

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
  helperSuccessResponse,
  helperErrorResponse,
};
