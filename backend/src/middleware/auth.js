const jwt = require('jsonwebtoken');
const JWT_CONFIG = require('../config/jwt');
const { User } = require('../models');
const { UnauthorizedError } = require('../utils/errors');

/**
 * Middleware to verify JWT token
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    console.log('[AuthMiddleware] Checking auth for:', req.path, 'Header:', authHeader ? 'present' : 'missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('[AuthMiddleware] Token extracted, length:', token.length);

    // Verify token
    const decoded = jwt.verify(token, JWT_CONFIG.secret);
    console.log('[AuthMiddleware] Token verified for user:', decoded.userId, 'type:', decoded.type);

    // Check token type
    if (decoded.type !== JWT_CONFIG.tokenTypes.ACCESS) {
      throw new UnauthorizedError('Invalid token type');
    }

    // Get user from database
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('User account is not active');
    }

    // Attach user to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Optional auth - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_CONFIG.secret);

    if (decoded.type === JWT_CONFIG.tokenTypes.ACCESS) {
      const user = await User.findByPk(decoded.userId);

      if (user && user.status === 'active') {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role,
          fullName: user.full_name,
        };
      }
    }

    next();
  } catch (error) {
    // Ignore token errors in optional auth
    next();
  }
};

module.exports = { authMiddleware, optionalAuth };
