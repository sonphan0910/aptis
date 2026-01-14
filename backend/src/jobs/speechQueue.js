
const SpeechToTextService = require('../services/SpeechToTextService');
const { AttemptAnswer } = require('../models');

// Hàng đợi xử lý chuyển đổi giọng nói sang văn bản (lưu trong RAM)
const queue = [];
let isProcessing = false;

/**
 * Thêm một job chuyển đổi giọng nói sang văn bản vào hàng đợi
 * @param {Object} jobData - Dữ liệu job (answerId, audioUrl, ...)
 * @returns {number} id của job vừa thêm
 */
function addSpeechJob(jobData) {
  // Tạo job mới với thông tin, số lần thử tối đa là 3
  const job = {
    id: Date.now() + Math.random(), // Tạo id duy nhất
    data: jobData,
    attempts: 0, // Số lần thử
    maxAttempts: 3, // Số lần thử tối đa
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
 * Tự động thử lại nếu chuyển đổi thất bại, tối đa 3 lần
 */
async function processQueue() {
  if (isProcessing || queue.length === 0) {
    return;
  }
  isProcessing = true;
  while (queue.length > 0) {
    const job = queue[0];
    try {
      // Thực hiện chuyển đổi giọng nói sang văn bản
      const transcription = await processJob(job);
      // Cập nhật kết quả vào bảng AttemptAnswer
      await AttemptAnswer.update(
        { transcribed_text: transcription },
        { where: { id: job.data.answerId } },
      );
      queue.shift(); // Xoá job khỏi hàng đợi
      // Có thể thông báo cho hàng đợi chấm điểm AI xử lý tiếp
    } catch (error) {
      job.attempts++;
      if (job.attempts >= job.maxAttempts) {
        // Nếu quá số lần thử thì xoá khỏi hàng đợi và đánh dấu answer cần chấm tay
        queue.shift();
        try {
          await AttemptAnswer.update(
            { 
              transcribed_text: '[Transcription failed]',
              needs_review: true,
              ai_feedback: 'Không thể chuyển đổi giọng nói thành văn bản. Cần chấm thủ công.'
            },
            { where: { id: job.data.answerId } },
          );
        } catch (updateError) {
          // Nếu cập nhật thất bại thì log lỗi
        }
      } else {
        // Nếu chưa quá số lần thử thì chuyển job về cuối hàng đợi để thử lại sau
        queue.shift();
        queue.push(job);
        // Đợi 10 giây trước khi thử lại
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }
  }
  isProcessing = false;
}

/**
 * Xử lý từng job chuyển đổi giọng nói sang văn bản
 * @param {Object} job - Job cần xử lý
 * @returns {string} kết quả chuyển đổi (transcription)
 */
async function processJob(job) {
  const { answerId, audioUrl, language = 'en' } = job.data;
  // Gọi service chuyển đổi audio sang text
  const transcription = await SpeechToTextService.convertAudioToText(audioUrl, language);
  return transcription;
}

/**
 * Lấy trạng thái hàng đợi
 * Trả về số lượng job, trạng thái xử lý và thông tin từng job
 */
function getQueueStatus() {
  return {
    queueLength: queue.length,
    isProcessing,
    jobs: queue.map((j) => ({
      id: j.id,
      answerId: j.data.answerId,
      attempts: j.attempts,
      createdAt: j.createdAt,
    })),
  };
}

/**
 * Xoá toàn bộ hàng đợi
 * Dừng xử lý các job hiện tại
 */
function clearQueue() {
  queue.length = 0;
  isProcessing = false;
}

module.exports = {
  addSpeechJob,
  getQueueStatus,
  clearQueue,
};
