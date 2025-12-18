import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { submissionApi } from '@/services/submissionService';

const initialState = {
  submissions: [],
  currentSubmission: null,
  submissionDetails: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    status: 'all',
    examId: null,
    userId: null,
    dateFrom: null,
    dateTo: null,
    search: '',
  },
  isLoading: false,
  error: null,
  gradingProgress: 0,
};

// Async thunks
export const fetchSubmissions = createAsyncThunk(
  'submissions/fetchSubmissions',
  async ({ page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await submissionApi.getSubmissions({ page, limit, ...filters });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch submissions');
    }
  }
);

export const fetchSubmissionById = createAsyncThunk(
  'submissions/fetchSubmissionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await submissionApi.getSubmissionById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch submission');
    }
  }
);

export const fetchSubmissionsByExam = createAsyncThunk(
  'submissions/fetchSubmissionsByExam',
  async ({ examId, page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await submissionApi.getSubmissionsByExam(examId, { page, limit, ...filters });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch exam submissions');
    }
  }
);

export const fetchSubmissionsByUser = createAsyncThunk(
  'submissions/fetchSubmissionsByUser',
  async ({ userId, page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await submissionApi.getSubmissionsByUser(userId, { page, limit, ...filters });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user submissions');
    }
  }
);

export const gradeSubmission = createAsyncThunk(
  'submissions/gradeSubmission',
  async ({ id, scores, feedback }, { rejectWithValue }) => {
    try {
      const response = await submissionApi.gradeSubmission(id, { scores, feedback });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to grade submission');
    }
  }
);

export const updateSubmissionScore = createAsyncThunk(
  'submissions/updateSubmissionScore',
  async ({ id, questionId, score, feedback }, { rejectWithValue }) => {
    try {
      const response = await submissionApi.updateSubmissionScore(id, questionId, { score, feedback });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update submission score');
    }
  }
);

export const bulkGradeSubmissions = createAsyncThunk(
  'submissions/bulkGradeSubmissions',
  async ({ submissionIds, gradingData }, { rejectWithValue }) => {
    try {
      const response = await submissionApi.bulkGradeSubmissions(submissionIds, gradingData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to bulk grade submissions');
    }
  }
);

export const exportSubmissionResults = createAsyncThunk(
  'submissions/exportSubmissionResults',
  async ({ examId, format, filters }, { rejectWithValue }) => {
    try {
      const response = await submissionApi.exportSubmissionResults(examId, format, filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to export submission results');
    }
  }
);

export const flagSubmission = createAsyncThunk(
  'submissions/flagSubmission',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await submissionApi.flagSubmission(id, reason);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to flag submission');
    }
  }
);

