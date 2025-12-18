import { api } from './api';

export const attemptService = {
  // Start a new exam attempt
  startAttempt: (attemptData) => {
    return api.post('/student/attempts', attemptData);
  },

  // Get current attempt details
  getAttempt: (attemptId) => {
    return api.get(`/student/attempts/${attemptId}`);
  },

  // Get questions for attempt (progressive loading)
  getAttemptQuestions: (attemptId, params = {}) => {
    return api.get(`/student/attempts/${attemptId}/questions`, { params });
  },

  // Save answer for a question
  saveAnswer: (answerData) => {
    return api.post(`/student/attempts/${answerData.attempt_id}/answers`, answerData);
  },

  // Upload audio answer for speaking questions
  uploadAudioAnswer: (attemptId, questionId, audioFile, onUploadProgress) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('question_id', questionId);
    
    return api.upload(
      `/student/attempts/${attemptId}/answers/audio`,
      formData,
      onUploadProgress
    );
  },

  // Submit exam attempt
  submitAttempt: (attemptId) => {
    return api.post(`/student/attempts/${attemptId}/submit`);
  },

  // Get attempt results
  getAttemptResults: (attemptId) => {
    return api.get(`/student/attempts/${attemptId}/results`);
  },

  // Get detailed feedback for a specific answer
  getAnswerFeedback: (attemptId, answerId) => {
    return api.get(`/student/attempts/${attemptId}/answers/${answerId}/feedback`);
  },

  // Pause attempt (if supported)
  pauseAttempt: (attemptId) => {
    return api.post(`/student/attempts/${attemptId}/pause`);
  },

  // Resume attempt (if supported)
  resumeAttempt: (attemptId) => {
    return api.post(`/student/attempts/${attemptId}/resume`);
  },

  // Get attempt progress
  getAttemptProgress: (attemptId) => {
    return api.get(`/student/attempts/${attemptId}/progress`);
  },

  // Auto-save answer (background save)
  autoSaveAnswer: (attemptId, questionId, answerData) => {
    return api.patch(`/student/attempts/${attemptId}/answers/${questionId}`, answerData);
  },

  // Get user attempts
  getUserAttempts: ({ page, limit, examId }) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (examId) params.append('examId', examId);
    return api.get(`/student/attempts?${params.toString()}`);
  },

  // Get available skills for an exam
  getExamSkills: (examId) => {
    return api.get(`/student/exams/${examId}/skills`);
  },
};

export default attemptService;