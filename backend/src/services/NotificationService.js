const { Notification, User } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { paginate } = require('../utils/helpers');
const EventEmitter = require('events');

class NotificationService extends EventEmitter {
  constructor() {
    super();
  }

  static async createNotification(notificationData) {
    const {
      user_id,
      type,
      title,
      message,
      data = {},
      priority = 'normal',
      category = 'general',
    } = notificationData;

    const user = await User.findByPk(user_id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const notification = await Notification.create({
      user_id,
      type,
      title,
      message,
      data: JSON.stringify(data),
      priority,
      category,
      status: 'unread',
    });

    this.emitNotification(user_id, notification);

    return this.getNotificationById(notification.id);
  }

  static async getNotificationById(notificationId) {
    const notification = await Notification.findByPk(notificationId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.data) {
      try {
        notification.data = JSON.parse(notification.data);
      } catch (e) {
        notification.data = {};
      }
    }

    return notification;
  }

  static async getUserNotifications(
    userId,
    { page = 1, limit = 20, status, type, category, priority },
  ) {
    const { offset, limit: validLimit } = paginate(page, limit);

    const where = { user_id: userId };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (priority) {
      where.priority = priority;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      offset,
      limit: validLimit,
      order: [['created_at', 'DESC']],
    });

    return {
      notifications: rows.map((notification) => {
        if (notification.data) {
          try {
            notification.data = JSON.parse(notification.data);
          } catch (e) {
            notification.data = {};
          }
        }
        return notification;
      }),
      pagination: {
        page: parseInt(page),
        limit: validLimit,
        total: count,
        pages: Math.ceil(count / validLimit),
      },
    };
  }

