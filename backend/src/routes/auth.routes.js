const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, authSchemas } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /auth/register - User registration
router.post('/register', authLimiter, validate(authSchemas.register), authController.register);

// POST /auth/login - User login
router.post('/login', authLimiter, validate(authSchemas.login), authController.login);

// POST /auth/refresh-token - Refresh access token
router.post('/refresh-token', validate(authSchemas.refreshToken), authController.refreshToken);

// POST /auth/logout - Logout (client-side)
router.post('/logout', authController.logout);

// POST /auth/forgot-password - Request password reset
router.post(
  '/forgot-password',
  authLimiter,
  validate(authSchemas.forgotPassword),
  authController.forgotPassword,
);

// POST /auth/reset-password - Reset password with token
router.post(
  '/reset-password',
  authLimiter,
  validate(authSchemas.resetPassword),
  authController.resetPassword,
);

module.exports = router;
