const { User } = require('../models');
const {
  hashPassword,
  generateRandomPassword,
  sanitizeUser,
  paginate,
  paginationResponse,
} = require('../utils/helpers');
const EmailService = require('../services/EmailService');
const StorageService = require('../services/StorageService');
const { NotFoundError, BadRequestError, ConflictError } = require('../utils/errors');
const { Op } = require('sequelize');

/**
 * Get current user profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone } = req.body;
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await user.update({
      full_name: full_name || user.full_name,
      phone: phone || user.phone,
    });

    res.json({
      success: true,
      data: sanitizeUser(user),
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
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const { comparePassword, hashPassword } = require('../utils/helpers');
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

/**
 * Upload avatar
 */
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    const userId = req.user.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Delete old avatar if exists
    if (user.avatar_url) {
      await StorageService.deleteFile(user.avatar_url);
    }

    // Save new avatar
    const fileInfo = await StorageService.saveFile(req.file, 'avatars');

    // Update user
    await user.update({ avatar_url: fileInfo.url });

    res.json({
      success: true,
      data: {
        avatar_url: fileInfo.url,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (Admin only)
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    const { offset, limit: validLimit } = paginate(page, limit);

    const where = {};

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      offset,
      limit: validLimit,
      order: [['created_at', 'DESC']],
    });

    const sanitizedUsers = rows.map((user) => sanitizeUser(user));

    res.json({
      success: true,
      ...paginationResponse(sanitizedUsers, parseInt(page), validLimit, count),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create user (Admin only)
 */
exports.createUser = async (req, res, next) => {
  try {
    const { email, full_name, role, phone, status = 'active' } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email already exists');
    }

    // Generate temporary password
    const tempPassword = generateRandomPassword(12);
    const password_hash = await hashPassword(tempPassword);

    // Create user
    const user = await User.create({
      email,
      password_hash,
      full_name,
      role,
      phone,
      status,
    });

    // Send welcome email with temporary password
    await EmailService.sendWelcomeEmail(user, tempPassword).catch((err) =>
      console.error('Failed to send welcome email:', err),
    );

    res.status(201).json({
      success: true,
      data: sanitizeUser(user),
      message: 'User created. Temporary password sent to email.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user (Admin only)
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { full_name, phone, role, status } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await user.update({
      full_name: full_name || user.full_name,
      phone: phone !== undefined ? phone : user.phone,
      role: role || user.role,
      status: status || user.status,
    });

    res.json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (Admin only)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Don't allow deleting self
    if (user.id === req.user.userId) {
      throw new BadRequestError('Cannot delete your own account');
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset user password (Admin only)
 */
exports.resetUserPassword = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Generate temporary password
    const tempPassword = generateRandomPassword(12);
    const password_hash = await hashPassword(tempPassword);

    await user.update({ password_hash });

    // Send email
    await EmailService.sendWelcomeEmail(user, tempPassword);

    res.json({
      success: true,
      message: 'Password reset. Temporary password sent to user email.',
    });
  } catch (error) {
    next(error);
  }
};
