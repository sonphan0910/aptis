import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { examApi } from '@/services/examService';

const initialState = {
  exams: [],
  currentExam: null,
  examDetails: null,
  examAttempts: [],
  examStatistics: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    status: 'all',
    category: 'all',
    level: 'all',
    search: '',
  },
  isLoading: false,
  error: null,
  isPublishing: false,
  isDrafting: false,
};

// Async thunks
export const fetchExams = createAsyncThunk(
  'exams/fetchExams',
  async ({ page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await examApi.getExams({ page, limit, ...filters });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch exams');
    }
  }
);

export const fetchExamById = createAsyncThunk(
  'exams/fetchExamById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await examApi.getExamById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch exam');
    }
  }
);

export const createExam = createAsyncThunk(
  'exams/createExam',
  async (examData, { rejectWithValue }) => {
    try {
      const response = await examApi.createExam(examData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create exam');
    }
  }
);

export const updateExam = createAsyncThunk(
  'exams/updateExam',
  async ({ id, examData }, { rejectWithValue }) => {
    try {
      const response = await examApi.updateExam(id, examData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update exam');
    }
  }
);

export const deleteExam = createAsyncThunk(
  'exams/deleteExam',
  async (id, { rejectWithValue }) => {
    try {
      await examApi.deleteExam(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete exam');
    }
  }
);

export const duplicateExam = createAsyncThunk(
  'exams/duplicateExam',
  async (id, { rejectWithValue }) => {
    try {
      const response = await examApi.duplicateExam(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to duplicate exam');
    }
  }
);

export const publishExam = createAsyncThunk(
  'exams/publishExam',
  async (id, { rejectWithValue }) => {
    try {
      const response = await examApi.publishExam(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to publish exam');
    }
  }
);

export const unpublishExam = createAsyncThunk(
  'exams/unpublishExam',
  async (id, { rejectWithValue }) => {
    try {
      const response = await examApi.unpublishExam(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to unpublish exam');
    }
  }
);

export const addQuestionToExam = createAsyncThunk(
  'exams/addQuestionToExam',
  async ({ examId, questionId, order }, { rejectWithValue }) => {
    try {
      const response = await examApi.addQuestionToExam(examId, questionId, order);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add question to exam');
    }
  }
);

export const removeQuestionFromExam = createAsyncThunk(
  'exams/removeQuestionFromExam',
  async ({ examId, questionId }, { rejectWithValue }) => {
    try {
      await examApi.removeQuestionFromExam(examId, questionId);
      return { examId, questionId };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove question from exam');
    }
  }
);

export const reorderExamQuestions = createAsyncThunk(
  'exams/reorderExamQuestions',
  async ({ examId, questionOrders }, { rejectWithValue }) => {
    try {
      const response = await examApi.reorderExamQuestions(examId, questionOrders);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reorder questions');
    }
  }
);

export const fetchExamAttempts = createAsyncThunk(
  'exams/fetchExamAttempts',
  async ({ examId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await examApi.getExamAttempts(examId, { page, limit });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch exam attempts');
    }
  }
);

export const fetchExamStatistics = createAsyncThunk(
  'exams/fetchExamStatistics',
  async (examId, { rejectWithValue }) => {
    try {
      const response = await examApi.getExamStatistics(examId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch exam statistics');
    }
  }
);

export const exportExamResults = createAsyncThunk(
  'exams/exportExamResults',
  async ({ examId, format }, { rejectWithValue }) => {
    try {
      const response = await examApi.exportExamResults(examId, format);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to export exam results');
    }
  }
);

export const generateExamPreview = createAsyncThunk(
  'exams/generateExamPreview',
  async (id, { rejectWithValue }) => {
    try {
      const response = await examApi.generateExamPreview(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate exam preview');
    }
  }
);

export const scheduleExam = createAsyncThunk(
  'exams/scheduleExam',
  async ({ examId, scheduleData }, { rejectWithValue }) => {
    try {
      const response = await examApi.scheduleExam(examId, scheduleData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to schedule exam');
    }
  }
);

const examSlice = createSlice({
  name: 'exams',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setCurrentExam: (state, action) => {
      state.currentExam = action.payload;
    },
    clearCurrentExam: (state) => {
      state.currentExam = null;
      state.examDetails = null;
    },
    updateExamInList: (state, action) => {
      const index = state.exams.findIndex(exam => exam.id === action.payload.id);
      if (index !== -1) {
        state.exams[index] = { ...state.exams[index], ...action.payload };
      }
    },
    setExamDetails: (state, action) => {
      state.examDetails = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch exams
    builder
      .addCase(fetchExams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exams = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
        state.error = null;
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch exam by ID
    builder
      .addCase(fetchExamById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExamById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentExam = action.payload;
        state.error = null;
      })
      .addCase(fetchExamById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create exam
    builder
      .addCase(createExam.pending, (state) => {
        state.isDrafting = true;
        state.error = null;
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.isDrafting = false;
        state.exams.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createExam.rejected, (state, action) => {
        state.isDrafting = false;
        state.error = action.payload;
      });

    // Update exam
    builder
      .addCase(updateExam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExam.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.exams.findIndex(exam => exam.id === action.payload.id);
        if (index !== -1) {
          state.exams[index] = action.payload;
        }
        if (state.currentExam?.id === action.payload.id) {
          state.currentExam = action.payload;
        }
        state.error = null;
      })
      .addCase(updateExam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete exam
    builder
      .addCase(deleteExam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exams = state.exams.filter(exam => exam.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.currentExam?.id === action.payload) {
          state.currentExam = null;
          state.examDetails = null;
        }
        state.error = null;
      })
      .addCase(deleteExam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Duplicate exam
    builder
      .addCase(duplicateExam.pending, (state) => {
        state.isDrafting = true;
        state.error = null;
      })
      .addCase(duplicateExam.fulfilled, (state, action) => {
        state.isDrafting = false;
        state.exams.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(duplicateExam.rejected, (state, action) => {
        state.isDrafting = false;
        state.error = action.payload;
      });

    // Publish exam
    builder
      .addCase(publishExam.pending, (state) => {
        state.isPublishing = true;
        state.error = null;
      })
      .addCase(publishExam.fulfilled, (state, action) => {
        state.isPublishing = false;
        const index = state.exams.findIndex(exam => exam.id === action.payload.id);
        if (index !== -1) {
          state.exams[index] = action.payload;
        }
        if (state.currentExam?.id === action.payload.id) {
          state.currentExam = action.payload;
        }
        state.error = null;
      })
      .addCase(publishExam.rejected, (state, action) => {
        state.isPublishing = false;
        state.error = action.payload;
      });

    // Unpublish exam
    builder
      .addCase(unpublishExam.pending, (state) => {
        state.isPublishing = true;
        state.error = null;
      })
      .addCase(unpublishExam.fulfilled, (state, action) => {
        state.isPublishing = false;
        const index = state.exams.findIndex(exam => exam.id === action.payload.id);
        if (index !== -1) {
          state.exams[index] = action.payload;
        }
        if (state.currentExam?.id === action.payload.id) {
          state.currentExam = action.payload;
        }
        state.error = null;
      })
      .addCase(unpublishExam.rejected, (state, action) => {
        state.isPublishing = false;
        state.error = action.payload;
      });

    // Add question to exam
    builder
      .addCase(addQuestionToExam.pending, (state) => {
        state.error = null;
      })
      .addCase(addQuestionToExam.fulfilled, (state, action) => {
        if (state.examDetails) {
          state.examDetails.questions = action.payload.questions;
        }
        state.error = null;
      })
      .addCase(addQuestionToExam.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Remove question from exam
    builder
      .addCase(removeQuestionFromExam.pending, (state) => {
        state.error = null;
      })
      .addCase(removeQuestionFromExam.fulfilled, (state, action) => {
        if (state.examDetails?.questions) {
          state.examDetails.questions = state.examDetails.questions.filter(
            q => q.id !== action.payload.questionId
          );
        }
        state.error = null;
      })
      .addCase(removeQuestionFromExam.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Reorder exam questions
    builder
      .addCase(reorderExamQuestions.pending, (state) => {
        state.error = null;
      })
      .addCase(reorderExamQuestions.fulfilled, (state, action) => {
        if (state.examDetails) {
          state.examDetails.questions = action.payload.questions;
        }
        state.error = null;
      })
      .addCase(reorderExamQuestions.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Fetch exam attempts
    builder
      .addCase(fetchExamAttempts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExamAttempts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.examAttempts = action.payload.data;
        state.error = null;
      })
      .addCase(fetchExamAttempts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch exam statistics
    builder
      .addCase(fetchExamStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExamStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.examStatistics = action.payload;
        state.error = null;
      })
      .addCase(fetchExamStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Export exam results
    builder
      .addCase(exportExamResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportExamResults.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(exportExamResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Generate exam preview
    builder
      .addCase(generateExamPreview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateExamPreview.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(generateExamPreview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Schedule exam
    builder
      .addCase(scheduleExam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(scheduleExam.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.exams.findIndex(exam => exam.id === action.payload.id);
        if (index !== -1) {
          state.exams[index] = action.payload;
        }
        if (state.currentExam?.id === action.payload.id) {
          state.currentExam = action.payload;
        }
        state.error = null;
      })
      .addCase(scheduleExam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setPagination,
  setCurrentExam,
  clearCurrentExam,
  updateExamInList,
  setExamDetails,
} = examSlice.actions;

export default examSlice.reducer;