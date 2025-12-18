import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  snackbar: {
    open: false,
    message: '',
    severity: 'info', // success, error, warning, info
  },
  confirmDialog: {
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  },
  loading: {
    global: false,
    operations: {}, // { operationId: true/false }
  },
  theme: 'light',
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Snackbar
    showSnackbar: (state, action) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
    
    // Confirm Dialog
    showConfirmDialog: (state, action) => {
      state.confirmDialog = {
        open: true,
        title: action.payload.title,
        message: action.payload.message,
        onConfirm: action.payload.onConfirm,
        onCancel: action.payload.onCancel,
      };
    },
    hideConfirmDialog: (state) => {
      state.confirmDialog.open = false;
      state.confirmDialog.onConfirm = null;
      state.confirmDialog.onCancel = null;
    },
    
    // Loading
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setOperationLoading: (state, action) => {
      const { operationId, isLoading } = action.payload;
      if (isLoading) {
        state.loading.operations[operationId] = true;
      } else {
        delete state.loading.operations[operationId];
      }
    },
    
    // Notifications
    addNotification: (state, action) => {
      state.notifications.unshift({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
        read: false,
      });
    },
    markNotificationRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
    
    // Theme
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const {
  showSnackbar,
  hideSnackbar,
  showConfirmDialog,
  hideConfirmDialog,
  setGlobalLoading,
  setOperationLoading,
  addNotification,
  markNotificationRead,
  removeNotification,
  markAllNotificationsRead,
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
} = uiSlice.actions;

export default uiSlice.reducer;