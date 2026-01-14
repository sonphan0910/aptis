
const EmailService = require('../services/EmailService');

// Hàng đợi email lưu trong bộ nhớ (RAM)
const queue = [];
let isProcessing = false;

/**
 * Thêm một job gửi email vào hàng đợi
 * @param {Object} emailData - Dữ liệu email cần gửi
 * @returns {number} id của job vừa thêm
 */
function addEmailJob(emailData) {
  // Tạo job mới với thông tin, số lần thử tối đa là 5
  const job = {
    id: Date.now() + Math.random(), // Tạo id duy nhất
    data: emailData,
    attempts: 0, // Số lần thử gửi
    maxAttempts: 5, // Số lần thử tối đa
    createdAt: new Date(),
    status: 'pending', // Trạng thái ban đầu
  };
  queue.push(job); // Đưa job vào hàng đợi
  // Nếu chưa chạy xử lý thì bắt đầu xử lý
  if (!isProcessing) {
    processQueue();
  }
  return job.id;
}

/**
 * Xử lý các job trong hàng đợi
 * Tự động thử lại nếu gửi thất bại, tối đa 5 lần
 */
async function processQueue() {
  if (isProcessing || queue.length === 0) {
    return;
  }
  isProcessing = true;
  while (queue.length > 0) {
    const job = queue[0];
    try {
      // Thử gửi email
      await processJob(job);
      // Nếu gửi thành công thì xoá khỏi hàng đợi
      queue.shift();
    } catch (error) {
      // Nếu gửi thất bại thì tăng số lần thử
      job.attempts++;
      if (job.attempts >= job.maxAttempts) {
        // Nếu quá số lần thử thì xoá khỏi hàng đợi và log lỗi
        queue.shift();
      } else {
        // Nếu chưa quá số lần thử thì chuyển job về cuối hàng đợi để thử lại sau
        queue.shift();
        queue.push(job);
        // Đợi 3 giây trước khi thử lại
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }
  isProcessing = false;
}

/**
 * Xử lý từng job gửi email
 * Tuỳ theo loại email sẽ gọi hàm gửi tương ứng
 */
async function processJob(job) {
  const { type, to, subject, html, data } = job.data;
  if (type === 'welcome') {
    await EmailService.sendWelcomeEmail(to, data.fullName, data.tempPassword);
  } else if (type === 'reset-password') {
    await EmailService.sendResetPasswordEmail(to, data.fullName, data.tempPassword);
  } else if (type === 'exam-published') {
    await EmailService.sendExamPublishedEmail(to, data.fullName, data.exam);
  } else if (type === 'exam-graded') {
    await EmailService.sendExamGradedEmail(to, data.fullName, data.exam, data.score);
  } else if (type === 'custom') {
    await EmailService.sendEmail({ to, subject, html });
  } else {
    throw new Error(`Unknown email type: ${type}`); // Loại email không hợp lệ
  }
}

/**
 * Lấy trạng thái hàng đợi email
 * Trả về số lượng job, trạng thái xử lý và thông tin từng job
 */
function getQueueStatus() {
  return {
    queueLength: queue.length,
    isProcessing,
    jobs: queue.map((j) => ({
      id: j.id,
      type: j.data.type,
      to: j.data.to,
      attempts: j.attempts,
      createdAt: j.createdAt,
    })),
  };
}

/**
 * Xoá toàn bộ hàng đợi email
 * Dừng xử lý các job hiện tại
 */
function clearQueue() {
  queue.length = 0;
  isProcessing = false;
}

module.exports = {
  addEmailJob,
  getQueueStatus,
  clearQueue,
};
