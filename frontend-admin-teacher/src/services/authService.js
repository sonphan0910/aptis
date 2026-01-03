import { API_BASE_URL } from '@/config/api.config';

console.log(`[AuthService] Initialized with API_BASE_URL: ${API_BASE_URL}`);

class AuthService {
  // Build full URL for fetch requests
  buildUrl(path) {
    // If path is already a full URL, return it
    if (path.startsWith('http')) {
      return path;
    }
    // Otherwise combine with API_BASE_URL
    const fullUrl = `${API_BASE_URL}${path}`;
    console.log(`[AuthService] buildUrl('${path}') = '${fullUrl}'`);
    return fullUrl;
  }

  async makeRequest(url, options = {}) {
    console.log(`[AuthService] makeRequest: ${options.method || 'GET'} ${url}`);
    
    const token = this.getToken();
    console.log('[AuthService] Token status:', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'None'
    });
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header for protected routes
    if (token && !url.includes('/auth/login') && !url.includes('/auth/refresh-token')) {
      headers.Authorization = `Bearer ${token}`;
      console.log('[AuthService] Added Authorization header');
    }

    if (options.body) {
      console.log('[AuthService] Request body:', JSON.parse(options.body));
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 - token expired or invalid
    if (response.status === 401) {
      console.log('[AuthService] 401 Unauthorized - clearing tokens');
      this.clearTokens();
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      const errorData = await response.json().catch(() => ({ message: 'Unauthorized' }));
      throw new Error(errorData.message || 'Authentication failed');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  getToken() {
    if (typeof window !== 'undefined') {
      // Try both 'token' and 'accessToken' for compatibility
      const accessToken = localStorage.getItem('accessToken');
      const token = localStorage.getItem('token');
      const result = accessToken || token;
      
      console.log('[AuthService] getToken called:', {
        hasAccessToken: !!accessToken,
        hasToken: !!token,
        returning: result ? `${result.substring(0, 30)}...` : 'NO TOKEN',
        localStorage: {
          accessToken: accessToken ? 'present' : 'missing',
          token: token ? 'present' : 'missing'
        }
      });
      
      return result;
    }
    console.log('[AuthService] getToken called on server side - returning null');
    return null;
  }

  getRefreshToken() {
    if (typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refreshToken');
      console.log('[AuthService] getRefreshToken called:', {
        hasRefreshToken: !!refreshToken,
        returning: refreshToken ? `${refreshToken.substring(0, 30)}...` : 'NO REFRESH TOKEN'
      });
      return refreshToken;
    }
    console.log('[AuthService] getRefreshToken called on server side - returning null');
    return null;
  }

  setTokens(accessToken, refreshToken) {
    console.log('[AuthService] Storing tokens:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    });
    
    if (typeof window !== 'undefined' && accessToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('token', accessToken); // Compatibility
      
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Also store in cookies for persistence
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      if (refreshToken) {
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      }
    }
  }

  clearTokens() {
    console.log('[AuthService] Clearing all tokens');
    
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Clear cookies
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  async login(email, password) {
    console.log('[AuthService] Starting login for:', email);
    
    const response = await this.makeRequest(this.buildUrl('/auth/login'), {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    console.log('[AuthService] Full login response:', response);
    console.log('[AuthService] Response.data:', response.data);

    if (response.success && response.data) {
      const { user, access, refresh, accessToken, token, refreshToken } = response.data;
      
      // Handle different token field names
      const accessTokenValue = access || accessToken || token;
      const refreshTokenValue = refresh || refreshToken;
      
      console.log('[AuthService] Extracted tokens:', {
        hasAccessToken: !!accessTokenValue,
        hasRefreshToken: !!refreshTokenValue,
        hasUser: !!user,
        tokenNames: { access, accessToken, token, refresh, refreshToken }
      });

      if (accessTokenValue && user) {
        // Store tokens correctly
        this.setTokens(accessTokenValue, refreshTokenValue);
        
        // Store user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        console.log('[AuthService] Login successful - tokens and user stored');
        return { 
          tokens: { access: accessTokenValue, refresh: refreshTokenValue },
          user 
        };
      } else {
        console.error('[AuthService] Invalid token structure - missing access or user:', {
          hasAccess: !!access,
          hasAccessToken: !!accessToken,
          hasToken: !!token,
          hasUser: !!user,
          fullData: response.data
        });
        throw new Error('Invalid authentication response - no access token');
      }
    }

    throw new Error(response.message || 'Login failed');
  }

  async logout() {
    try {
      await this.makeRequest(this.buildUrl('/auth/logout'), {
        method: 'POST',
      });
    } finally {
      // Always clear tokens, even if the API call fails
      this.clearTokens();
    }
  }

  async refreshToken(refreshToken) {
    const response = await this.makeRequest(this.buildUrl('/auth/refresh-token'), {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    // Update tokens
    this.setTokens(response.token, response.refreshToken);

    return response;
  }

  async forgotPassword(email) {
    return this.makeRequest(this.buildUrl('/auth/forgot-password'), {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, password) {
    return this.makeRequest(this.buildUrl('/auth/reset-password'), {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.makeRequest(this.buildUrl('/users/change-password'), {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async updateProfile(profileData) {
    return this.makeRequest(this.buildUrl('/users/profile'), {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getProfile() {
    return this.makeRequest(this.buildUrl('/users/profile'));
  }

  async verifyToken() {
    try {
      const user = await this.getProfile();
      return { valid: true, user };
    } catch (error) {
      return { valid: false };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Get user role from token (basic implementation)
  getUserRole() {
    const token = this.getToken();
    if (!token) return null;

    try {
      // This is a simple decode - in production, you might want to use a proper JWT library
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Check if user has specific role
  hasRole(role) {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin');
  }

  // Check if user is teacher
  isTeacher() {
    return this.hasRole('teacher');
  }
}

export const authService = new AuthService();
export const authApi = authService; // Backward compatibility
export default authService;