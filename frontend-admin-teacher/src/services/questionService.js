import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

export const questionApi = {
  // Get all questions with pagination and filters
  getQuestions: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.QUESTIONS.LIST, { params });
    return response.data;
  },

  // Get a single question by ID
  getQuestionById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.QUESTIONS.BY_ID(id));
    return response.data;
  },

  // Create a new question
  createQuestion: async (questionData) => {
    const response = await apiClient.post(API_ENDPOINTS.TEACHER.QUESTIONS.CREATE, questionData);
    return response.data;
  },

  // Update an existing question
  updateQuestion: async (id, questionData) => {
    const response = await apiClient.put(API_ENDPOINTS.TEACHER.QUESTIONS.UPDATE(id), questionData);
    return response.data;
  },

  // Delete a question
  deleteQuestion: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.TEACHER.QUESTIONS.DELETE(id));
    return response.data;
  },

  // Get question usage
  getQuestionUsage: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.QUESTIONS.USAGE(id));
    return response.data;
  },

  // Delete multiple questions
  deleteMultipleQuestions: async (ids) => {
    const response = await apiClient.delete(API_ENDPOINTS.TEACHER.QUESTIONS.DELETE_MULTIPLE, {
      data: { ids }
    });
    return response.data;
  },

  // Duplicate a question
  duplicateQuestion: async (id) => {
    const response = await apiClient.post(API_ENDPOINTS.TEACHER.QUESTIONS.DUPLICATE(id));
    return response.data;
  },

  // Import questions
  importQuestions: async (file, format) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    
    const response = await apiClient.post(API_ENDPOINTS.TEACHER.QUESTIONS.IMPORT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  },

  // Export questions
  exportQuestions: async (filters, format) => {
    const response = await apiClient.post(API_ENDPOINTS.TEACHER.QUESTIONS.EXPORT, {
      filters,
      format
    }, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get question types
  getQuestionTypes: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.QUESTIONS.TYPES);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.QUESTIONS.CATEGORIES);
    return response.data;
  },

  // Bulk update questions
  bulkUpdateQuestions: async (ids, updateData) => {
    const response = await apiClient.put(API_ENDPOINTS.TEACHER.QUESTIONS.BULK_UPDATE, {
      ids,
      updateData
    });
    return response.data;
  },

  // Get filter options from API
  getFilterOptions: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.QUESTIONS.FILTER_OPTIONS);
    return response.data;
  }
};