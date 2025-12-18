const UserService = require('../../services/UserService');
const { ValidationError } = require('../../utils/errors');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * Admin User Controller
 * Handles user management operations for administrators
 */
class AdminUserController {
  /**
   * Get all users with filtering and pagination
   */
  static async getAllUsers(req, res) {
    try {
      const { page, limit, role, status, search } = req.query;

      const result = await UserService.getAllUsers({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        role,
        status,
        search,
      });

      return successResponse(res, 'Users retrieved successfully', result);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = await UserService.getUserById(userId);

      return successResponse(res, 'User retrieved successfully', { user });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Create new user
   */
  static async createUser(req, res) {
    try {
      const { email, full_name, role, phone, status = 'active' } = req.body;

      // Validate required fields
      if (!email || !full_name || !role) {
        throw new ValidationError('Email, full_name, and role are required');
      }

      // Validate role
      if (!UserService.validateRole(role)) {
        throw new ValidationError('Invalid role');
      }

      // Validate status
      if (status && !UserService.validateStatus(status)) {
        throw new ValidationError('Invalid status');
      }

      const result = await UserService.createUser({
        email,
        full_name,
        role,
        phone,
        status,
      });

      return successResponse(res, 'User created successfully', result, 201);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Update user
   */
  static async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      // Validate role if provided
      if (updateData.role && !UserService.validateRole(updateData.role)) {
        throw new ValidationError('Invalid role');
      }

      // Validate status if provided
      if (updateData.status && !UserService.validateStatus(updateData.status)) {
        throw new ValidationError('Invalid status');
      }

      const user = await UserService.updateUser(userId, updateData);

      return successResponse(res, 'User updated successfully', { user });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;

      await UserService.deleteUser(userId, currentUserId);

      return successResponse(res, 'User deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Reset user password
   */
  static async resetUserPassword(req, res) {
    try {
      const { userId } = req.params;

      const result = await UserService.resetUserPassword(userId);

      return successResponse(res, 'Password reset successfully', {
        user: result.user,
        tempPassword: result.tempPassword,
      });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(req, res) {
    try {
      const { role } = req.params;

      // Validate role
      if (!UserService.validateRole(role)) {
        throw new ValidationError('Invalid role');
      }

      const users = await UserService.getUsersByRole(role);

      return successResponse(res, `${role}s retrieved successfully`, { users });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(req, res) {
    try {
      const stats = await UserService.getUserStats();

      return successResponse(res, 'User statistics retrieved successfully', { stats });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Search users
   */
  static async searchUsers(req, res) {
    try {
      const { q: query, role, limit } = req.query;

      if (!query || query.trim().length === 0) {
        throw new ValidationError('Search query is required');
      }

      const options = {
        role,
        limit: parseInt(limit) || 10,
      };

      const users = await UserService.searchUsers(query, options);

      return successResponse(res, 'Users found', { users });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get recent users
   */
  static async getRecentUsers(req, res) {
    try {
      const { days } = req.query;
      const users = await UserService.getRecentUsers(parseInt(days) || 30);

      return successResponse(res, 'Recent users retrieved successfully', { users });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Bulk update users
   */
  static async bulkUpdateUsers(req, res) {
    try {
      const { userIds, updateData } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new ValidationError('User IDs array is required');
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        throw new ValidationError('Update data is required');
      }

      // Validate role if provided
      if (updateData.role && !UserService.validateRole(updateData.role)) {
        throw new ValidationError('Invalid role');
      }

      // Validate status if provided
      if (updateData.status && !UserService.validateStatus(updateData.status)) {
        throw new ValidationError('Invalid status');
      }

      const affectedCount = await UserService.bulkUpdateUsers(userIds, updateData);

      return successResponse(res, 'Users updated successfully', {
        affectedCount,
        userIds,
        updateData,
      });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Export users data
   */
  static async exportUsers(req, res) {
    try {
      const { format = 'json', role, status, fields } = req.query;

      // Get all users based on filters
      const result = await UserService.getAllUsers({
        role,
        status,
        limit: 1000, // Export limit
      });

      let exportData = result.users;

      // Filter fields if specified
      if (fields) {
        const allowedFields = fields.split(',');
        exportData = result.users.map((user) => {
          const filteredUser = {};
          allowedFields.forEach((field) => {
            if (user[field] !== undefined) {
              filteredUser[field] = user[field];
            }
          });
          return filteredUser;
        });
      }

      if (format === 'csv') {
        // Convert to CSV format (simplified)
        const csvHeader = Object.keys(exportData[0] || {}).join(',');
        const csvData = exportData.map((user) => Object.values(user).join(',')).join('\n');

        const csv = `${csvHeader}\n${csvData}`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
        return res.send(csv);
      }

      // Default JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="users.json"');
      return res.json({
        exportedAt: new Date().toISOString(),
        totalCount: exportData.length,
        data: exportData,
      });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Validate user data
   */
  static validateUserData(userData) {
    const errors = [];

    if (userData.email && !/^\S+@\S+\.\S+$/.test(userData.email)) {
      errors.push('Invalid email format');
    }

    if (userData.phone && !/^\+?[\d\s\-()]+$/.test(userData.phone)) {
      errors.push('Invalid phone format');
    }

    if (userData.full_name && userData.full_name.trim().length < 2) {
      errors.push('Full name must be at least 2 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = AdminUserController;
