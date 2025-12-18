import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/authService';

// Get initial state from storage
const getInitialState = () => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      refreshToken: null,
    };
  }

  try {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    console.log('[AuthSlice] Loading initial state:', {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      hasUser: !!user
    });

    return {
      user,
      token,
      refreshToken,
      isAuthenticated: !!(token && user),
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error('[AuthSlice] Error loading initial state:', error);
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      refreshToken: null,
    };
  }
};

const initialState = getInitialState();

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('[AuthSlice] Starting login thunk for:', email);
      const response = await authService.login(email, password);
      console.log('[AuthSlice] Login thunk response:', {
        hasTokens: !!response.tokens,
        hasUser: !!response.user
      });
      return response;
    } catch (error) {
      console.error('[AuthSlice] Login thunk error:', error);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const refreshAuth = createAsyncThunk(
  'auth/refresh',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      if (!state.auth.refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await authService.refreshToken(state.auth.refreshToken);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Password reset request failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(token, password);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Password reset failed');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Password change failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Profile update failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearAuth: (state) => {
      console.log('[AuthSlice] Clearing auth state');
      authService.clearTokens();
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    checkAuth: (state) => {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : null;
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = userStr ? JSON.parse(userStr) : null;
      
      console.log('[AuthSlice] Checking auth state:', {
        hasToken: !!token,
        hasUser: !!user
      });
      
      if (token && user) {
        state.token = token;
        state.refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        state.user = user;
        state.isAuthenticated = true;
      } else {
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    // For direct token update without async thunk (used in apiClient for token refresh)
    updateTokens: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('[AuthSlice] Login fulfilled:', action.payload);
        state.isLoading = false;
        state.error = null;
        
        if (action.payload?.tokens && action.payload?.user) {
          state.user = action.payload.user;
          state.token = action.payload.tokens.access;
          state.refreshToken = action.payload.tokens.refresh;
          state.isAuthenticated = true;
          
          console.log('[AuthSlice] Authentication successful');
        } else {
          console.error('[AuthSlice] Invalid login response structure');
          state.error = 'Invalid login response';
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Still clear auth data even if logout API call failed
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    // Refresh token
    builder
      .addCase(refreshAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Clear auth data if refresh fails
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    // Forgot password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Reset password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...state.user, ...action.payload.user };
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUser, clearAuth, checkAuth, setLoading, updateTokens } = authSlice.actions;
export default authSlice.reducer;