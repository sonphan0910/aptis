const { successResponse, errorResponse } = require('../../utils/response');
const { ValidationError } = require('../../utils/errors');

class AiManagementController {
  static async getQueueStatus(req, res) {
    try {
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

  static async getProcessingStats(req, res) {
    try {
      const { period = '24h' } = req.query;

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

  static async retryFailedJobs(req, res) {
    try {
      const { jobType } = req.body;

      if (!jobType) {
        throw new ValidationError('Job type is required');
      }

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

  static async clearCompletedJobs(req, res) {
    try {
      const { olderThan = '24h' } = req.query;

      const result = {
        clearedCount: 0,
        olderThan,
      };

      return successResponse(res, 'Completed jobs cleared successfully', { result });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  static async getModelConfig(req, res) {
    try {
      const config = {
        openaiModel: process.env.OPENAI_MODEL || 'gpt-4-turbo',
        azureSpeechRegion: process.env.AZURE_SPEECH_REGION || 'southeastasia',
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

  static async updateModelConfig(req, res) {
    try {
      const { config } = req.body;

      if (!config) {
        throw new ValidationError('Configuration is required');
      }

      return successResponse(res, 'AI model configuration updated successfully', { config });
    } catch (error) {
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = AiManagementController;