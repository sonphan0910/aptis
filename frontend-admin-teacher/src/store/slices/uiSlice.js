import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  theme: 'light',
  loading: {},
  notifications: [],
  confirmDialog: {
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    severity: 'info',
  },
  pageTitle: '',
  breadcrumbs: [],
  isMobile: false,
  bottomNavValue: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLoading: (state, action) => {
      const { key, isLoading } = action.payload;
      if (isLoading) {
        state.loading[key] = true;
      } else {
        delete state.loading[key];
      }
    },
    clearAllLoading: (state) => {
      state.loading = {};
    },
    addNotification: (state, action) => {
      const notification = {
        ...action.payload,
        id: `notification-${Date.now()}-${Math.random()}`,
        autoHide: action.payload.autoHide ?? true,
        duration: action.payload.duration ?? 5000,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    showConfirmDialog: (state, action) => {
      state.confirmDialog = {
        ...action.payload,
        open: true,
      };
    },
    hideConfirmDialog: (state) => {
      state.confirmDialog = {
        ...initialState.confirmDialog,
        open: false,
      };
    },
    setPageTitle: (state, action) => {
      state.pageTitle = action.payload;
    },
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    setIsMobile: (state, action) => {
      state.isMobile = action.payload;
      // Auto-close sidebar on mobile
      if (action.payload) {
        state.sidebarOpen = false;
      }
    },
    setBottomNavValue: (state, action) => {
      state.bottomNavValue = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setLoading,
  clearAllLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  showConfirmDialog,
  hideConfirmDialog,
  setPageTitle,
  setBreadcrumbs,
  setIsMobile,
  setBottomNavValue,
} = uiSlice.actions;

// Alias for compatibility
export const hideNotification = removeNotification;

// Helper function for showing notifications
export const showNotification = (notification) => (dispatch) => {
  dispatch(addNotification(notification));
};

// Selectors
export const selectIsLoading = (state, key) => {
  if (!key) {
    return Object.keys(state.ui.loading).length > 0;
  }
  return state.ui.loading[key] || false;
};

export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectTheme = (state) => state.ui.theme;
export const selectNotifications = (state) => state.ui.notifications;
export const selectConfirmDialog = (state) => state.ui.confirmDialog;
export const selectPageTitle = (state) => state.ui.pageTitle;
export const selectBreadcrumbs = (state) => state.ui.breadcrumbs;
export const selectIsMobile = (state) => state.ui.isMobile;
export const selectBottomNavValue = (state) => state.ui.bottomNavValue;

export default uiSlice.reducer;