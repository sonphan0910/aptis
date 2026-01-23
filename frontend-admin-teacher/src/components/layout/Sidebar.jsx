'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Quiz as QuizIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Grading as GradingIcon,
  Assessment as AssessmentIcon,
  QuestionAnswer,
  BarChart,
} from '@mui/icons-material';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ROUTES } from '@/config/app.config';

// Menu items for Teacher role
const teacherMenuItems = [
  {
    title: 'Trang chủ',
    icon: DashboardIcon,
    path: ROUTES.DASHBOARD,
  },
  {
    title: 'Quản lý câu hỏi',
    icon: QuizIcon,
    path: ROUTES.TEACHER.QUESTIONS.LIST,
  },
  {
    title: 'Quản lý bài thi',
    icon: AssignmentIcon,
    path: ROUTES.TEACHER.EXAMS.LIST,
  },
  {
    title: 'Chấm bài',
    icon: GradingIcon,
    path: ROUTES.TEACHER.SUBMISSIONS.LIST,
  },
  {
    title: 'Báo cáo & Thống kê',
    icon: AssessmentIcon,
    path: ROUTES.TEACHER.REPORTS.LIST,
  },
];

// Menu items for Admin role
const adminMenuItems = [
  {
    title: 'Trang chủ',
    icon: DashboardIcon,
    path: ROUTES.DASHBOARD,
  },
  {
    title: 'Quản lý người dùng',
    icon: PeopleIcon,
    path: ROUTES.ADMIN.USERS.LIST,
  },
  {
    title: 'Báo cáo & Thống kê',
    icon: AssessmentIcon,
    path: ROUTES.TEACHER.REPORTS.LIST,
  },
];

export default function Sidebar({ onClose, currentPath }) {
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role || 'teacher';
  
  const menuItems = useMemo(() => {
    return userRole === 'admin' ? adminMenuItems : teacherMenuItems;
  }, [userRole]);
  
  const router = useRouter();

  const handleItemClick = (item) => {
    router.push(item.path);
  };

  const isActive = (path) => {
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  return (
    <Box sx={{ height: '100%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="primary">
          APTIS Admin
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ pt: 1, flex: 1 }}>
        {menuItems.map((item, index) => (
          <Box key={item.title}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleItemClick(item)}
                selected={isActive(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <item.icon />
                </ListItemIcon>
                <ListItemText 
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>

            {/* Divider after main sections */}
            {index === 0 && <Divider sx={{ my: 1, mx: 2 }} />}
          </Box>
        ))}
      </List>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          © 2024 APTIS System
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          v1.0.0
        </Typography>
      </Box>
    </Box>
  );
}