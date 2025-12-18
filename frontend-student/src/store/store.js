import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import examReducer from './slices/examSlice';
import attemptReducer from './slices/attemptSlice';
import dashboardReducer from './slices/dashboardSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    exams: examReducer,
    attempts: attemptReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});