export const unflagSubmission = createAsyncThunk(
  'submissions/unflagSubmission',
  async (id, { rejectWithValue }) => {
    try {
      const response = await submissionApi.unflagSubmission(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to unflag submission');
    }
  }
);

export const reassignSubmission = createAsyncThunk(
  'submissions/reassignSubmission',
  async ({ id, newGraderId }, { rejectWithValue }) => {
    try {
      const response = await submissionApi.reassignSubmission(id, newGraderId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reassign submission');
    }
  }
);

export const sendFeedback = createAsyncThunk(
  'submissions/sendFeedback',
  async ({ id, feedback }, { rejectWithValue }) => {
    try {
      const response = await submissionApi.sendFeedback(id, feedback);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send feedback');
    }
  }
);

export const generateSubmissionReport = createAsyncThunk(
  'submissions/generateSubmissionReport',
  async ({ id, reportType }, { rejectWithValue }) => {
    try {
      const response = await submissionApi.generateSubmissionReport(id, reportType);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate submission report');
    }
  }
);

export const autoGradeSubmissions = createAsyncThunk(
  'submissions/autoGradeSubmissions',
  async ({ examId, submissionIds }, { rejectWithValue }) => {
    try {
      const response = await submissionApi.autoGradeSubmissions(examId, submissionIds);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to auto-grade submissions');
    }
  }
);

const submissionSlice = createSlice({
  name: 'submissions',
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
    setCurrentSubmission: (state, action) => {
      state.currentSubmission = action.payload;
    },
    clearCurrentSubmission: (state) => {
      state.currentSubmission = null;
      state.submissionDetails = null;
    },
    setSubmissionDetails: (state, action) => {
      state.submissionDetails = action.payload;
    },
    setGradingProgress: (state, action) => {
      state.gradingProgress = action.payload;
    },
    updateSubmissionInList: (state, action) => {
      const index = state.submissions.findIndex(submission => submission.id === action.payload.id);
      if (index !== -1) {
        state.submissions[index] = { ...state.submissions[index], ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch submissions
    builder
      .addCase(fetchSubmissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submissions = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
        state.error = null;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch submission by ID
    builder
      .addCase(fetchSubmissionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubmissionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSubmission = action.payload;
        state.submissionDetails = action.payload;
        state.error = null;
      })
      .addCase(fetchSubmissionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch submissions by exam
    builder
      .addCase(fetchSubmissionsByExam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubmissionsByExam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submissions = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
        state.error = null;
      })
      .addCase(fetchSubmissionsByExam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch submissions by user
    builder
      .addCase(fetchSubmissionsByUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubmissionsByUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submissions = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
        state.error = null;
      })
      .addCase(fetchSubmissionsByUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Grade submission
    builder
      .addCase(gradeSubmission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(gradeSubmission.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.submissions.findIndex(submission => submission.id === action.payload.id);
        if (index !== -1) {
          state.submissions[index] = action.payload;
        }
        if (state.currentSubmission?.id === action.payload.id) {
          state.currentSubmission = action.payload;
          state.submissionDetails = action.payload;
        }
        state.error = null;
      })
      .addCase(gradeSubmission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update submission score
    builder
      .addCase(updateSubmissionScore.pending, (state) => {
        state.error = null;
      })
      .addCase(updateSubmissionScore.fulfilled, (state, action) => {
        const index = state.submissions.findIndex(submission => submission.id === action.payload.id);
        if (index !== -1) {
          state.submissions[index] = action.payload;
        }
        if (state.currentSubmission?.id === action.payload.id) {
          state.currentSubmission = action.payload;
          state.submissionDetails = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSubmissionScore.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Bulk grade submissions
    builder
      .addCase(bulkGradeSubmissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.gradingProgress = 0;
      })
      .addCase(bulkGradeSubmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gradingProgress = 100;
        // Update submissions in the list
        const updatedSubmissions = action.payload;
        updatedSubmissions.forEach(updatedSubmission => {
          const index = state.submissions.findIndex(submission => submission.id === updatedSubmission.id);
          if (index !== -1) {
            state.submissions[index] = updatedSubmission;
          }
        });
        state.error = null;
      })
      .addCase(bulkGradeSubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.gradingProgress = 0;
        state.error = action.payload;
      });

    // Export submission results
    builder
      .addCase(exportSubmissionResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportSubmissionResults.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(exportSubmissionResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Flag submission
    builder
      .addCase(flagSubmission.pending, (state) => {
        state.error = null;
      })
      .addCase(flagSubmission.fulfilled, (state, action) => {
        const index = state.submissions.findIndex(submission => submission.id === action.payload.id);
        if (index !== -1) {
          state.submissions[index] = { ...state.submissions[index], ...action.payload };
        }
        if (state.currentSubmission?.id === action.payload.id) {
          state.currentSubmission = { ...state.currentSubmission, ...action.payload };
          state.submissionDetails = { ...state.submissionDetails, ...action.payload };
        }
        state.error = null;
      })
      .addCase(flagSubmission.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Unflag submission
    builder
      .addCase(unflagSubmission.pending, (state) => {
        state.error = null;
      })
      .addCase(unflagSubmission.fulfilled, (state, action) => {
        const index = state.submissions.findIndex(submission => submission.id === action.payload.id);
        if (index !== -1) {
          state.submissions[index] = { ...state.submissions[index], ...action.payload };
        }
        if (state.currentSubmission?.id === action.payload.id) {
          state.currentSubmission = { ...state.currentSubmission, ...action.payload };
          state.submissionDetails = { ...state.submissionDetails, ...action.payload };
        }
        state.error = null;
      })
      .addCase(unflagSubmission.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Reassign submission
    builder
      .addCase(reassignSubmission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reassignSubmission.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.submissions.findIndex(submission => submission.id === action.payload.id);
        if (index !== -1) {
          state.submissions[index] = { ...state.submissions[index], ...action.payload };
        }
        if (state.currentSubmission?.id === action.payload.id) {
          state.currentSubmission = { ...state.currentSubmission, ...action.payload };
          state.submissionDetails = { ...state.submissionDetails, ...action.payload };
        }
        state.error = null;
      })
      .addCase(reassignSubmission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Send feedback
    builder
      .addCase(sendFeedback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.submissions.findIndex(submission => submission.id === action.payload.id);
        if (index !== -1) {
          state.submissions[index] = { ...state.submissions[index], ...action.payload };
        }
        if (state.currentSubmission?.id === action.payload.id) {
          state.currentSubmission = { ...state.currentSubmission, ...action.payload };
          state.submissionDetails = { ...state.submissionDetails, ...action.payload };
        }
        state.error = null;
      })
      .addCase(sendFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Generate submission report
    builder
      .addCase(generateSubmissionReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateSubmissionReport.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(generateSubmissionReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Auto-grade submissions
    builder
      .addCase(autoGradeSubmissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.gradingProgress = 0;
      })
      .addCase(autoGradeSubmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gradingProgress = 100;
        // Update submissions in the list
        const autoGradedSubmissions = action.payload;
        autoGradedSubmissions.forEach(gradedSubmission => {
          const index = state.submissions.findIndex(submission => submission.id === gradedSubmission.id);
          if (index !== -1) {
            state.submissions[index] = gradedSubmission;
          }
        });
        state.error = null;
      })
      .addCase(autoGradeSubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.gradingProgress = 0;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setPagination,
  setCurrentSubmission,
  clearCurrentSubmission,
  setSubmissionDetails,
  setGradingProgress,
  updateSubmissionInList,
} = submissionSlice.actions;

export default submissionSlice.reducer;