/**
 * Token Helper - Centralized token management
 * Handles token retrieval from localStorage and sessionStorage with fallbacks
 */

export const getToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  // Try multiple storage locations and keys
  const token = 
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('accessToken');

  return token || null;
};

export const getRefreshToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const refreshToken = 
    localStorage.getItem('refreshToken') ||
    sessionStorage.getItem('refreshToken');

  return refreshToken || null;
};

export const setToken = (token, isRemembered = true) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (isRemembered) {
    localStorage.setItem('token', token);
    localStorage.setItem('accessToken', token); // Compatibility
  } else {
    sessionStorage.setItem('token', token);
  }
};

export const setRefreshToken = (refreshToken, isRemembered = true) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (refreshToken) {
    if (isRemembered) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      sessionStorage.setItem('refreshToken', refreshToken);
    }
  }
};

export const clearTokens = () => {
  if (typeof window === 'undefined') {
    return;
  }

  // Clear from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');

  // Clear from sessionStorage
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
};

export const isTokenValid = () => {
  const token = getToken();
  if (!token) {
    return false;
  }

  // Check if token looks valid (basic check)
  return token.length > 10 && token.includes('.');
};

export const getAuthHeader = () => {
  const token = getToken();
  if (!token) {
    return {};
  }

  return {
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Log token status for debugging
 */
export const debugTokenStatus = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const tokenLS = localStorage.getItem('token');
  const accessTokenLS = localStorage.getItem('accessToken');
  const tokenSS = sessionStorage.getItem('token');
  const accessTokenSS = sessionStorage.getItem('accessToken');

};
