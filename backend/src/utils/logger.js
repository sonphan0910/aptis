const winston = require('winston');
const path = require('path');

/**
 * Winston Logger Configuration
 * Supports different log levels and formats for development/production
 */

// Log format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  }),
);

// Log format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Create logs directory path
const logsDir = path.join(__dirname, '../../logs');

// Winston transports
const transports = [
  // Console transport (always active in development)
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: consoleFormat,
    silent: process.env.NODE_ENV === 'test', // Suppress logs during testing
  }),
];

// File transports (only in production)
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: {
    service: 'aptis-backend',
    version: process.env.npm_package_version || '1.0.0',
  },
  transports,

  // Handle uncaught exceptions
  exceptionHandlers:
    process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: path.join(logsDir, 'exceptions.log'),
            format: fileFormat,
          }),
        ]
      : [],

  // Exit on handled exception
  exitOnError: false,
});

/**
 * Logger utility functions
 */
class Logger {
  /**
   * Log info message
   */
  static info(message, meta = {}) {
    logger.info(message, meta);
  }

  /**
   * Log error message
   */
  static error(message, error = null, meta = {}) {
    const errorMeta = {
      ...meta,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
            statusCode: error.statusCode,
          }
        : null,
    };
    logger.error(message, errorMeta);
  }

  /**
   * Log warning message
   */
  static warn(message, meta = {}) {
    logger.warn(message, meta);
  }

  /**
   * Log debug message (only in development)
   */
  static debug(message, meta = {}) {
    logger.debug(message, meta);
  }

  /**
   * Log HTTP request
   */
  static logRequest(req, res, responseTime) {
    const meta = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.userId || 'anonymous',
    };

    const level = res.statusCode >= 400 ? 'warn' : 'info';
    const message = `${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`;

    logger.log(level, message, meta);
  }

  /**
   * Log authentication events
   */
  static logAuth(event, userId, details = {}) {
    const meta = {
      event,
      userId,
      timestamp: new Date().toISOString(),
      ...details,
    };

    logger.info(`Auth Event: ${event}`, meta);
  }

  /**
   * Log database operations
   */
  static logDatabase(operation, table, details = {}) {
    const meta = {
      operation,
      table,
      timestamp: new Date().toISOString(),
      ...details,
    };

    logger.debug(`Database: ${operation} on ${table}`, meta);
  }

  /**
   * Log background job events
   */
  static logJob(jobName, event, details = {}) {
    const meta = {
      job: jobName,
      event,
      timestamp: new Date().toISOString(),
      ...details,
    };

    logger.info(`Job: ${jobName} - ${event}`, meta);
  }

  /**
   * Log AI scoring events
   */
  static logAI(operation, answerId, details = {}) {
    const meta = {
      operation,
      answerId,
      timestamp: new Date().toISOString(),
      ...details,
    };

    logger.info(`AI Scoring: ${operation}`, meta);
  }

  /**
   * Log security events
   */
  static logSecurity(event, details = {}) {
    const meta = {
      event,
      timestamp: new Date().toISOString(),
      severity: 'HIGH',
      ...details,
    };

    logger.warn(`Security Alert: ${event}`, meta);
  }

  /**
   * Create child logger with context
   */
  static child(context) {
    return logger.child(context);
  }

  /**
   * Get raw winston logger (for advanced usage)
   */
  static get raw() {
    return logger;
  }
}

// Export both class and winston instance
module.exports = Logger;
module.exports.winston = logger;
