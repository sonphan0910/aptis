import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

export const criteriaApi = {
  // Get all criteria with pagination and filters
  getCriteria: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.CRITERIA.LIST, { params });
    return response.data;
  },

  // Get question types for criteria (Speaking & Writing only)
  getQuestionTypesForCriteria: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.CRITERIA.LIST + '/question-types');
    return response.data;
  },

  // Get a single criteria by ID
  getCriteriaById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.CRITERIA.BY_ID(id));
    return response.data;
  },

  // Create new criteria
  createCriteria: async (criteriaData) => {
    console.log('[CriteriaService] Calling createCriteria API with data:', criteriaData);
    try {
      const response = await apiClient.post(API_ENDPOINTS.TEACHER.CRITERIA.CREATE, criteriaData);
      console.log('[CriteriaService] Post request successful:', response.status);
      return response.data;
    } catch (error) {
      console.error('[CriteriaService] Post request failed:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      });
      throw error;
    }
  },

  // Update existing criteria
  updateCriteria: async (id, criteriaData) => {
    const response = await apiClient.put(API_ENDPOINTS.TEACHER.CRITERIA.UPDATE(id), criteriaData);
    return response.data;
  },

  // Delete criteria
  deleteCriteria: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.TEACHER.CRITERIA.DELETE(id));
    return response.data;
  },

  // Preview criteria
  previewCriteria: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.CRITERIA.PREVIEW(id));
    return response.data;
  },
};
