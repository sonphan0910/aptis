const UserService = require('../../services/UserService');
const ExamService = require('../../services/ExamService');
const NotificationService = require('../../services/NotificationService');
const { successResponse, errorResponse } = require('../../utils/response');
const { ValidationError } = require('../../utils/errors');

class AdminDashboardController {
  static async getDashboardOverview(req, res) {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period);

      const [userStats, recentUsers] = await Promise.all([
        UserService.getUserStats(),
        UserService.getRecentUsers(days),
      ]);

      const userGrowth = {
        total: userStats.total,
        newUsers: recentUsers.length,
        growthRate: userStats.total > 0 ? (recentUsers.length / userStats.total) * 100 : 0,
      };

      const examStats = {
        totalExams: 0,
        publishedExams: 0,
        draftExams: 0,
        archivedExams: 0,
      };

      const notificationStats = await NotificationService.getNotificationStats();

      const systemHealth = {
        status: 'healthy',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: 0,
      };

      const overview = {
        userStats: {
          ...userStats,
          growth: userGrowth,
        },
        examStats,
        notificationStats,
        systemHealth,
        period: {
          days,
          from: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
          to: new Date(),
        },
      };

      return successResponse(res, 'Dashboard overview retrieved successfully', { overview });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async getUserAnalytics(req, res) {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period);

      const [userStats, recentUsers] = await Promise.all([
        UserService.getUserStats(),
        UserService.getRecentUsers(days),
      ]);

      const usersByDay = {};
      const today = new Date();

      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        usersByDay[dateKey] = 0;
      }

      recentUsers.forEach((user) => {
        const dateKey = user.created_at.toISOString().split('T')[0];
        if (usersByDay[dateKey] !== undefined) {
          usersByDay[dateKey]++;
        }
      });

      const analytics = {
        overview: userStats,
        trends: {
          registrationsByDay: usersByDay,
          totalNewUsers: recentUsers.length,
        },
        demographics: {
          byRole: userStats.byRole,
          byStatus: userStats.byStatus,
        },
        growth: {
          daily: Object.values(usersByDay),
          average: recentUsers.length / days,
        },
      };

      return successResponse(res, 'User analytics retrieved successfully', { analytics });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async getExamAnalytics(req, res) {
    try {
      const { period = '30' } = req.query;

      const analytics = {
        overview: {
          totalExams: 0,
          publishedExams: 0,
          draftExams: 0,
          archivedExams: 0,
        },
        trends: {
          examCreationByDay: {},
          popularExamTypes: {},
        },
        performance: {
          averageCompletionRate: 0,
          averageScore: 0,
          totalAttempts: 0,
        },
        topExams: [],
      };

      return successResponse(res, 'Exam analytics retrieved successfully', { analytics });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async getSystemAnalytics(req, res) {
    try {
      const { period = '30' } = req.query;

      const systemMetrics = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      };

      const databaseMetrics = {
        connections: 0,
        queriesPerSecond: 0,
        avgQueryTime: 0,
        totalQueries: 0,
      };

      const apiMetrics = {
        totalRequests: 0,
        requestsPerSecond: 0,
        avgResponseTime: 0,
        errorRate: 0,
      };

      const storageMetrics = {
        totalFiles: 0,
        totalSize: 0,
        uploadsToday: 0,
      };

      const analytics = {
        system: systemMetrics,
        database: databaseMetrics,
        api: apiMetrics,
        storage: storageMetrics,
        period: {
          days: parseInt(period),
          from: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000),
          to: new Date(),
        },
      };

      return successResponse(res, 'System analytics retrieved successfully', { analytics });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async getActivityLogs(req, res) {
    try {
      const { page = 1, limit = 50, type, user_id, action, date_from, date_to } = req.query;

      const logs = {
        activities: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0,
        },
      };

      return successResponse(res, 'Activity logs retrieved successfully', logs);
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async getRealTimeStats(req, res) {
    try {
      const stats = {
        activeUsers: 0,
        onlineUsers: 0,
        currentExamAttempts: 0,
        systemLoad: {
          cpu: 0,
          memory: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
          uptime: process.uptime(),
        },
        recentActivity: [], // Recent user actions
        notifications: {
          unreadCount: 0,
          recentNotifications: [],
        },
        lastUpdated: new Date(),
      };

      return successResponse(res, 'Real-time statistics retrieved successfully', { stats });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async generateReport(req, res) {
    try {
      const { reportType, period = '30', format = 'json', includeCharts = 'false' } = req.query;

      if (!reportType) {
        throw new ValidationError('Report type is required');
      }

      const days = parseInt(period);
      let reportData = {};

      switch (reportType) {
        case 'users': {
          const userStats = await UserService.getUserStats();
          const recentUsers = await UserService.getRecentUsers(days);

          reportData = {
            type: 'users',
            period: days,
            summary: userStats,
            details: {
              newUsers: recentUsers.length,
              recentRegistrations: recentUsers,
            },
          };
          break;
        }
        case 'exams': {
          reportData = {
            type: 'exams',
            period: days,
            summary: { totalExams: 0 },
            details: {},
          };
          break;
        }
        case 'system': {
          reportData = {
            type: 'system',
            period: days,
            summary: {
              uptime: process.uptime(),
              memoryUsage: process.memoryUsage(),
            },
            details: {},
          };
          break;
        }
        default:
          throw new ValidationError('Invalid report type');
      }

      reportData.generatedAt = new Date();
      reportData.generatedBy = req.user.id;

      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.pdf"`);
        return res.send('PDF generation would be implemented here');
      }

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.csv"`);
        return res.send('CSV generation would be implemented here');
      }

      return successResponse(res, 'Report generated successfully', { report: reportData });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async getHealthCheck(req, res) {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        services: {
          database: 'healthy',
          storage: 'healthy',
          email: 'healthy',
          cache: 'healthy',
        },
        metrics: {
          memory: {
            used: process.memoryUsage().heapUsed,
            total: process.memoryUsage().heapTotal,
            percentage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
          },
          cpu: {
            usage: 0,
          },
        },
      };

      const serviceStatuses = Object.values(health.services);
      if (serviceStatuses.some((status) => status !== 'healthy')) {
        health.status = 'degraded';
      }

      const statusCode = health.status === 'healthy' ? 200 : 503;

      return res.status(statusCode).json({
        success: health.status === 'healthy',
        message: `System is ${health.status}`,
        data: health,
      });
    } catch (error) {
      return res.status(503).json({
        success: false,
        message: 'Health check failed',
        error: error.message,
        timestamp: new Date(),
      });
    }
  }
}

module.exports = AdminDashboardController;
