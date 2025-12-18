import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportApi } from '@/services/reportService';

const initialState = {
  reports: [],
  currentReport: null,
  reportData: null,
  analytics: {
    overview: null,
    performance: null,
    trends: null,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    type: 'all',
    dateFrom: null,
    dateTo: null,
    examId: null,
    userId: null,
    search: '',
  },
  isLoading: false,
  error: null,
  isGenerating: false,
  generationProgress: 0,
};

// Async thunks
export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async ({ page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await reportApi.getReports({ page, limit, ...filters });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reports');
    }
  }
);

export const fetchReportById = createAsyncThunk(
  'reports/fetchReportById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await reportApi.getReportById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch report');
    }
  }
);

export const generateExamReport = createAsyncThunk(
  'reports/generateExamReport',
  async ({ examId, reportType, options }, { rejectWithValue }) => {
    try {
      const response = await reportApi.generateExamReport(examId, reportType, options);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate exam report');
    }
  }
);

export const generateUserReport = createAsyncThunk(
  'reports/generateUserReport',
  async ({ userId, reportType, options }, { rejectWithValue }) => {
    try {
      const response = await reportApi.generateUserReport(userId, reportType, options);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate user report');
    }
  }
);

export const generateSystemReport = createAsyncThunk(
  'reports/generateSystemReport',
  async ({ reportType, options }, { rejectWithValue }) => {
    try {
      const response = await reportApi.generateSystemReport(reportType, options);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate system report');
    }
  }
);

export const generateCustomReport = createAsyncThunk(
  'reports/generateCustomReport',
  async (reportConfig, { rejectWithValue }) => {
    try {
      const response = await reportApi.generateCustomReport(reportConfig);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate custom report');
    }
  }
);

export const deleteReport = createAsyncThunk(
  'reports/deleteReport',
  async (id, { rejectWithValue }) => {
    try {
      await reportApi.deleteReport(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete report');
    }
  }
);

export const exportReport = createAsyncThunk(
  'reports/exportReport',
  async ({ id, format }, { rejectWithValue }) => {
    try {
      const response = await reportApi.exportReport(id, format);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to export report');
    }
  }
);

export const scheduleReport = createAsyncThunk(
  'reports/scheduleReport',
  async ({ reportConfig, schedule }, { rejectWithValue }) => {
    try {
      const response = await reportApi.scheduleReport(reportConfig, schedule);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to schedule report');
    }
  }
);

export const fetchAnalyticsOverview = createAsyncThunk(
  'reports/fetchAnalyticsOverview',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await reportApi.getAnalyticsOverview(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch analytics overview');
    }
  }
);

export const fetchPerformanceAnalytics = createAsyncThunk(
  'reports/fetchPerformanceAnalytics',
  async ({ examId, filters }, { rejectWithValue }) => {
    try {
      const response = await reportApi.getPerformanceAnalytics(examId, filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch performance analytics');
    }
  }
);

export const fetchTrendAnalytics = createAsyncThunk(
  'reports/fetchTrendAnalytics',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await reportApi.getTrendAnalytics(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch trend analytics');
    }
  }
);

export const fetchComparisonReport = createAsyncThunk(
  'reports/fetchComparisonReport',
  async ({ type, compareItems, options }, { rejectWithValue }) => {
    try {
      const response = await reportApi.getComparisonReport(type, compareItems, options);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch comparison report');
    }
  }
);

export const shareReport = createAsyncThunk(
  'reports/shareReport',
  async ({ id, shareConfig }, { rejectWithValue }) => {
    try {
      const response = await reportApi.shareReport(id, shareConfig);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to share report');
    }
  }
);

