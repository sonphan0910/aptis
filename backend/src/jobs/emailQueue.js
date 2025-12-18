const EmailService = require('../services/EmailService');

// In-memory queue
const queue = [];
let isProcessing = false;

/**
 * Add email job to queue
 */
function addEmailJob(emailData) {
  const job = {
    id: Date.now() + Math.random(),
    data: emailData,
    attempts: 0,
    maxAttempts: 5,
    createdAt: new Date(),
    status: 'pending',
  };

  queue.push(job);
  console.log(`[EmailQueue] Job ${job.id} added to queue (${queue.length} jobs)`);

  // Start processing if not already running
  if (!isProcessing) {
    processQueue();
  }

  return job.id;
}

/**
 * Process queue
 */
async function processQueue() {
  if (isProcessing || queue.length === 0) {
    return;
  }

  isProcessing = true;

  while (queue.length > 0) {
    const job = queue[0];

    try {
      console.log(
        `[EmailQueue] Processing job ${job.id} (attempt ${job.attempts + 1}/${job.maxAttempts})`,
      );

      await processJob(job);

      // Job succeeded
      queue.shift();
      console.log(`[EmailQueue] Job ${job.id} completed successfully`);
    } catch (error) {
      console.error(`[EmailQueue] Job ${job.id} failed:`, error.message);

      job.attempts++;

      if (job.attempts >= job.maxAttempts) {
        // Max attempts reached
        queue.shift();
        console.error(
          `[EmailQueue] Job ${job.id} failed permanently after ${job.maxAttempts} attempts`,
        );
      } else {
        // Retry later
        queue.shift();
        queue.push(job);

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  isProcessing = false;
}

/**
 * Process individual job
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
    throw new Error(`Unknown email type: ${type}`);
  }
}

/**
 * Get queue status
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
 * Clear queue
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
