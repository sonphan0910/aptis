/**
 * Application constants
 */

// User roles
const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

// User status
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned',
};

// Question difficulty levels
const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

// Question status
const QUESTION_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

// Exam status
const EXAM_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

// Attempt types
const ATTEMPT_TYPES = {
  FULL_EXAM: 'full_exam',
  SINGLE_SKILL: 'single_skill',
};

// Attempt status
const ATTEMPT_STATUS = {
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  REVIEWED: 'reviewed',
};

// Section status
const SECTION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

// Answer types
const ANSWER_TYPES = {
  OPTION: 'option',
  TEXT: 'text',
  AUDIO: 'audio',
  JSON: 'json',
};

// Scoring methods
const SCORING_METHODS = {
  AUTO: 'auto',
  AI: 'ai',
  MANUAL: 'manual',
};

// Skill codes (must match seed data)
const SKILL_CODES = {
  GRAMMAR_VOCABULARY: 'grammar_vocabulary',
  READING: 'reading',
  WRITING: 'writing',
  LISTENING: 'listening',
  SPEAKING: 'speaking',
};

// Question type codes (examples, must match seed data)
const QUESTION_TYPE_CODES = {
  MCQ_GRAMMAR: 'mcq_grammar',
  FILL_BLANKS: 'fill_blanks',
  MCQ_READING: 'mcq_reading',
  SHORT_ANSWER: 'short_answer',
  LONG_ANSWER: 'long_answer',
  ESSAY: 'essay',
  MCQ_LISTENING: 'mcq_listening',
  GAP_FILLING: 'gap_filling',
  SHORT_RECORDING: 'short_recording',
  LONG_RECORDING: 'long_recording',
  MATCHING: 'matching',
  ORDERING: 'ordering',
};

// APTIS type codes (must match seed data)
const APTIS_TYPE_CODES = {
  GENERAL: 'aptis_general',
  ADVANCED: 'aptis_advanced',
  FOR_TEACHERS: 'aptis_for_teachers',
  FOR_TEENS: 'aptis_for_teens',
};

// File upload limits
const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_AUDIO_SIZE: 20 * 1024 * 1024, // 20MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
};

// Whisper.js configuration
const WHISPER_CONFIG = {
  MODEL: process.env.WHISPER_MODEL || 'tiny',
  DEVICE: process.env.WHISPER_DEVICE || 'cpu',
  TIMEOUT: 120000, // 120 seconds
  LANGUAGE: 'en',
};

// AI Scoring configuration
const AI_SCORING_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  TIMEOUT: 30000, // 30 seconds
};

// JWT configuration constants
const JWT_CONSTANTS = {
  TOKEN_EXPIRY: '24h',
  REFRESH_TOKEN_EXPIRY: '7d',
  RESET_TOKEN_EXPIRY: '1h',
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Email configuration
const EMAIL_TYPES = {
  WELCOME: 'welcome',
  RESET_PASSWORD: 'reset_password',
  EXAM_PUBLISHED: 'exam_published',
  EXAM_GRADED: 'exam_graded',
};

module.exports = {
  USER_ROLES,
  USER_STATUS,
  DIFFICULTY_LEVELS,
  QUESTION_STATUS,
  EXAM_STATUS,
  ATTEMPT_TYPES,
  ATTEMPT_STATUS,
  SECTION_STATUS,
  ANSWER_TYPES,
  SCORING_METHODS,
  SKILL_CODES,
  QUESTION_TYPE_CODES,
  APTIS_TYPE_CODES,
  UPLOAD_LIMITS,
  WHISPER_CONFIG,
  AI_SCORING_CONFIG,
  JWT_CONSTANTS,
  PAGINATION,
  EMAIL_TYPES,
};
