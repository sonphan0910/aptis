'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  Settings,
  Person,
  School,
} from '@mui/icons-material';
import { logout } from '@/store/slices/authSlice';
import { toggleSidebar, setSidebarOpen } from '@/store/slices/uiSlice';
import Sidebar from './Sidebar';
import Notifications from './Notifications';

const DRAWER_WIDTH = 280;

export default function DashboardLayout({ children }) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const { user } = useSelector((state) => state.auth);
  const { sidebarOpen, mobileOpen } = useSelector((state) => state.ui);

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  // Handle drawer toggle for mobile
  useEffect(() => {
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  }, [pathname, isMobile, dispatch]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      dispatch(setSidebarOpen(!mobileOpen));
    } else {
      dispatch(toggleSidebar());
    }
  };

  const handleUserMenuOpen = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorElUser(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await dispatch(logout());
    router.push('/login');
  };

  const handleProfile = () => {
    handleUserMenuClose();
    router.push('/profile');
  };

  const handleSettings = () => {
    handleUserMenuClose();
    router.push('/settings');
  };

  const getPageTitle = () => {
    const path = pathname.split('/')[1];
    const titles = {
      dashboard: 'Trang chủ',
      questions: 'Quản lý câu hỏi',
      exams: 'Quản lý bài thi',
      users: 'Quản lý người dùng',
      submissions: 'Chấm bài',
      reports: 'Báo cáo & Thống kê',
      criteria: 'Tiêu chí đánh giá',
      profile: 'Hồ sơ cá nhân',
      settings: 'Cài đặt',
    };
    return titles[path] || 'APTIS Admin';
  };

  const drawerContent = (
    <Sidebar
      onClose={() => dispatch(setSidebarOpen(false))}
      currentPath={pathname}
    />
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { lg: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { lg: sidebarOpen ? `${DRAWER_WIDTH}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <School sx={{ mr: 1 }} />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
              APTIS
            </Typography>
          </Box>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, ml: 2 }}>
            {getPageTitle()}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Notifications */}
            <Tooltip title="Thông báo">
              <IconButton
                size="large"
                color="inherit"
                onClick={handleNotificationOpen}
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <Tooltip title="Tài khoản">
              <IconButton
                size="large"
                onClick={handleUserMenuOpen}
                color="inherit"
              >
                {user?.avatar ? (
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {user?.name || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || 'email@example.com'}
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleProfile}>
          <Person sx={{ mr: 2 }} />
          Hồ sơ cá nhân
        </MenuItem>
        <MenuItem onClick={handleSettings}>
          <Settings sx={{ mr: 2 }} />
          Cài đặt
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 2 }} />
          Đăng xuất
        </MenuItem>
      </Menu>

      {/* Notifications Popover */}
      <Notifications
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
      />

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { lg: sidebarOpen ? DRAWER_WIDTH : 0 }, flexShrink: { lg: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => dispatch(setSidebarOpen(false))}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="persistent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open={sidebarOpen}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { lg: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}