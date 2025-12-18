import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { studentService } from '@/services/studentService';

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const [statsResponse, attemptsResponse] = await Promise.all([
        studentService.getStats(),
        studentService.getRecentAttempts(),
      ]);
      
      return {
        stats: statsResponse.data?.data || statsResponse.data,
        recentAttempts: attemptsResponse.data?.data || attemptsResponse.data || [],
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

const initialState = {
  stats: {
    totalExams: 0,
    totalAttempts: 0,
    averageScore: 0,
    streak: 0,
    totalTime: '0h',
    weakestSkills: [],
  },
  recentAttempts: [],
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    addRecentAttempt: (state, action) => {
      state.recentAttempts.unshift(action.payload);
      // Keep only the latest 5 attempts
      if (state.recentAttempts.length > 5) {
        state.recentAttempts.pop();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats || initialState.stats;
        state.recentAttempts = action.payload.recentAttempts || [];
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateStats, addRecentAttempt } = dashboardSlice.actions;
export default dashboardSlice.reducer;