const { pipeline } = require('@xenova/transformers');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const { promisify } = require('util');
const { WHISPER_CONFIG, UPLOAD_LIMITS } = require('../utils/constants');
const { STORAGE_CONFIG } = require('../config/storage');
const { BadRequestError } = require('../utils/errors');

/**
 * SpeechToTextService - Handles audio transcription using Xenova Transformers (offline)
 * Uses Whisper model via @xenova/transformers
 */
class SpeechToTextService {
  constructor() {
    this.transcriber = null;
    this.modelLoaded = false;
  }

  /**
   * Initialize Whisper model (load once, keep in memory)
   */
  async initializeWhisper() {
    if (this.modelLoaded) {
      return;
    }

    try {
      console.log('🔄 Loading Whisper model...');

      // Load Whisper model via @xenova/transformers
      // This will download and cache the model locally
      const modelName = `Xenova/whisper-${process.env.WHISPER_MODEL || 'tiny'}`;
      this.transcriber = await pipeline(
        'automatic-speech-recognition',
        modelName, // Using configurable model size
      );

      this.modelLoaded = true;
      console.log('✅ Whisper model loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load Whisper model:', error);
      throw error;
    }
  }

  /**
   * Convert audio file to raw Float32Array data using ffmpeg
   */
  async convertAudioToRawData(audioFilePath) {
    return new Promise((resolve, reject) => {
      const ffmpegProcess = spawn('ffmpeg', [
        '-i', audioFilePath,
        '-vn', // no video
        '-acodec', 'pcm_f32le', // PCM float 32-bit little-endian
        '-ar', WHISPER_CONFIG.SAMPLING_RATE.toString(), // sampling rate
        '-ac', '1', // mono
        '-f', 'f32le', // output format
        'pipe:1' // output to stdout
      ]);

      const chunks = [];
      
      ffmpegProcess.stdout.on('data', (chunk) => {
        chunks.push(chunk);
      });

      ffmpegProcess.stderr.on('data', (data) => {
        // FFmpeg outputs info to stderr, ignore unless error
        console.log(`FFmpeg: ${data}`);
      });

      ffmpegProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`FFmpeg exited with code ${code}`));
          return;
        }

        try {
          const buffer = Buffer.concat(chunks);
          // Convert buffer to Float32Array
          const float32Array = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.length / 4);
          resolve(float32Array);
        } catch (error) {
          reject(error);
        }
      });

      ffmpegProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Convert audio file to text
   */
  async convertAudioToText(audioFilePath, language = 'en') {
    try {
      // Initialize Whisper if not loaded
      await this.initializeWhisper();

      // Check if file exists
      const fileExists = await fs
        .access(audioFilePath)
        .then(() => true)
        .catch(() => false);
      if (!fileExists) {
        throw new BadRequestError('Audio file not found');
      }

      // Check file size
      const stats = await fs.stat(audioFilePath);
      if (stats.size > UPLOAD_LIMITS.MAX_AUDIO_SIZE) {
        throw new BadRequestError('Audio file too large');
      }

      console.log('🎙️ Transcribing audio:', path.basename(audioFilePath));

      // Temporary mock transcription for testing (will be replaced with actual audio processing)
      const mockTranscription = "This is a mock transcription for testing purposes. The user spoke about their thoughts on the given topic.";
      console.log('🧪 Using mock transcription for testing');

      // Transcribe with timeout - auto-detect language
      const transcriptionPromise = Promise.resolve({ text: mockTranscription });

      // Remove FFmpeg dependency for now
      // const audioData = await this.convertAudioToRawData(audioFilePath);
      // const transcriptionPromise = this.transcriber(audioData, {
      //   return_timestamps: false, // We only need text
      // });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Transcription timeout')), WHISPER_CONFIG.TIMEOUT),
      );

      const result = await Promise.race([transcriptionPromise, timeoutPromise]);

      if (!result || !result.text) {
        throw new Error('No transcription result');
      }

      const transcribedText = result.text.trim();

      console.log('✅ Transcription complete:', transcribedText.substring(0, 50) + '...');

      return transcribedText;
    } catch (error) {
      console.error('❌ Transcription failed:', error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }

  /**
   * Upload audio file and return URL + duration
   */
  async uploadAudioFile(file) {
    try {
      if (!file) {
        throw new BadRequestError('No audio file provided');
      }

      // File is already saved by multer
      const relativePath = file.path.replace(STORAGE_CONFIG.basePath, '').replace(/\\/g, '/');
      const url = `/uploads${relativePath}`;

      // Get audio duration (basic implementation)
      const stats = await fs.stat(file.path);
      const duration = Math.ceil(stats.size / 16000); // Rough estimation (16kHz sample rate)

      return {
        url,
        path: file.path,
        duration,
        size: stats.size,
      };
    } catch (error) {
      console.error('❌ Failed to upload audio:', error);
      throw error;
    }
  }

  /**
   * Delete audio file
   */
  async deleteAudioFile(filePath) {
    try {
      const fileExists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      if (fileExists) {
        await fs.unlink(filePath);
      }
    } catch (error) {
      console.error('❌ Failed to delete audio file:', error);
      throw error;
    }
  }

  /**
   * Validate audio file
   */
  validateAudioFile(file) {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'];

    if (!file) {
      throw new BadRequestError('No audio file provided');
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestError(`Invalid audio format. Allowed: ${allowedTypes.join(', ')}`);
    }

    if (file.size > UPLOAD_LIMITS.MAX_AUDIO_SIZE) {
      throw new BadRequestError(
        `Audio file too large. Max size: ${UPLOAD_LIMITS.MAX_AUDIO_SIZE / 1024 / 1024}MB`,
      );
    }

    return true;
  }

  /**
   * Get transcription status for an answer
   */
  async getTranscriptionStatus(answerId) {
    const answer = await require('../models').AttemptAnswer.findByPk(answerId);

    if (!answer) {
      throw new BadRequestError('Answer not found');
    }

    return {
      hasAudio: !!answer.audio_url,
      isTranscribed: !!answer.transcribed_text,
      transcribedText: answer.transcribed_text,
    };
  }
}

module.exports = new SpeechToTextService();
