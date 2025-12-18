import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { criteriaApi } from '@/services/criteriaService';

const initialState = {
  criteria: [],
  currentCriteria: null,
  templates: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    type: 'all',
    category: 'all',
    search: '',
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCriteria = createAsyncThunk(
  'criteria/fetchCriteria',
  async ({ page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await criteriaApi.getCriteria({ page, limit, ...filters });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch criteria');
    }
  }
);

export const fetchCriteriaById = createAsyncThunk(
  'criteria/fetchCriteriaById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await criteriaApi.getCriteriaById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch criteria');
    }
  }
);

export const createCriteria = createAsyncThunk(
  'criteria/createCriteria',
  async (criteriaData, { rejectWithValue }) => {
    try {
      const response = await criteriaApi.createCriteria(criteriaData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create criteria');
    }
  }
);

export const updateCriteria = createAsyncThunk(
  'criteria/updateCriteria',
  async ({ id, criteriaData }, { rejectWithValue }) => {
    try {
      const response = await criteriaApi.updateCriteria(id, criteriaData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update criteria');
    }
  }
);

export const deleteCriteria = createAsyncThunk(
  'criteria/deleteCriteria',
  async (id, { rejectWithValue }) => {
    try {
      await criteriaApi.deleteCriteria(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete criteria');
    }
  }
);

export const duplicateCriteria = createAsyncThunk(
  'criteria/duplicateCriteria',
  async (id, { rejectWithValue }) => {
    try {
      const response = await criteriaApi.duplicateCriteria(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to duplicate criteria');
    }
  }
);

export const fetchCriteriaTemplates = createAsyncThunk(
  'criteria/fetchCriteriaTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await criteriaApi.getCriteriaTemplates();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch criteria templates');
    }
  }
);

export const createCriteriaTemplate = createAsyncThunk(
  'criteria/createCriteriaTemplate',
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await criteriaApi.createCriteriaTemplate(templateData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create criteria template');
    }
  }
);

export const applyCriteriaTemplate = createAsyncThunk(
  'criteria/applyCriteriaTemplate',
  async ({ templateId, targetData }, { rejectWithValue }) => {
    try {
      const response = await criteriaApi.applyCriteriaTemplate(templateId, targetData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to apply criteria template');
    }
  }
);

export const validateCriteria = createAsyncThunk(
  'criteria/validateCriteria',
  async (criteriaData, { rejectWithValue }) => {
    try {
      const response = await criteriaApi.validateCriteria(criteriaData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to validate criteria');
    }
  }
);

export const exportCriteria = createAsyncThunk(
  'criteria/exportCriteria',
  async ({ filters, format }, { rejectWithValue }) => {
    try {
      const response = await criteriaApi.exportCriteria(filters, format);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to export criteria');
    }
  }
);

export const importCriteria = createAsyncThunk(
  'criteria/importCriteria',
  async ({ file, format }, { rejectWithValue }) => {
    try {
      const response = await criteriaApi.importCriteria(file, format);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to import criteria');
    }
  }
);

const criteriaSlice = createSlice({
  name: 'criteria',
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
    setCurrentCriteria: (state, action) => {
      state.currentCriteria = action.payload;
    },
    clearCurrentCriteria: (state) => {
      state.currentCriteria = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch criteria
    builder
      .addCase(fetchCriteria.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCriteria.fulfilled, (state, action) => {
        state.isLoading = false;
        state.criteria = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
        state.error = null;
      })
      .addCase(fetchCriteria.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch criteria by ID
    builder
      .addCase(fetchCriteriaById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCriteriaById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCriteria = action.payload;
        state.error = null;
      })
      .addCase(fetchCriteriaById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create criteria
    builder
      .addCase(createCriteria.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCriteria.fulfilled, (state, action) => {
        state.isLoading = false;
        state.criteria.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createCriteria.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update criteria
    builder
      .addCase(updateCriteria.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCriteria.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.criteria.findIndex(criteria => criteria.id === action.payload.id);
        if (index !== -1) {
          state.criteria[index] = action.payload;
        }
        if (state.currentCriteria?.id === action.payload.id) {
          state.currentCriteria = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCriteria.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete criteria
    builder
      .addCase(deleteCriteria.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCriteria.fulfilled, (state, action) => {
        state.isLoading = false;
        state.criteria = state.criteria.filter(criteria => criteria.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.currentCriteria?.id === action.payload) {
          state.currentCriteria = null;
        }
        state.error = null;
      })
      .addCase(deleteCriteria.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Duplicate criteria
    builder
      .addCase(duplicateCriteria.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(duplicateCriteria.fulfilled, (state, action) => {
        state.isLoading = false;
        state.criteria.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(duplicateCriteria.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch criteria templates
    builder
      .addCase(fetchCriteriaTemplates.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchCriteriaTemplates.fulfilled, (state, action) => {
        state.templates = action.payload;
        state.error = null;
      })
      .addCase(fetchCriteriaTemplates.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Create criteria template
    builder
      .addCase(createCriteriaTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCriteriaTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates.unshift(action.payload);
        state.error = null;
      })
      .addCase(createCriteriaTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Apply criteria template
    builder
      .addCase(applyCriteriaTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyCriteriaTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCriteria = action.payload;
        state.error = null;
      })
      .addCase(applyCriteriaTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Validate criteria
    builder
      .addCase(validateCriteria.pending, (state) => {
        state.error = null;
      })
      .addCase(validateCriteria.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(validateCriteria.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Export criteria
    builder
      .addCase(exportCriteria.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportCriteria.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(exportCriteria.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Import criteria
    builder
      .addCase(importCriteria.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(importCriteria.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(importCriteria.rejected, (state, action) => {
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
  setCurrentCriteria,
  clearCurrentCriteria,
} = criteriaSlice.actions;

export default criteriaSlice.reducer;