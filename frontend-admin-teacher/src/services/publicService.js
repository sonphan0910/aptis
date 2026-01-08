import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

export const publicApi = {
  // Get all APTIS types
  getAptisTypes: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PUBLIC.APTIS_TYPES);
    return response.data;
  },

  // Get all skill types
  getSkillTypes: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PUBLIC.SKILL_TYPES);
    return response.data;
  },

  // Get all question types  
  getQuestionTypes: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PUBLIC.QUESTION_TYPES);
    return response.data;
  },

  // Get published exams
  getPublishedExams: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.PUBLIC.PUBLISHED_EXAMS, { params });
    return response.data;
  },
};