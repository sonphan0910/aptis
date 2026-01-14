const { User } = require('../models');
const { Op } = require('sequelize');
const AuthService = require('./AuthService');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { paginate } = require('../utils/helpers');

class UserService {
  static async getUserById(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return AuthService.sanitizeUser(user);
  }

  static async getUserByEmail(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return AuthService.sanitizeUser(user);
  }

  static async updateProfile(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const allowedFields = ['full_name', 'phone', 'avatar_url'];
    const filteredData = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    await user.update(filteredData);
    return AuthService.sanitizeUser(user);
  }

  static async getAllUsers({ page = 1, limit = 20, role, status, search }) {
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
      attributes: { exclude: ['password_hash'] },
    });

    return {
      users: rows.map((user) => AuthService.sanitizeUser(user)),
      pagination: {
        page: parseInt(page),
        limit: validLimit,
        total: count,
        pages: Math.ceil(count / validLimit),
      },
    };
  }

  static async createUser({ email, full_name, role, phone, status = 'active' }) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ValidationError('Email already exists');
    }

    const tempPassword = AuthService.generateRandomPassword(12);
    const password_hash = await AuthService.hashPassword(tempPassword);

    const user = await User.create({
      email,
      password_hash,
      full_name,
      role,
      phone,
      status,
    });

    return {
      user: AuthService.sanitizeUser(user),
      tempPassword,
    };
  }

  static async updateUser(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const allowedFields = ['full_name', 'phone', 'role', 'status'];
    const filteredData = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    await user.update(filteredData);
    return AuthService.sanitizeUser(user);
  }

  static async deleteUser(userId, currentUserId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.id === currentUserId) {
      throw new ValidationError('Cannot delete your own account');
    }

    await user.destroy();
    return true;
  }

  static async resetUserPassword(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const tempPassword = AuthService.generateRandomPassword(12);
    const password_hash = await AuthService.hashPassword(tempPassword);

    await user.update({ password_hash });

    return {
      user: AuthService.sanitizeUser(user),
      tempPassword, 
    };
  }

  static async updateAvatar(userId, avatarUrl) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await user.update({ avatar_url: avatarUrl });
    return AuthService.sanitizeUser(user);
  }

  static async getUsersByRole(role) {
    const users = await User.findAll({
      where: { role, status: 'active' },
      attributes: { exclude: ['password_hash'] },
      order: [['full_name', 'ASC']],
    });

    return users.map((user) => AuthService.sanitizeUser(user));
  }

  static async getUserStats() {
    const stats = await User.findAll({
      attributes: [
        'role',
        'status',
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count'],
      ],
      group: ['role', 'status'],
      raw: true,
    });

    const result = {
      total: 0,
      byRole: {},
      byStatus: {},
    };

    stats.forEach((stat) => {
      const count = parseInt(stat.count);
      result.total += count;

      if (!result.byRole[stat.role]) {
        result.byRole[stat.role] = 0;
      }
      result.byRole[stat.role] += count;

      if (!result.byStatus[stat.status]) {
        result.byStatus[stat.status] = 0;
      }
      result.byStatus[stat.status] += count;
    });

    return result;
  }

  static validateRole(role) {
    const validRoles = ['admin', 'teacher', 'student'];
    return validRoles.includes(role);
  }

  static validateStatus(status) {
    const validStatuses = ['active', 'inactive', 'banned'];
    return validStatuses.includes(status);
  }

  static hasPermission(user, requiredRole) {
    const roleHierarchy = {
      admin: 3,
      teacher: 2,
      student: 1,
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }

  static async searchUsers(query, options = {}) {
    const { limit = 10, role } = options;

    const where = {
      status: 'active',
      [Op.or]: [{ full_name: { [Op.like]: `%${query}%` } }, { email: { [Op.like]: `%${query}%` } }],
    };

    if (role) {
      where.role = role;
    }

    const users = await User.findAll({
      where,
      attributes: ['id', 'full_name', 'email', 'role'],
      limit,
      order: [['full_name', 'ASC']],
    });

    return users.map((user) => AuthService.sanitizeUser(user));
  }

  static async getRecentUsers(days = 30) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const users = await User.findAll({
      where: {
        created_at: {
          [Op.gte]: fromDate,
        },
      },
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
    });

    return users.map((user) => AuthService.sanitizeUser(user));
  }

  static async bulkUpdateUsers(userIds, updateData) {
    const allowedFields = ['status', 'role'];
    const filteredData = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    const [affectedCount] = await User.update(filteredData, {
      where: {
        id: {
          [Op.in]: userIds,
        },
      },
    });

    return affectedCount;
  }
}

module.exports = UserService;
