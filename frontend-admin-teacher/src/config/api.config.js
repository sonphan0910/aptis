// API configuration
const API_BASE_URL = 'http://localhost:3000/api';

console.log(`[API Config] API_BASE_URL = ${API_BASE_URL}`);

export { API_BASE_URL };

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REGISTER: '/auth/register',
  },

  // User endpoints 
  USERS: {
    PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    UPLOAD_AVATAR: '/users/profile/avatar',
  },

  // Admin endpoints
  ADMIN: {
    USERS: {
      LIST: '/admin/users',
      CREATE: '/admin/users',
      BY_ID: (userId) => `/admin/users/${userId}`,
      UPDATE: (userId) => `/admin/users/${userId}`,
      DELETE: (userId) => `/admin/users/${userId}`,
      RESET_PASSWORD: (userId) => `/admin/users/${userId}/reset-password`,
      BY_ROLE: (role) => `/admin/users/role/${role}`,
      STATS: '/admin/users/stats',
      RECENT: '/admin/users/recent',
      SEARCH: '/admin/users/search',
      EXPORT: '/admin/users/export',
    },
    EXAMS: {
      LIST: '/admin/exams',
      BY_ID: (examId) => `/admin/exams/${examId}`,
      UPDATE: (examId) => `/admin/exams/${examId}`,
      DELETE: (examId) => `/admin/exams/${examId}`,
      APPROVE: (examId) => `/admin/exams/${examId}/approve`,
      REJECT: (examId) => `/admin/exams/${examId}/reject`,
      STATS: '/admin/exams/stats',
      PENDING: '/admin/exams/pending',
    },
    REPORTS: {
      OVERVIEW: '/admin/reports/overview',
      USERS: '/admin/reports/users',
      EXAMS: '/admin/reports/exams',
      SYSTEM: '/admin/reports/system',
      ACTIVITIES: '/admin/reports/activities',
      REALTIME: '/admin/reports/realtime',
      GENERATE: '/admin/reports/generate',
      HEALTH: '/admin/health',
    },
    SYSTEM: {
      INFO: '/admin/system/info',
      CONFIG: '/admin/system/config',
      LOGS: '/admin/system/logs',
      BACKUP: '/admin/system/backup',
      BACKUP_STATUS: '/admin/system/backup/status',
      MAINTENANCE: '/admin/system/maintenance',
      DATABASE: '/admin/system/database',
      CACHE: '/admin/system/cache',
      SECURITY_AUDIT: '/admin/system/security/audit',
      CLEANUP: '/admin/system/cleanup',
      RESTART: '/admin/system/restart',
    },
    AI: {
      QUEUE_STATUS: '/admin/ai/queue/status',
      STATS: '/admin/ai/stats',
      RETRY: '/admin/ai/retry',
      CLEAR: '/admin/ai/clear',
      CONFIG: '/admin/ai/config',
    },
  },

  // Teacher endpoints
  TEACHER: {
    QUESTIONS: {
      LIST: '/teacher/questions',
      CREATE: '/teacher/questions',
      BY_ID: (questionId) => `/teacher/questions/${questionId}`,
      UPDATE: (questionId) => `/teacher/questions/${questionId}`,
      DELETE: (questionId) => `/teacher/questions/${questionId}`,
      DELETE_MULTIPLE: '/teacher/questions/bulk-delete',
      DUPLICATE: (questionId) => `/teacher/questions/${questionId}/duplicate`,
      IMPORT: '/teacher/questions/import',
      EXPORT: '/teacher/questions/export',
      TYPES: '/teacher/questions/types',
      CATEGORIES: '/teacher/questions/categories',
      BULK_UPDATE: '/teacher/questions/bulk-update',
      FILTER_OPTIONS: '/teacher/questions/filter-options',
      USAGE: (questionId) => `/teacher/questions/${questionId}/usage`,
    },
    EXAMS: {
      LIST: '/teacher/exams',
      CREATE: '/teacher/exams',
      BY_ID: (examId) => `/teacher/exams/${examId}`,
      UPDATE: (examId) => `/teacher/exams/${examId}`,
      DELETE: (examId) => `/teacher/exams/${examId}`,
      PUBLISH: (examId) => `/teacher/exams/${examId}/publish`,
      UNPUBLISH: (examId) => `/teacher/exams/${examId}/unpublish`,
      ADD_SECTION: (examId) => `/teacher/exams/${examId}/sections`,
      REMOVE_SECTION: (examId, sectionId) => `/teacher/exams/${examId}/sections/${sectionId}`,
      UPDATE_SECTION: (examId, sectionId) => `/teacher/exams/${examId}/sections/${sectionId}`,
      ADD_QUESTION_TO_SECTION: (examId, sectionId) => `/teacher/exams/${examId}/sections/${sectionId}/questions`,
      REMOVE_QUESTION_FROM_SECTION: (examId, sectionId, questionId) => `/teacher/exams/${examId}/sections/${sectionId}/questions/${questionId}`,
      UPDATE_QUESTION_IN_SECTION: (examId, sectionId, questionId) => `/teacher/exams/${examId}/sections/${sectionId}/questions/${questionId}`,
      DUPLICATE: (examId) => `/teacher/exams/${examId}/duplicate`,
      EXPORT: (examId) => `/teacher/exams/${examId}/export`,
    },
    CRITERIA: {
      LIST: '/teacher/criteria',
      CREATE: '/teacher/criteria',
      BY_ID: (criteriaId) => `/teacher/criteria/${criteriaId}`,
      UPDATE: (criteriaId) => `/teacher/criteria/${criteriaId}`,
      DELETE: (criteriaId) => `/teacher/criteria/${criteriaId}`,
      PREVIEW: (criteriaId) => `/teacher/criteria/${criteriaId}/preview`,
    },
    REVIEW: {
      PENDING: '/teacher/review/pending',
      ANSWER_DETAILS: (answerId) => `/teacher/review/answers/${answerId}`,
      SUBMIT_REVIEW: (answerId) => `/teacher/review/answers/${answerId}`,
      BY_EXAM: (examId) => `/teacher/review/exam/${examId}`,
    },
    REPORTS: {
      EXAM_STATISTICS: (examId) => `/teacher/reports/exam-statistics/${examId}`,
      STUDENT_STATISTICS: '/teacher/reports/student-statistics',
      STUDENT_REPORT: (studentId) => `/teacher/reports/student/${studentId}`,
      EXPORT: '/teacher/reports/export',
    },
  },

  // Student endpoints 
  STUDENT: {
    EXAMS: {
      LIST: '/student/exams',
      BY_ID: (examId) => `/student/exams/${examId}`,
      MY_ATTEMPTS: '/student/attempts',
    },
    ATTEMPTS: {
      START: '/student/attempts',
      BY_ID: (attemptId) => `/student/attempts/${attemptId}`,
      SUBMIT: (attemptId) => `/student/attempts/${attemptId}/submit`,
      SAVE_ANSWER: (attemptId) => `/student/attempts/${attemptId}/answers`,
      UPLOAD_AUDIO: (attemptId) => `/student/attempts/${attemptId}/answers/audio`,
      RESULTS: (attemptId) => `/student/attempts/${attemptId}/results`,
      ANSWER_FEEDBACK: (attemptId, answerId) => `/student/attempts/${attemptId}/answers/${answerId}/feedback`,
    },
  },

  // Public endpoints
  PUBLIC: {
    APTIS_TYPES: '/public/aptis-types',
    SKILL_TYPES: '/public/skill-types', 
    PUBLISHED_EXAMS: '/public/exams',
  },
};

// Request timeout configuration
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

export default API_ENDPOINTS;