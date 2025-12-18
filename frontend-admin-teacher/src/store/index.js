import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import questionSlice from './slices/questionSlice';
import examSlice from './slices/examSlice';
import userSlice from './slices/userSlice';
import submissionSlice from './slices/submissionSlice';
import criteriaSlice from './slices/criteriaSlice';
import reportSlice from './slices/reportSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    questions: questionSlice,
    exams: examSlice,
    users: userSlice,
    submissions: submissionSlice,
    criteria: criteriaSlice,
    reports: reportSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['auth.token'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Typed hooks for better development experience
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export default store;