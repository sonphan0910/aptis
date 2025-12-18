'use client';

import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert } from '@mui/material';
import { hideNotification } from '@/store/slices/uiSlice';

export default function AlertSnackbar() {
  const dispatch = useDispatch();
  const { notification } = useSelector(state => state.ui);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideNotification());
  };

  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={notification?.type || 'info'}
        sx={{ width: '100%' }}
      >
        {notification?.message}
      </Alert>
    </Snackbar>
  );
}