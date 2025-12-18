import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { examService } from '@/services/examService';

// Async thunks
export const fetchExams = createAsyncThunk(
  'exams/fetchExams',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await examService.getExams(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch exams');
    }
  }
);

export const fetchExamDetails = createAsyncThunk(
  'exams/fetchExamDetails',
  async (examId, { rejectWithValue }) => {
    try {
      const response = await examService.getExamDetails(examId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch exam details');
    }
  }
);

export const fetchMyAttempts = createAsyncThunk(
  'exams/fetchMyAttempts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await examService.getMyAttempts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attempts');
    }
  }
);

const initialState = {
  exams: [],
  currentExam: null,
  myAttempts: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    aptis_type: '',
    skill: '',
    difficulty: '',
    sort: 'created_at',
    search: '',
  },
  isLoading: false,
  isLoadingDetails: false,
  isLoadingAttempts: false,
  error: null,
};

const examSlice = createSlice({
  name: 'exams',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearCurrentExam: (state) => {
      state.currentExam = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetExamState: (state) => {
      state.exams = [];
      state.currentExam = null;
      state.myAttempts = [];
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch exams
      .addCase(fetchExams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exams = action.payload.data || action.payload.exams || [];
        
        // Update pagination if provided
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        } else if (action.payload.total !== undefined) {
          state.pagination.total = action.payload.total;
          state.pagination.totalPages = Math.ceil(action.payload.total / state.pagination.limit);
        }
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.exams = [];
      })
      
      // Fetch exam details
      .addCase(fetchExamDetails.pending, (state) => {
        state.isLoadingDetails = true;
        state.error = null;
      })
      .addCase(fetchExamDetails.fulfilled, (state, action) => {
        state.isLoadingDetails = false;
        // Backend trả về { success: true, data: exam }
        state.currentExam = action.payload.data || action.payload;
      })
      .addCase(fetchExamDetails.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.error = action.payload;
        state.currentExam = null;
      })
      
      // Fetch my attempts
      .addCase(fetchMyAttempts.pending, (state) => {
        state.isLoadingAttempts = true;
        state.error = null;
      })
      .addCase(fetchMyAttempts.fulfilled, (state, action) => {
        state.isLoadingAttempts = false;
        state.myAttempts = action.payload.data || action.payload.attempts || [];
      })
      .addCase(fetchMyAttempts.rejected, (state, action) => {
        state.isLoadingAttempts = false;
        state.error = action.payload;
        state.myAttempts = [];
      });
  },
});

export const {
  setFilters,
  setPagination,
  clearCurrentExam,
  clearError,
  resetExamState,
} = examSlice.actions;

export default examSlice.reducer;