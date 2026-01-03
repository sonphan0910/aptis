import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const tokenFromLocalStorage = localStorage.getItem('token');
      const tokenFromSessionStorage = sessionStorage.getItem('token');
      const token = tokenFromLocalStorage || tokenFromSessionStorage;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refresh_token: refreshToken,
        });

        // Backend returns tokens in data object: { success: true, data: { accessToken, refreshToken } }
        const { accessToken: newToken, refreshToken: newRefreshToken } = response.data.data || response.data;
        
        if (!newToken) {
          throw new Error('Invalid refresh response');
        }
        
        // Store in the same location where the original token was found
        const isRemembered = localStorage.getItem('rememberMe') === 'true';
        if (isRemembered) {
          localStorage.setItem('token', newToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
        } else {
          sessionStorage.setItem('token', newToken);
          if (newRefreshToken) {
            sessionStorage.setItem('refreshToken', newRefreshToken);
          }
        }

        // Update the authorization header and retry the request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        
        if (typeof window !== 'undefined') {
          // Use router instead of direct href to avoid hard reload
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Generic API methods
// Helper to get full URL for static assets (uploads)
export const getAssetUrl = (relativePath) => {
  if (!relativePath) return '';
  
  // If already absolute URL, return as-is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Build URL from backend server (remove /api from base URL)
  const serverUrl = API_BASE_URL.replace('/api', '');
  
  // Ensure path starts with /
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  
  return `${serverUrl}${path}`;
};

export const api = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
  upload: (url, formData, onUploadProgress = null) => {
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
};

export default apiClient;