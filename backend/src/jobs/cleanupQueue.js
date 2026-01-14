
const StorageService = require('../services/StorageService');
const { Op } = require('sequelize');
const { ExamAttempt } = require('../models');

/**
 * Hàm dọn dẹp file cũ (quá hạn)
 * Xoá các file lưu trữ quá 90 ngày
 */
async function cleanupOldFiles() {
  try {
    // Gọi service xoá file cũ, trả về số lượng file đã xoá
    const deletedCount = await StorageService.cleanupOldFiles(90);
    return { deletedFiles: deletedCount };
  } catch (error) {
    throw error;
  }
}

/**
 * Hàm dọn dẹp các lượt làm bài chưa hoàn thành
 * Đánh dấu các attempt "in_progress" quá 24h thành "abandoned"
 */
async function cleanupIncompleteAttempts() {
  try {
    // Tìm các attempt chưa hoàn thành quá 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const incompleteAttempts = await ExamAttempt.findAll({
      where: {
        status: 'in_progress',
        start_time: {
          [Op.lt]: oneDayAgo,
        },
      },
    });
    // Đánh dấu các attempt này là "abandoned"
    for (const attempt of incompleteAttempts) {
      await attempt.update({
        status: 'abandoned',
        end_time: new Date(),
      });
    }
    return { abandonedAttempts: incompleteAttempts.length };
  } catch (error) {
    throw error;
  }
}

/**
 * Hàm lấy thống kê dung lượng lưu trữ
 */
async function getStorageStats() {
  try {
    const stats = await StorageService.getStorageStats();
    return stats;
  } catch (error) {
    throw error;
  }
}

/**
 * Hàm lên lịch chạy các job dọn dẹp định kỳ
 * - Dọn dẹp file và attempt mỗi ngày lúc 3h sáng
 * - Lấy thống kê storage mỗi giờ
 */
function scheduleCleanupJobs() {
  // Hàm lên lịch chạy cleanup lúc 3h sáng mỗi ngày
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
      scheduleDaily(); // Lên lịch lần tiếp theo
    }, msUntil3AM);
  };
  scheduleDaily();
  // Lấy thống kê storage mỗi giờ
  setInterval(
    async () => {
      await getStorageStats();
    },
    60 * 60 * 1000,
  ); // 1 giờ
}

/**
 * Hàm thực thi dọn dẹp hàng ngày
 * Gồm: xoá file cũ, đánh dấu attempt bỏ dở, lấy thống kê storage
 */
async function runDailyCleanup() {
  try {
    const fileCleanup = await cleanupOldFiles();
    const attemptCleanup = await cleanupIncompleteAttempts();
    const stats = await getStorageStats();
    // Có thể log hoặc gửi thông báo về kết quả dọn dẹp tại đây nếu cần
  } catch (error) {
    // Có thể log hoặc gửi thông báo lỗi tại đây nếu cần
  }
}

module.exports = {
  cleanupOldFiles,
  cleanupIncompleteAttempts,
  getStorageStats,
  scheduleCleanupJobs,
  runDailyCleanup,
};
