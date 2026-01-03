import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/authService';

// Get initial state from storage with SSR safety
const getInitialState = () => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
    };
  }

  try {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;


    return {
      user,
      token,
      refreshToken,
      isAuthenticated: !!(token && user),
      isLoading: false,
      isInitialized: false,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
    };
  }
};

const initialState = getInitialState();

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      // Backend returns: { success: true, data: { user, accessToken, refreshToken } }
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const refreshTokenThunk = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      if (!state.auth.refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await authService.refreshToken(state.auth.refreshToken);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      if (typeof window === 'undefined') {
        throw new Error('No window object');
      }

      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!token) {
        throw new Error('No token found');
      }

      // Verify token is valid by getting user profile
      const response = await authService.getProfile();

      return {
        user: response.data.data, // Backend trả về { success: true, data: user }
        token,
        refreshToken,
      };
    } catch (error) {
      // Clear storage on auth check failure
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      return rejectWithValue('Authentication check failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
      state.isLoading = false;
    },
    updateTokens: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        if (action.payload.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        if (action.payload?.user && (action.payload?.accessToken || action.payload?.token)) {
          state.user = action.payload.user;
          state.token = action.payload.accessToken || action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;

          // Store in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', state.token);
            localStorage.setItem('user', JSON.stringify(state.user));
            if (state.refreshToken) {
              localStorage.setItem('refreshToken', state.refreshToken);
            }
          }
        } else {
          state.error = 'Invalid login response';
          state.isAuthenticated = false;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token || action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;

        if (typeof window !== 'undefined') {
          localStorage.setItem('token', state.token);
          localStorage.setItem('user', JSON.stringify(state.user));
          if (state.refreshToken) {
            localStorage.setItem('refreshToken', state.refreshToken);
          }
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Check auth status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        
        // Save user to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      });

    // Refresh token
    builder
      .addCase(refreshTokenThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.accessToken || action.payload.token;
        state.refreshToken = action.payload.refreshToken;

        if (typeof window !== 'undefined') {
          localStorage.setItem('token', state.token);
          if (state.refreshToken) {
            localStorage.setItem('refreshToken', state.refreshToken);
          }
        }

        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshTokenThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Clear auth data if refresh fails
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      });

    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUser, clearAuth, setInitialized, updateTokens } = authSlice.actions;
export default authSlice.reducer;