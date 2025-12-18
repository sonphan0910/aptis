import { api } from './api';

export const authService = {
  // Register new user
  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  // Login user
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  // Logout user
  logout: () => {
    return api.post('/auth/logout');
  },

  // Refresh token
  refreshToken: () => {
    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    return api.post('/auth/refresh-token', { refresh_token: refreshToken });
  },

  // Forgot password
  forgotPassword: (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: (token, newPassword) => {
    return api.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  },

  // Get current user profile
  getProfile: () => {
    return api.get('/users/profile');
  },

  // Update user profile
  updateProfile: (profileData) => {
    return api.put('/users/profile', profileData);
  },

  // Change password
  changePassword: (oldPassword, newPassword) => {
    return api.post('/users/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  // Upload avatar
  uploadAvatar: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return api.upload('/users/avatar', formData, onUploadProgress);
  },
};