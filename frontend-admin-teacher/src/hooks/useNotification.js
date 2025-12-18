'use client';

import { useDispatch } from 'react-redux';
import { showNotification, hideNotification } from '@/store/slices/uiSlice';

export function useNotification() {
  const dispatch = useDispatch();

  const showSuccess = (message) => {
    dispatch(showNotification({
      message,
      type: 'success'
    }));
  };

  const showError = (message) => {
    dispatch(showNotification({
      message,
      type: 'error'
    }));
  };

  const showWarning = (message) => {
    dispatch(showNotification({
      message,
      type: 'warning'
    }));
  };

  const showInfo = (message) => {
    dispatch(showNotification({
      message,
      type: 'info'
    }));
  };

  const hide = () => {
    dispatch(hideNotification());
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hide
  };
}