const StorageService = require('../services/StorageService');
const { Op } = require('sequelize');
const { ExamAttempt } = require('../models');

/**
 * Cleanup old files
 */
async function cleanupOldFiles() {
  try {
    console.log('[CleanupJob] Starting cleanup of old files...');

    // Delete files older than 90 days
    const deletedCount = await StorageService.cleanupOldFiles(90);

    console.log(`[CleanupJob] Deleted ${deletedCount} old files`);

    return { deletedFiles: deletedCount };
  } catch (error) {
    console.error('[CleanupJob] Cleanup failed:', error);
    throw error;
  }
}

/**
 * Cleanup incomplete attempts
 */
async function cleanupIncompleteAttempts() {
  try {
    console.log('[CleanupJob] Starting cleanup of incomplete attempts...');

    // Find attempts older than 24 hours that are still in_progress
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const incompleteAttempts = await ExamAttempt.findAll({
      where: {
        status: 'in_progress',
        start_time: {
          [Op.lt]: oneDayAgo,
        },
      },
    });

    // Mark as abandoned
    for (const attempt of incompleteAttempts) {
      await attempt.update({
        status: 'abandoned',
        end_time: new Date(),
      });
    }

    console.log(`[CleanupJob] Marked ${incompleteAttempts.length} attempts as abandoned`);

    return { abandonedAttempts: incompleteAttempts.length };
  } catch (error) {
    console.error('[CleanupJob] Cleanup incomplete attempts failed:', error);
    throw error;
  }
}

/**
 * Get storage statistics
 */
async function getStorageStats() {
  try {
    const stats = await StorageService.getStorageStats();
    console.log('[CleanupJob] Storage stats:', stats);
    return stats;
  } catch (error) {
    console.error('[CleanupJob] Failed to get storage stats:', error);
    throw error;
  }
}

/**
 * Schedule cleanup jobs
 */
function scheduleCleanupJobs() {
  console.log('[CleanupJob] Scheduling periodic cleanup jobs...');

  // Run cleanup daily at 3 AM
  const scheduleDaily = () => {
    const now = new Date();
    const next3AM = new Date(now);
    next3AM.setHours(3, 0, 0, 0);

    if (next3AM <= now) {
      next3AM.setDate(next3AM.getDate() + 1);
    }

    const msUntil3AM = next3AM.getTime() - now.getTime();

    setTimeout(async () => {
      await runDailyCleanup();
      scheduleDaily(); // Schedule next run
    }, msUntil3AM);

    console.log(`[CleanupJob] Next cleanup scheduled at ${next3AM.toISOString()}`);
  };

  scheduleDaily();

  // Run storage stats every hour
  setInterval(
    async () => {
      await getStorageStats();
    },
    60 * 60 * 1000,
  ); // 1 hour
}

/**
 * Run daily cleanup
 */
async function runDailyCleanup() {
  console.log('[CleanupJob] Running daily cleanup...');

  try {
    const fileCleanup = await cleanupOldFiles();
    const attemptCleanup = await cleanupIncompleteAttempts();
    const stats = await getStorageStats();

    console.log('[CleanupJob] Daily cleanup completed:', {
      ...fileCleanup,
      ...attemptCleanup,
      stats,
    });
  } catch (error) {
    console.error('[CleanupJob] Daily cleanup failed:', error);
  }
}

module.exports = {
  cleanupOldFiles,
  cleanupIncompleteAttempts,
  getStorageStats,
  scheduleCleanupJobs,
  runDailyCleanup,
};
