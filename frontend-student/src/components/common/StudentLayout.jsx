'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import {
  Home,
  Assessment,
  History,
  TrendingUp,
  Person,
  Notifications,
  Menu as MenuIcon,
  Logout,
  Settings,
  School,
} from '@mui/icons-material';
import { clearAuth } from '@/store/slices/authSlice';
import LoadingSpinner from './LoadingSpinner';
import Footer from './Footer';
import PageTransition from './PageTransition';
import { useNavigation } from '@/hooks/useNavigation';

const bottomNavItems = [
  { label: 'Trang chủ', icon: <Home />, path: '/home' },
  { label: 'Đề thi', icon: <Assessment />, path: '/exams' },
  { label: 'Ôn tập', icon: <TrendingUp />, path: '/practice' },
  { label: 'Kết quả', icon: <History />, path: '/results' },
  { label: 'Cá nhân', icon: <Person />, path: '/profile' },
];

const drawerItems = [
  { label: 'Trang chủ', icon: <Home />, path: '/home' },
  { label: 'Đề thi', icon: <Assessment />, path: '/exams' },
  { label: 'Ôn tập', icon: <TrendingUp />, path: '/practice' },
  { label: 'Kết quả', icon: <History />, path: '/results' },
  { label: 'Cá nhân', icon: <Person />, path: '/profile' },
];

export default function StudentLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { navigate, isNavigating } = useNavigation();
  
  const { user } = useSelector((state) => state.auth);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(clearAuth());
    handleProfileMenuClose();
    router.push('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const getCurrentBottomNavValue = () => {
    const currentItem = bottomNavItems.find(item => pathname.startsWith(item.path));
    return currentItem ? bottomNavItems.indexOf(currentItem) : 0;
  };

  const isMenuOpen = Boolean(anchorEl);

  const renderProfileMenu = (
    <Menu
      anchorEl={anchorEl}
      open={isMenuOpen}
      onClose={handleProfileMenuClose}
      onClick={handleProfileMenuClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          mt: 1.5,
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={() => handleNavigation('/profile')}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {user?.full_name?.charAt(0)?.toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="body1">{user?.full_name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
      </MenuItem>
      <Divider />
      <MenuItem onClick={() => handleNavigation('/profile')}>
        <ListItemIcon>
          <Settings fontSize="small" />
        </ListItemIcon>
        Settings
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        Sign out
      </MenuItem>
    </Menu>
  );

  const renderDrawer = (
    <Drawer
      variant="temporary"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <School sx={{ color: 'primary.main' }} />
          <Typography variant="h6" color="primary">
            APTIS Student
          </Typography>
        </Box>
      </Box>
      <List>
        {drawerItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={pathname.startsWith(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: 'background.default',
      position: 'relative'
    }}>
      {/* Navigation Loading Overlay */}
      {isNavigating && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <LoadingSpinner message="Đang chuyển trang..." />
        </Box>
      )}
      
      {/* Top App Bar */}
      <AppBar position="fixed" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <School sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            APTIS Student
          </Typography>

          {/* Desktop Navigation Links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5, mr: 3 }}>
              {drawerItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1,
                    opacity: pathname.startsWith(item.path) ? 1 : 0.7,
                    backgroundColor: pathname.startsWith(item.path) ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      opacity: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Notifications */}
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={0} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* User Profile */}
          <IconButton
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
              {user?.full_name?.charAt(0)?.toUpperCase() || 'S'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {renderProfileMenu}
      {isMobile && renderDrawer}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh)',
          pt: 8,
          pb: isMobile ? 7 : 0,
        }}
      >
        <Box sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
          <PageTransition>
            {children}
          </PageTransition>
        </Box>
      </Box>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <BottomNavigation
          value={getCurrentBottomNavValue()}
          onChange={(event, newValue) => {
            navigate(bottomNavItems[newValue].path);
          }}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          {bottomNavItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      )}

      {/* Footer - Always at bottom */}
      <Box component="footer" sx={{ marginTop: 'auto', flexShrink: 0 }}>
        <Footer />
      </Box>
    </Box>
  );
}