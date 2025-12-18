import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

export const submissionApi = {
  // Get pending reviews
  getPendingReviews: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.REVIEW.PENDING, { params });
    return response.data;
  },

  // Get answer for review
  getAnswerForReview: async (answerId) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.REVIEW.ANSWER_DETAILS(answerId));
    return response.data;
  },

  // Submit review for answer
  submitReview: async (answerId, reviewData) => {
    const response = await apiClient.put(API_ENDPOINTS.TEACHER.REVIEW.SUBMIT_REVIEW(answerId), reviewData);
    return response.data;
  },

  // Get reviews by exam
  getReviewsByExam: async (examId, params) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.REVIEW.BY_EXAM(examId), { params });
    return response.data;
  },
};