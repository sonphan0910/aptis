import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

export const submissionApi = {
  // Get submissions list (writing & speaking only)
  getSubmissions: async (params) => {
    const response = await apiClient.get('/teacher/submissions', { params });
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