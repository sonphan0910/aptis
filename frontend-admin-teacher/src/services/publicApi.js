import { apiClient } from './apiClient';

/**
 * Public API service for fetching constants and seed data
 */
export const publicApi = {
  /**
   * Get all APTIS types
   */
  getAptisTypes: async () => {
    try {
      const response = await apiClient.get('/public/aptis-types');
      return response.data?.data || [];
    } catch (error) {
      console.warn('Failed to fetch APTIS types from API, using fallback');
      return [];
    }
  },

  /**
   * Get all skill types
   */
  getSkillTypes: async () => {
    try {
      const response = await apiClient.get('/public/skill-types');
      return response.data?.data || [];
    } catch (error) {
      console.warn('Failed to fetch skill types from API, using fallback');
      return [];
    }
  },

  /**
   * Get all question types
   */
  getQuestionTypes: async () => {
    try {
      const response = await apiClient.get('/public/question-types');
      return response.data?.data || [];
    } catch (error) {
      console.warn('Failed to fetch question types from API, using fallback');
      return [];
    }
  },

  /**
   * Get published exams
   */
  getPublishedExams: async () => {
    try {
      const response = await apiClient.get('/public/exams');
      return response.data?.data || [];
    } catch (error) {
      console.warn('Failed to fetch published exams, using fallback');
      return [];
    }
  },
};
