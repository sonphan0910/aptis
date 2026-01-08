import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

export const submissionApi = {
  // Get submissions list (writing & speaking only) - Enhanced with new filters
  getSubmissions: async (params) => {
    // Transform params for new API structure
    const apiParams = { ...params };
    
    // Handle score_range
    if (params.score_range) {
      if (params.score_range.min !== undefined) {
        apiParams.score_range_min = params.score_range.min;
      }
      if (params.score_range.max !== undefined) {
        apiParams.score_range_max = params.score_range.max;
      }
      delete apiParams.score_range;
    }
    
    // Handle date_range
    if (params.date_range) {
      if (params.date_range.start) {
        apiParams.date_from = params.date_range.start;
      }
      if (params.date_range.end) {
        apiParams.date_to = params.date_range.end;
      }
      delete apiParams.date_range;
    }

    const response = await apiClient.get('/teacher/submissions', { params: apiParams });
    return response.data;
  },

  // Get submission detail by attempt ID
  getSubmissionDetail: async (attemptId) => {
    const response = await apiClient.get(`/teacher/submissions/${attemptId}`);
    return response.data;
  },

  // Get answer detail for review
  getAnswerDetail: async (answerId) => {
    const response = await apiClient.get(`/teacher/answers/${answerId}`);
    return response.data;
  },

  // Submit review for an answer
  submitAnswerReview: async (answerId, reviewData) => {
    const response = await apiClient.put(`/teacher/answers/${answerId}/review`, reviewData);
    return response.data;
  },

  // Update score for an answer
  updateAnswerScore: async (answerId, scoreData) => {
    const response = await apiClient.put(`/teacher/answers/${answerId}/score`, scoreData);
    return response.data;
  },

  // Regrade submissions with AI
  regradeSubmissions: async (answerIds, regradeType = 'ai') => {
    const response = await apiClient.post('/teacher/submissions/regrade', {
      answerIds,
      regradeType
    });
    return response.data;
  },

  // Bulk update submission status
  bulkUpdateStatus: async (answerIds, status, needsReview) => {
    const response = await apiClient.post('/teacher/submissions/bulk-update', {
      answerIds,
      status,
      needsReview
    });
    return response.data;
  },

  // Get grading statistics
  getGradingStats: async (params) => {
    const response = await apiClient.get('/teacher/submissions/stats', { params });
    return response.data;
  },

  // Get pending reviews (writing & speaking)
  getPendingReviews: async (params) => {
    const response = await apiClient.get('/teacher/reviews/pending', { params });
    return response.data;
  },

  // Get reviews by exam
  getReviewsByExam: async (examId, params) => {
    const response = await apiClient.get(`/teacher/exams/${examId}/reviews`, { params });
    return response.data;
  },

  // Submit final review for attempt
  submitAttemptReview: async (attemptId, reviewData) => {
    const response = await apiClient.post(`/teacher/attempts/${attemptId}/review`, reviewData);
    return response.data;
  },
};