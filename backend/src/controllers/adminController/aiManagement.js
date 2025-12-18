const { successResponse, errorResponse } = require('../../utils/response');
const { ValidationError } = require('../../utils/errors');

/**
 * Admin AI Management Controller
 * Handles AI queue monitoring and management operations
 */
class AiManagementController {
  /**
   * Get AI queue status
   * Note: Scoring queue has been removed in favor of synchronous scoring
   */
  static async getQueueStatus(req, res) {
    try {
      // Queue status - scoring queue no longer used (sync scoring instead)
      const queueStatus = {
        scoringQueue: {
          status: 'disabled',
          reason: 'Replaced with synchronous scoring on submit',
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
        },
        speechQueue: {
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
        },
        emailQueue: {
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
        },
        systemHealth: {
          aiService: 'healthy',
          speechService: 'healthy',
          emailService: 'healthy',
        },
      };

      return successResponse(res, 'AI queue status retrieved successfully', { queueStatus });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get AI processing statistics
   */
  static async getProcessingStats(req, res) {
    try {
      const { period = '24h' } = req.query;

      // Placeholder for AI processing statistics
      const stats = {
        period,
        totalProcessed: 0,
        averageProcessingTime: 0,
        successRate: 0,
        errorRate: 0,
        breakdown: {
          writing: {
            processed: 0,
            averageTime: 0,
            successRate: 0,
          },
          speaking: {
            processed: 0,
            averageTime: 0,
            successRate: 0,
          },
        },
      };

      return successResponse(res, 'AI processing stats retrieved successfully', { stats });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Retry failed AI jobs
   */
  static async retryFailedJobs(req, res) {
    try {
      const { jobType } = req.body;

      if (!jobType) {
        throw new ValidationError('Job type is required');
      }

      // Placeholder for retrying failed jobs
      const result = {
        jobType,
        retriedCount: 0,
        successCount: 0,
        failedCount: 0,
      };

      return successResponse(res, 'Failed jobs retried successfully', { result });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Clear completed jobs
   */
  static async clearCompletedJobs(req, res) {
    try {
      const { olderThan = '24h' } = req.query;

      // Placeholder for clearing completed jobs
      const result = {
        clearedCount: 0,
        olderThan,
      };

      return successResponse(res, 'Completed jobs cleared successfully', { result });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Get AI model configuration
   */
  static async getModelConfig(req, res) {
    try {
      // Placeholder for AI model configuration
      const config = {
        geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
        whisperModel: process.env.WHISPER_MODEL || 'tiny',
        maxRetries: 3,
        timeout: 30000,
        scoringCriteria: {
          writing: {
            maxTokens: 2000,
            temperature: 0.3,
          },
          speaking: {
            maxTokens: 1500,
            temperature: 0.3,
          },
        },
      };

      return successResponse(res, 'AI model configuration retrieved successfully', { config });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Update AI model configuration
   */
  static async updateModelConfig(req, res) {
    try {
      const { config } = req.body;

      if (!config) {
        throw new ValidationError('Configuration is required');
      }

      // Placeholder for updating AI model configuration
      // In real implementation, this would update configuration files
      // and restart AI services if needed

      return successResponse(res, 'AI model configuration updated successfully', { config });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = AiManagementController;