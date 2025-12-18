import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

export const userApi = {
  // Admin User Management APIs
  // Get all users with pagination and filters
  getUsers: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.USERS.LIST, { params });
    return response.data;
  },

  // Get a single user by ID
  getUserById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.USERS.BY_ID(id));
    return response.data;
  },

  // Create a new user
  createUser: async (userData) => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.USERS.CREATE, userData);
    return response.data;
  },

  // Update an existing user
  updateUser: async (id, userData) => {
    const response = await apiClient.put(API_ENDPOINTS.ADMIN.USERS.UPDATE(id), userData);
    return response.data;
  },

  // Delete a user
  deleteUser: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.USERS.DELETE(id));
    return response.data;
  },

  // Reset user password
  resetUserPassword: async (id) => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.USERS.RESET_PASSWORD(id));
    return response.data;
  },

  // Get users by role
  getUsersByRole: async (role, params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.USERS.BY_ROLE(role), { params });
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.USERS.STATS);
    return response.data;
  },

  // Get recent users
  getRecentUsers: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.USERS.RECENT, { params });
    return response.data;
  },

  // Search users
  searchUsers: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.USERS.SEARCH, { params });
    return response.data;
  },

  // Export users to file
  exportUsers: async (filters, format = 'csv') => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.USERS.EXPORT, {
      params: { ...filters, format },
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users.${format.toLowerCase()}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Users exported successfully' };
  },

  // User Profile APIs
  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.PROFILE);
    return response.data;
  },

  // Update current user profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put(API_ENDPOINTS.USERS.PROFILE, profileData);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.CHANGE_PASSWORD, {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (avatarFile) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await apiClient.post(API_ENDPOINTS.USERS.UPLOAD_AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};