  static async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        user_id: userId,
      },
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    await notification.update({
      status: 'read',
      read_at: new Date(),
    });

    return this.getNotificationById(notificationId);
  }

  static async markAllAsRead(userId) {
    const [affectedCount] = await Notification.update(
      {
        status: 'read',
        read_at: new Date(),
      },
      {
        where: {
          user_id: userId,
          status: 'unread',
        },
      },
    );

    return affectedCount;
  }

  static async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        user_id: userId,
      },
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    await notification.destroy();
    return true;
  }

  static async deleteAllNotifications(userId) {
    const deletedCount = await Notification.destroy({
      where: { user_id: userId },
    });

    return deletedCount;
  }

  static async getUnreadCount(userId) {
    const count = await Notification.count({
      where: {
        user_id: userId,
        status: 'unread',
      },
    });

    return count;
  }

  static async sendToUser(userId, notificationData) {
    return this.createNotification({
      user_id: userId,
      ...notificationData,
    });
  }

  static async sendToUsers(userIds, notificationData) {
    const notifications = [];

    for (const userId of userIds) {
      try {
        const notification = await this.createNotification({
          user_id: userId,
          ...notificationData,
        });
        notifications.push(notification);
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error);
      }
    }

    return notifications;
  }

  static async sendToRole(role, notificationData) {
    const users = await User.findAll({
      where: { role, status: 'active' },
      attributes: ['id'],
    });

    const userIds = users.map((user) => user.id);
    return this.sendToUsers(userIds, notificationData);
  }

  static async sendSystemNotification(notificationData) {
    return this.createNotification({
      type: 'system',
      category: 'system',
      priority: 'high',
      ...notificationData,
    });
  }

  static async sendExamNotification(userId, examData, type = 'exam_assigned') {
    const templates = {
      exam_assigned: {
        title: 'New Exam Assigned',
        message: `You have been assigned a new exam: ${examData.title}`,
      },
      exam_reminder: {
        title: 'Exam Reminder',
        message: `Reminder: Your exam "${examData.title}" is due soon`,
      },
      exam_graded: {
        title: 'Exam Graded',
        message: `Your exam "${examData.title}" has been graded`,
      },
    };

    const template = templates[type] || templates.exam_assigned;

    return this.sendToUser(userId, {
      type: 'exam',
      category: 'exam',
      title: template.title,
      message: template.message,
      data: {
        exam_id: examData.id,
        exam_title: examData.title,
        exam_type: examData.exam_type,
      },
      priority: 'normal',
    });
  }

  static async sendAssignmentNotification(userId, assignmentData, type = 'assignment_created') {
    const templates = {
      assignment_created: {
        title: 'New Assignment',
        message: `New assignment available: ${assignmentData.title}`,
      },
      assignment_due: {
        title: 'Assignment Due',
        message: `Assignment "${assignmentData.title}" is due soon`,
      },
      assignment_graded: {
        title: 'Assignment Graded',
        message: `Your assignment "${assignmentData.title}" has been graded`,
      },
    };

    const template = templates[type] || templates.assignment_created;

    return this.sendToUser(userId, {
      type: 'assignment',
      category: 'academic',
      title: template.title,
      message: template.message,
      data: {
        assignment_id: assignmentData.id,
        assignment_title: assignmentData.title,
      },
      priority: 'normal',
    });
  }

  static async sendWelcomeNotification(userId, userRole) {
    const templates = {
      student: {
        title: 'Welcome to APTIS!',
        message: 'Welcome to APTIS! Start exploring your exams and assignments.',
      },
      teacher: {
        title: 'Welcome to APTIS!',
        message: 'Welcome to APTIS! You can now create and manage exams for your students.',
      },
      admin: {
        title: 'Welcome to APTIS!',
        message: 'Welcome to APTIS! You have full administrative access to the system.',
      },
    };

    const template = templates[userRole] || templates.student;

    return this.sendToUser(userId, {
      type: 'welcome',
      category: 'system',
      title: template.title,
      message: template.message,
      priority: 'normal',
    });
  }

  static async getNotificationStats(userId = null) {
    const where = userId ? { user_id: userId } : {};

    const stats = await Notification.findAll({
      attributes: [
        'status',
        'type',
        'category',
        'priority',
        [Notification.sequelize.fn('COUNT', Notification.sequelize.col('id')), 'count'],
      ],
      where,
      group: ['status', 'type', 'category', 'priority'],
      raw: true,
    });

    const result = {
      total: 0,
      byStatus: {},
      byType: {},
      byCategory: {},
      byPriority: {},
    };

    stats.forEach((stat) => {
      const count = parseInt(stat.count);
      result.total += count;

      if (!result.byStatus[stat.status]) {
        result.byStatus[stat.status] = 0;
      }
      result.byStatus[stat.status] += count;

      if (!result.byType[stat.type]) {
        result.byType[stat.type] = 0;
      }
      result.byType[stat.type] += count;

      if (!result.byCategory[stat.category]) {
        result.byCategory[stat.category] = 0;
      }
      result.byCategory[stat.category] += count;

      if (!result.byPriority[stat.priority]) {
        result.byPriority[stat.priority] = 0;
      }
      result.byPriority[stat.priority] += count;
    });

    return result;
  }

  static async cleanOldNotifications(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const deletedCount = await Notification.destroy({
      where: {
        created_at: {
          [Op.lt]: cutoffDate,
        },
        status: 'read',
      },
    });

    return deletedCount;
  }

  static async getNotificationPreferences(userId) {
    return {
      email: true,
      push: true,
      exam: true,
      assignment: true,
      system: true,
    };
  }

  static async updateNotificationPreferences(userId, preferences) {
    return preferences;
  }

  static emitNotification(userId, notification) {
    this.emit('notification', {
      userId,
      notification,
    });
  }

  static validateNotificationData(data) {
    const errors = [];

    if (!data.type) {
      errors.push('Type is required');
    }

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!data.message || data.message.trim().length === 0) {
      errors.push('Message is required');
    }

    const validTypes = ['system', 'exam', 'assignment', 'grade', 'reminder', 'welcome'];
    if (data.type && !validTypes.includes(data.type)) {
      errors.push('Invalid notification type');
    }

    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (data.priority && !validPriorities.includes(data.priority)) {
      errors.push('Invalid priority');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}


module.exports = NotificationService;
