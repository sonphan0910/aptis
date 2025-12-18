import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

export const adminApi = {
  // Exam Management
  getAllExams: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.EXAMS.LIST, { params });
    return response.data;
  },

  getExamById: async (examId) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.EXAMS.BY_ID(examId));
    return response.data;
  },

  updateExam: async (examId, examData) => {
    const response = await apiClient.put(API_ENDPOINTS.ADMIN.EXAMS.UPDATE(examId), examData);
    return response.data;
  },

  deleteExam: async (examId) => {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.EXAMS.DELETE(examId));
    return response.data;
  },

  approveExam: async (examId) => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.EXAMS.APPROVE(examId));
    return response.data;
  },

  rejectExam: async (examId) => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.EXAMS.REJECT(examId));
    return response.data;
  },

  getExamStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.EXAMS.STATS);
    return response.data;
  },

  getPendingExams: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.EXAMS.PENDING);
    return response.data;
  },

  // System Management
  getSystemInfo: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.SYSTEM.INFO);
    return response.data;
  },

  getSystemConfig: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.SYSTEM.CONFIG);
    return response.data;
  },

  updateSystemConfig: async (config) => {
    const response = await apiClient.put(API_ENDPOINTS.ADMIN.SYSTEM.CONFIG, config);
    return response.data;
  },

  getSystemLogs: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.SYSTEM.LOGS, { params });
    return response.data;
  },

  createBackup: async () => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.SYSTEM.BACKUP);
    return response.data;
  },

  getBackupStatus: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.SYSTEM.BACKUP_STATUS);
    return response.data;
  },

  setMaintenanceMode: async (enabled) => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.SYSTEM.MAINTENANCE, { enabled });
    return response.data;
  },

  manageDatabases: async (operation, params) => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.SYSTEM.DATABASE, { operation, params });
    return response.data;
  },

  manageCaches: async (operation) => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.SYSTEM.CACHE, { operation });
    return response.data;
  },

  getSecurityAudit: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.SYSTEM.SECURITY_AUDIT, { params });
    return response.data;
  },

  cleanupSystem: async (options) => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.SYSTEM.CLEANUP, options);
    return response.data;
  },

  restartServices: async (services) => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.SYSTEM.RESTART, { services });
    return response.data;
  },

  // AI Management
  getAIQueueStatus: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.AI.QUEUE_STATUS);
    return response.data;
  },

  getAIStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.AI.STATS);
    return response.data;
  },

  retryFailedJobs: async () => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.AI.RETRY);
    return response.data;
  },

  clearCompletedJobs: async () => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.AI.CLEAR);
    return response.data;
  },

  getModelConfig: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.AI.CONFIG);
    return response.data;
  },

  updateModelConfig: async (config) => {
    const response = await apiClient.put(API_ENDPOINTS.ADMIN.AI.CONFIG, config);
    return response.data;
  },
};