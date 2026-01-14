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

exports.register = async (req, res, next) => {
  try {
    const { email, password, full_name, phone, role = 'student' } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const password_hash = await hashPassword(password);

    const user = await User.create({
      email,
      password_hash,
      full_name,
      phone,
      role: role === 'admin' ? 'student' : role, // Prevent admin creation via public register
      status: 'active',
    });

    const tokens = generateTokenPair(user.id, user.email, user.role);

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

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('[AuthController] Login attempt:', { email, password: password ? '***' : 'missing' });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
          code: 'MISSING_CREDENTIALS',
        },
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Account is not active');
    }


    await user.update({ last_login: new Date() });

    const tokens = generateTokenPair(user.id, user.email, user.role);

    res.json({
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

exports.refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw new BadRequestError('Refresh token required');
    }

    const decoded = jwt.verify(refresh_token, JWT_CONFIG.secret);

    if (decoded.type !== JWT_CONFIG.tokenTypes.REFRESH) {
      throw new UnauthorizedError('Invalid token type');
    }

    const user = await User.findByPk(decoded.userId);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedError('User not found or inactive');
    }

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

exports.logout = async (req, res, next) => {
  try {

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
    }

    const tempPassword = generateRandomPassword(12);
    const password_hash = await hashPassword(tempPassword);

    await user.update({ password_hash });

    await EmailService.sendWelcomeEmail(user, tempPassword);

    res.json({
      success: true,
      message: 'Temporary password has been sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, JWT_CONFIG.resetTokenSecret);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const password_hash = await hashPassword(newPassword);

    await user.update({ password_hash });

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    const password_hash = await hashPassword(newPassword);

    await user.update({ password_hash });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
