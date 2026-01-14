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

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { comparePassword, hashPassword } = require('../utils/helpers');
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

    if (user.avatar_url) {
      await StorageService.deleteFile(user.avatar_url);
    }

    const fileInfo = await StorageService.saveFile(req.file, 'avatars');

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

exports.createUser = async (req, res, next) => {
  try {
    const { email, full_name, role, phone, status = 'active' } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email already exists');
    }

    const tempPassword = generateRandomPassword(12);
    const password_hash = await hashPassword(tempPassword);

    const user = await User.create({
      email,
      password_hash,
      full_name,
      role,
      phone,
      status,
    });

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

exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

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

exports.resetUserPassword = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const tempPassword = generateRandomPassword(12);
    const password_hash = await hashPassword(tempPassword);

    await user.update({ password_hash });

    await EmailService.sendWelcomeEmail(user, tempPassword);

    res.json({
      success: true,
      message: 'Password reset. Temporary password sent to user email.',
    });
  } catch (error) {
    next(error);
  }
};
