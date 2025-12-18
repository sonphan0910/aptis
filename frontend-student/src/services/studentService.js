import { api } from './api';

export const studentService = {
  // Get student dashboard statistics
  getStats: () => {
    return api.get('/student/dashboard/stats');
  },

  // Get recent exam attempts
  getRecentAttempts: (limit = 5) => {
    return api.get('/student/dashboard/recent-attempts', {
      params: { limit }
    });
  },

  // Get progress data
  getProgress: (timeRange = '30d') => {
    return api.get('/student/progress', {
      params: { range: timeRange }
    });
  },

  // Get skill breakdown
  getSkillBreakdown: () => {
    return api.get('/student/progress/skills');
  },

  // Get performance trends
  getPerformanceTrends: (skillId = null, timeRange = '30d') => {
    const params = { range: timeRange };
    if (skillId) {
      params.skill_id = skillId;
    }
    
    return api.get('/student/progress/trends', { params });
  },

  // Get study recommendations
  getRecommendations: () => {
    return api.get('/student/recommendations');
  },

  // Get achievement/milestones
  getAchievements: () => {
    return api.get('/student/achievements');
  },

  // Update study preferences
  updatePreferences: (preferences) => {
    return api.put('/student/preferences', preferences);
  },

  // Get study preferences
  getPreferences: () => {
    return api.get('/student/preferences');
  },

  // Get detailed performance report
  getPerformanceReport: (params = {}) => {
    return api.get('/student/reports/performance', { params });
  },

  // Export progress report
  exportProgressReport: (format = 'pdf', params = {}) => {
    return api.get(`/student/reports/export/${format}`, {
      params,
      responseType: 'blob', // Important for file downloads
    });
  },

  // Get calendar data (study schedule, exam dates)
  getCalendarData: (month, year) => {
    return api.get('/student/calendar', {
      params: { month, year }
    });
  },

  // Mark notification as read
  markNotificationRead: (notificationId) => {
    return api.patch(`/student/notifications/${notificationId}/read`);
  },

  // Get notifications
  getNotifications: (params = {}) => {
    return api.get('/student/notifications', { params });
  },

  // Update notification preferences
  updateNotificationSettings: (settings) => {
    return api.put('/student/notifications/settings', settings);
  },
};