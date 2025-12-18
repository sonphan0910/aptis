const SpeechToTextService = require('../services/SpeechToTextService');
const { AttemptAnswer } = require('../models');

// In-memory queue
const queue = [];
let isProcessing = false;

/**
 * Add speech-to-text job to queue
 */
function addSpeechJob(jobData) {
  const job = {
    id: Date.now() + Math.random(),
    data: jobData,
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date(),
    status: 'pending',
  };

  queue.push(job);
  console.log(`[SpeechQueue] Job ${job.id} added to queue (${queue.length} jobs)`);

  // Start processing
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
        `[SpeechQueue] Processing job ${job.id} (attempt ${job.attempts + 1}/${job.maxAttempts})`,
      );

      const transcription = await processJob(job);

      // Update answer with transcription
      await AttemptAnswer.update(
        { transcribed_text: transcription },
        { where: { id: job.data.answerId } },
      );

      queue.shift();
      console.log(
        `[SpeechQueue] Job ${job.id} completed - transcribed ${transcription.length} chars`,
      );

      // Notify that transcription is complete (scoring queue can now process it)
      console.log(`[SpeechQueue] Transcription complete for answer ${job.data.answerId}. Ready for AI scoring.`);
      
    } catch (error) {
      console.error(`[SpeechQueue] Job ${job.id} failed:`, error.message);

      job.attempts++;

      if (job.attempts >= job.maxAttempts) {
        queue.shift();
        console.error(`[SpeechQueue] Job ${job.id} failed permanently`);

        // Mark answer as failed
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
          console.error('[SpeechQueue] Failed to update answer:', updateError);
        }
      } else {
        // Retry
        queue.shift();
        queue.push(job);
        await new Promise((resolve) => setTimeout(resolve, 10000)); // 10s delay
      }
    }
  }

  isProcessing = false;
}

/**
 * Process individual job
 */
async function processJob(job) {
  const { answerId, audioUrl, language = 'en' } = job.data;

  console.log(`[SpeechQueue] Transcribing audio for answer ${answerId}`);

  const transcription = await SpeechToTextService.convertAudioToText(audioUrl, language);

  return transcription;
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
      answerId: j.data.answerId,
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
  addSpeechJob,
  getQueueStatus,
  clearQueue,
};
