import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

export const reportApi = {
  // Teacher Reports
  // Get exam statistics
  getExamStatistics: async (examId) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.REPORTS.EXAM_STATISTICS(examId));
    return response.data;
  },

  // Get student statistics
  getStudentStatistics: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.REPORTS.STUDENT_STATISTICS, { params });
    return response.data;
  },

  // Get student report
  getStudentReport: async (studentId) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.REPORTS.STUDENT_REPORT(studentId));
    return response.data;
  },

  // Export statistics
  exportStatistics: async (params, format = 'csv') => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.REPORTS.EXPORT, {
      params: { ...params, format },
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report.${format.toLowerCase()}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Report exported successfully' };
  },

  // Admin Reports
  // Get dashboard overview
  getDashboardOverview: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.REPORTS.OVERVIEW);
    return response.data;
  },

  // Get user analytics
  getUserAnalytics: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.REPORTS.USERS, { params });
    return response.data;
  },

  // Get exam analytics
  getExamAnalytics: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.REPORTS.EXAMS, { params });
    return response.data;
  },

  // Get system analytics
  getSystemAnalytics: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.REPORTS.SYSTEM, { params });
    return response.data;
  },

  // Get activity logs
  getActivityLogs: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.REPORTS.ACTIVITIES, { params });
    return response.data;
  },

  // Get real-time stats
  getRealTimeStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.REPORTS.REALTIME);
    return response.data;
  },

  // Generate custom report
  generateReport: async (reportConfig) => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.REPORTS.GENERATE, reportConfig);
    return response.data;
  },

  // Get health check
  getHealthCheck: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.REPORTS.HEALTH);
    return response.data;
  },
};