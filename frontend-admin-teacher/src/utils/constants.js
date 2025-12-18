// Vai trò người dùng
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

// Loại APTIS
export const APTIS_TYPES = {
  GENERAL: 'general',
  ADVANCED: 'advanced'
};

// Kỹ năng
export const SKILLS = {
  LISTENING: 'listening',
  READING: 'reading',
  WRITING: 'writing',
  SPEAKING: 'speaking'
};

// Loại câu hỏi
export const QUESTION_TYPES = {
  MCQ: 'mcq',
  MATCHING: 'matching',
  GAP_FILLING: 'gap_filling',
  ORDERING: 'ordering',
  WRITING: 'writing',
  SPEAKING: 'speaking'
};

// Độ khó
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// Trạng thái
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
  PUBLISHED: 'published',
  PENDING: 'pending',
  COMPLETED: 'completed',
  GRADED: 'graded'
};

// Loại thông báo
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Format file cho export
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json'
};

// Giới hạn file upload
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_AUDIO_TYPES: ['audio/mp3', 'audio/wav', 'audio/ogg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Thiết lập bảng
export const TABLE_SETTINGS = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
};

// Thiết lập mặc định cho câu hỏi
export const DEFAULT_QUESTION_SETTINGS = {
  MCQ_OPTIONS_COUNT: 4,
  MATCHING_PAIRS_COUNT: 4,
  ORDERING_ITEMS_COUNT: 4,
  WRITING_MIN_WORDS: 150,
  WRITING_MAX_WORDS: 300,
  SPEAKING_RECORDING_TIME: 60,
  SPEAKING_PREPARATION_TIME: 30
};

// Màu sắc cho chart
export const CHART_COLORS = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  SUCCESS: '#2e7d32',
  WARNING: '#ed6c02',
  ERROR: '#d32f2f',
  INFO: '#0288d1'
};

// Thời gian cache (ms)
export const CACHE_DURATIONS = {
  SHORT: 5 * 60 * 1000, // 5 phút
  MEDIUM: 30 * 60 * 1000, // 30 phút
  LONG: 2 * 60 * 60 * 1000 // 2 giờ
};