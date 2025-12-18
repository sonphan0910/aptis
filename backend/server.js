require('dotenv').config();
const app = require('./src/app');
const { sequelize, testConnection } = require('./src/config/database');
const { scheduleCleanupJobs } = require('./src/jobs/cleanupQueue');
const SpeechToTextService = require('./src/services/SpeechToTextService');

const PORT = process.env.PORT || 3000;

// Start server
async function startServer() {
  try {
    // Test database connection
    console.log('[Server] Testing database connection...');
    await testConnection();
    console.log('[Server] Database connected successfully');
    
    // Sync database (use carefully in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Server] Syncing database...');
      await sequelize.sync({ alter: false });
      console.log('[Server] Database synced');
    }
    
    // Initialize Whisper for speech-to-text
    console.log('[Server] Initializing Whisper model...');
    await SpeechToTextService.initializeWhisper();
    console.log('[Server] Whisper model initialized');
    
    // Schedule cleanup jobs
    console.log('[Server] Scheduling cleanup jobs...');
    scheduleCleanupJobs();
    
    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`[Server] Server is running on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/health`);
    });
    
    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n[Server] ${signal} received, shutting down gracefully...`);
      
      server.close(async () => {
        console.log('[Server] HTTP server closed');
        
        try {
          await sequelize.close();
          console.log('[Server] Database connection closed');
          process.exit(0);
        } catch (error) {
          console.error('[Server] Error during shutdown:', error);
          process.exit(1);
        }
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('[Server] Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };
    
    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('[Server] Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
    });
    
  } catch (error) {
    console.error('[Server] Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
