import api from './api';

const userService = {
  // Get current user profile
  getProfile: () => api.get('/users/profile'),

  // Update current user profile
  updateProfile: (data) => api.put('/users/profile', data),

  // Upload avatar for current user
  uploadAvatar: (formData) => api.put('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // Change password
  changePassword: (data) => api.put('/users/change-password', data),
};

export default userService;