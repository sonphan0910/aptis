const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_CONFIG = require('../config/jwt');
const { PAGINATION } = require('./constants');

/**
 * Hash password using bcrypt
 */
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
const generateToken = (payload, type = JWT_CONFIG.tokenTypes.ACCESS) => {
  const expiresIn =
    type === JWT_CONFIG.tokenTypes.REFRESH
      ? JWT_CONFIG.refreshTokenExpiresIn
      : JWT_CONFIG.expiresIn;

  return jwt.sign({ ...payload, type }, JWT_CONFIG.secret, { expiresIn });
};

/**
 * Generate access and refresh tokens
 */
const generateTokenPair = (userId, email, role) => {
  const payload = { userId, email, role };

  return {
    accessToken: generateToken(payload, JWT_CONFIG.tokenTypes.ACCESS),
    refreshToken: generateToken(payload, JWT_CONFIG.tokenTypes.REFRESH),
  };
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_CONFIG.secret);
};

/**
 * Generate random password
 */
const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return password;
};

/**
 * Sanitize user object (remove sensitive data)
 */
const sanitizeUser = (user) => {
  const userObj = user.toJSON ? user.toJSON() : user;

  delete userObj.password_hash;

  return userObj;
};

/**
 * Paginate query results
 */
const paginate = (page, limit) => {
  const validPage = Math.max(1, parseInt(page) || PAGINATION.DEFAULT_PAGE);
  const validLimit = Math.min(
    Math.max(1, parseInt(limit) || PAGINATION.DEFAULT_LIMIT),
    PAGINATION.MAX_LIMIT,
  );

  return {
    offset: (validPage - 1) * validLimit,
    limit: validLimit,
    page: validPage,
  };
};

/**
 * Format pagination response
 */
const paginationResponse = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Calculate score percentage
 */
const calculatePercentage = (score, maxScore) => {
  if (!maxScore || maxScore === 0) {
    return 0;
  }
  return Math.round((score / maxScore) * 100);
};

/**
 * Format date to ISO string
 */
const formatDate = (date) => {
  return date ? new Date(date).toISOString() : null;
};

/**
 * Generate unique filename
 */
const generateFilename = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const ext = originalName.split('.').pop();

  return `${prefix}${timestamp}-${random}.${ext}`;
};

/**
 * Delay execution (for retries)
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Success response formatter
 */
const successResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data,
  };
};

/**
 * Error response formatter
 */
const errorResponse = (message, code = 'ERROR', details = null) => {
  return {
    success: false,
    error: {
      message,
      code,
      ...(details && { details }),
    },
  };
};

/**
 * Check if value is empty
 */
const isEmpty = (value) => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0)
  );
};

/**
 * Remove undefined/null values from object
 */
const cleanObject = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateTokenPair,
  verifyToken,
  generateRandomPassword,
  sanitizeUser,
  paginate,
  paginationResponse,
  calculatePercentage,
  formatDate,
  generateFilename,
  delay,
  successResponse,
  errorResponse,
  isEmpty,
  cleanObject,
};