export const validateReportData = createAsyncThunk(
  'reports/validateReportData',
  async (reportConfig, { rejectWithValue }) => {
    try {
      const response = await reportApi.validateReportData(reportConfig);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to validate report data');
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
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
    setCurrentReport: (state, action) => {
      state.currentReport = action.payload;
    },
    clearCurrentReport: (state) => {
      state.currentReport = null;
      state.reportData = null;
    },
    setReportData: (state, action) => {
      state.reportData = action.payload;
    },
    setGenerationProgress: (state, action) => {
      state.generationProgress = action.payload;
    },
    clearAnalytics: (state) => {
      state.analytics = initialState.analytics;
    },
  },
  extraReducers: (builder) => {
    // Fetch reports
    builder
      .addCase(fetchReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
        state.error = null;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch report by ID
    builder
      .addCase(fetchReportById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReport = action.payload;
        state.reportData = action.payload.data;
        state.error = null;
      })
      .addCase(fetchReportById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Generate exam report
    builder
      .addCase(generateExamReport.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
        state.generationProgress = 0;
      })
      .addCase(generateExamReport.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.generationProgress = 100;
        state.reports.unshift(action.payload);
        state.currentReport = action.payload;
        state.reportData = action.payload.data;
        state.error = null;
      })
      .addCase(generateExamReport.rejected, (state, action) => {
        state.isGenerating = false;
        state.generationProgress = 0;
        state.error = action.payload;
      });

    // Generate user report
    builder
      .addCase(generateUserReport.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
        state.generationProgress = 0;
      })
      .addCase(generateUserReport.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.generationProgress = 100;
        state.reports.unshift(action.payload);
        state.currentReport = action.payload;
        state.reportData = action.payload.data;
        state.error = null;
      })
      .addCase(generateUserReport.rejected, (state, action) => {
        state.isGenerating = false;
        state.generationProgress = 0;
        state.error = action.payload;
      });

    // Generate system report
    builder
      .addCase(generateSystemReport.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
        state.generationProgress = 0;
      })
      .addCase(generateSystemReport.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.generationProgress = 100;
        state.reports.unshift(action.payload);
        state.currentReport = action.payload;
        state.reportData = action.payload.data;
        state.error = null;
      })
      .addCase(generateSystemReport.rejected, (state, action) => {
        state.isGenerating = false;
        state.generationProgress = 0;
        state.error = action.payload;
      });

    // Generate custom report
    builder
      .addCase(generateCustomReport.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
        state.generationProgress = 0;
      })
      .addCase(generateCustomReport.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.generationProgress = 100;
        state.reports.unshift(action.payload);
        state.currentReport = action.payload;
        state.reportData = action.payload.data;
        state.error = null;
      })
      .addCase(generateCustomReport.rejected, (state, action) => {
        state.isGenerating = false;
        state.generationProgress = 0;
        state.error = action.payload;
      });

    // Delete report
    builder
      .addCase(deleteReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = state.reports.filter(report => report.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.currentReport?.id === action.payload) {
          state.currentReport = null;
          state.reportData = null;
        }
        state.error = null;
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Export report
    builder
      .addCase(exportReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportReport.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(exportReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Schedule report
    builder
      .addCase(scheduleReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(scheduleReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.unshift(action.payload);
        state.error = null;
      })
      .addCase(scheduleReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch analytics overview
    builder
      .addCase(fetchAnalyticsOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics.overview = action.payload;
        state.error = null;
      })
      .addCase(fetchAnalyticsOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch performance analytics
    builder
      .addCase(fetchPerformanceAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPerformanceAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics.performance = action.payload;
        state.error = null;
      })
      .addCase(fetchPerformanceAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch trend analytics
    builder
      .addCase(fetchTrendAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrendAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics.trends = action.payload;
        state.error = null;
      })
      .addCase(fetchTrendAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch comparison report
    builder
      .addCase(fetchComparisonReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComparisonReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reportData = action.payload;
        state.error = null;
      })
      .addCase(fetchComparisonReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Share report
    builder
      .addCase(shareReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(shareReport.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(shareReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Validate report data
    builder
      .addCase(validateReportData.pending, (state) => {
        state.error = null;
      })
      .addCase(validateReportData.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(validateReportData.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setPagination,
  setCurrentReport,
  clearCurrentReport,
  setReportData,
  setGenerationProgress,
  clearAnalytics,
} = reportSlice.actions;

export default reportSlice.reducer;