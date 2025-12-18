const { ForbiddenError } = require('../utils/errors');

/**
 * Middleware to check if user has required role
 * @param  {...string} allowedRoles - Array of allowed roles
 */
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Check if user is admin
 */
const isAdmin = roleCheck('admin');

/**
 * Check if user is teacher or admin
 */
const isTeacherOrAdmin = roleCheck('teacher', 'admin');

/**
 * Check if user is student
 */
const isStudent = roleCheck('student');

/**
 * Check if user can manage resource (owner or admin)
 */
const canManageResource = (getOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    // Admin can manage any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Get the owner ID of the resource
    const ownerId = await getOwnerId(req);

    // Check if current user is the owner
    if (req.user.userId !== ownerId) {
      return next(new ForbiddenError('You can only manage your own resources'));
    }

    next();
  };
};

module.exports = {
  roleCheck,
  isAdmin,
  isTeacherOrAdmin,
  isStudent,
  canManageResource,
};
