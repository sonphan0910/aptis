import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

export const criteriaApi = {
  // Get all criteria with pagination and filters
  getCriteria: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.CRITERIA.LIST, { params });
    return response.data;
  },

  // Get a single criteria by ID
  getCriteriaById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.CRITERIA.BY_ID(id));
    return response.data;
  },

  // Create new criteria
  createCriteria: async (criteriaData) => {
    const response = await apiClient.post(API_ENDPOINTS.TEACHER.CRITERIA.CREATE, criteriaData);
    return response.data;
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
