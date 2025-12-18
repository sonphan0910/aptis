import { api } from './api';

export const examService = {
  // Get list of exams for students
  getExams: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    return api.get(`/student/exams?${queryParams.toString()}`);
  },

  // Get exam details by ID
  getExamDetails: (examId) => {
    return api.get(`/student/exams/${examId}`);
  },

  // Get my exam attempts
  getMyAttempts: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    return api.get(`/student/attempts?${queryParams.toString()}`);
  },

  // Search exams
  searchExams: (searchQuery, filters = {}) => {
    return api.get('/student/exams', {
      params: {
        search: searchQuery,
        ...filters,
      },
    });
  },

  // Get exam statistics
  getExamStats: (examId) => {
    return api.get(`/student/exams/${examId}/stats`);
  },
};