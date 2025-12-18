const { User } = require('../models');
const {
  hashPassword,
  comparePassword,
  generateTokenPair,
  sanitizeUser,
  generateRandomPassword,
} = require('../utils/helpers');
const EmailService = require('../services/EmailService');
const { UnauthorizedError, BadRequestError, ConflictError } = require('../utils/errors');
const jwt = require('jsonwebtoken');
const JWT_CONFIG = require('../config/jwt');

/**
 * Register new user
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, full_name, phone, role = 'student' } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      password_hash,
      full_name,
      phone,
      role: role === 'admin' ? 'student' : role, // Prevent admin creation via public register
      status: 'active',
    });

    // Generate tokens
    const tokens = generateTokenPair(user.id, user.email, user.role);

    // Send welcome email
    await EmailService.sendWelcomeEmail(user, password).catch((err) =>
      console.error('Failed to send welcome email:', err),
    );

    res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Log request
    console.log('[AuthController] Login attempt:', { email, password: password ? '***' : 'missing' });

    // Validate input
    if (!email || !password) {
      console.log('[AuthController] Missing email or password');
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
          code: 'MISSING_CREDENTIALS',
        },
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('[AuthController] User not found:', email);
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      console.log('[AuthController] Invalid password for user:', email);
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check user status
    if (user.status !== 'active') {
      console.log('[AuthController] Account not active:', email);
      throw new UnauthorizedError('Account is not active');
    }

    console.log('[AuthController] Login successful:', email);

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate tokens
    const tokens = generateTokenPair(user.id, user.email, user.role);
    console.log('[AuthController] Generated tokens:', {
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken,
      accessTokenLength: tokens.accessToken?.length,
      refreshTokenLength: tokens.refreshToken?.length
    });

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        ...tokens,
      },
    });
  } catch (error) {
    console.error('[AuthController] Login error:', error);
    next(error);
  }
};

/**
 * Refresh token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw new BadRequestError('Refresh token required');
    }

    // Verify refresh token
    const decoded = jwt.verify(refresh_token, JWT_CONFIG.secret);

    if (decoded.type !== JWT_CONFIG.tokenTypes.REFRESH) {
      throw new UnauthorizedError('Invalid token type');
    }

    // Get user
    const user = await User.findByPk(decoded.userId);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Generate new tokens
    const tokens = generateTokenPair(user.id, user.email, user.role);

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Invalid or expired refresh token'));
    } else {
      next(error);
    }
  }
};

/**
 * Logout
 */
exports.logout = async (req, res, next) => {
  try {
    // For stateless JWT, just return success
    // Client should remove token from storage

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
    }

    // Generate temporary password
    const tempPassword = generateRandomPassword(12);
    const password_hash = await hashPassword(tempPassword);

    // Update user password
    await user.update({ password_hash });

    // Send email with temporary password
    await EmailService.sendWelcomeEmail(user, tempPassword);

    res.json({
      success: true,
      message: 'Temporary password has been sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with token
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, JWT_CONFIG.resetTokenSecret);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Hash new password
    const password_hash = await hashPassword(newPassword);

    // Update password
    await user.update({ password_hash });

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Hash new password
    const password_hash = await hashPassword(newPassword);

    // Update password
    await user.update({ password_hash });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
