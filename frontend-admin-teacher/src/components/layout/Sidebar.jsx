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
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Quiz as QuizIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Grading as GradingIcon,
  Assessment as AssessmentIcon,
  Rule as RuleIcon,
  ExpandLess,
  ExpandMore,
  Close as CloseIcon,
  QuestionAnswer,
  Create,
  LibraryBooks,
  BarChart,
  TrendingUp,
  Analytics,
} from '@mui/icons-material';
import { useState, useMemo } from 'react';
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
    children: [
      { title: 'Danh sách câu hỏi', icon: QuestionAnswer, path: ROUTES.TEACHER.QUESTIONS.LIST },
      { title: 'Tạo câu hỏi mới', icon: Create, path: ROUTES.TEACHER.QUESTIONS.CREATE },
    ],
  },
  {
    title: 'Quản lý bài thi',
    icon: AssignmentIcon,
    path: ROUTES.TEACHER.EXAMS.LIST,
    children: [
      { title: 'Danh sách bài thi', icon: AssignmentIcon, path: ROUTES.TEACHER.EXAMS.LIST },
      { title: 'Tạo bài thi mới', icon: Create, path: ROUTES.TEACHER.EXAMS.CREATE },
    ],
  },
  {
    title: 'Chấm bài',
    icon: GradingIcon,
    path: ROUTES.TEACHER.SUBMISSIONS.LIST,
    children: [
      { title: 'Danh sách bài làm', icon: GradingIcon, path: ROUTES.TEACHER.SUBMISSIONS.LIST },
    ],
  },
  {
    title: 'Báo cáo & Thống kê',
    icon: AssessmentIcon,
    path: ROUTES.TEACHER.REPORTS.LIST,
    children: [
      { title: 'Báo cáo học viên', icon: BarChart, path: ROUTES.TEACHER.REPORTS.LIST },
    ],
  },
  {
    title: 'Tiêu chí đánh giá',
    icon: RuleIcon,
    path: ROUTES.TEACHER.CRITERIA.LIST,
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
    title: 'Quản lý câu hỏi',
    icon: QuizIcon,
    path: ROUTES.TEACHER.QUESTIONS.LIST,
    children: [
      { title: 'Danh sách câu hỏi', icon: QuestionAnswer, path: ROUTES.TEACHER.QUESTIONS.LIST },
      { title: 'Tạo câu hỏi mới', icon: Create, path: ROUTES.TEACHER.QUESTIONS.CREATE },
    ],
  },
  {
    title: 'Quản lý bài thi',
    icon: AssignmentIcon,
    path: ROUTES.TEACHER.EXAMS.LIST,
    children: [
      { title: 'Danh sách bài thi', icon: AssignmentIcon, path: ROUTES.TEACHER.EXAMS.LIST },
      { title: 'Tạo bài thi mới', icon: Create, path: ROUTES.TEACHER.EXAMS.CREATE },
    ],
  },
  {
    title: 'Quản lý người dùng',
    icon: PeopleIcon,
    path: ROUTES.ADMIN.USERS.LIST,
    children: [
      { title: 'Danh sách người dùng', icon: PeopleIcon, path: ROUTES.ADMIN.USERS.LIST },
    ],
  },
  {
    title: 'Chấm bài',
    icon: GradingIcon,
    path: ROUTES.TEACHER.SUBMISSIONS.LIST,
    children: [
      { title: 'Danh sách bài làm', icon: GradingIcon, path: ROUTES.TEACHER.SUBMISSIONS.LIST },
    ],
  },
  {
    title: 'Báo cáo & Thống kê',
    icon: AssessmentIcon,
    path: ROUTES.TEACHER.REPORTS.LIST,
    children: [
      { title: 'Báo cáo tổng quan', icon: BarChart, path: ROUTES.TEACHER.REPORTS.LIST },
      { title: 'Phân tích xu hướng', icon: TrendingUp, path: ROUTES.TEACHER.REPORTS.LIST },
    ],
  },
  {
    title: 'Tiêu chí đánh giá',
    icon: RuleIcon,
    path: ROUTES.TEACHER.CRITERIA.LIST,
  },
];

export default function Sidebar({ onClose, currentPath }) {
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role || 'teacher';
  
  const menuItems = useMemo(() => {
    return userRole === 'admin' ? adminMenuItems : teacherMenuItems;
  }, [userRole]);
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState({});

  const handleItemClick = (item) => {
    if (item.children) {
      // Toggle expanded state for items with children
      setExpandedItems(prev => ({
        ...prev,
        [item.title]: !prev[item.title]
      }));
    } else {
      // Navigate for items without children
      router.push(item.path);
      if (onClose) {
        onClose();
      }
    }
  };

  const handleChildClick = (childItem) => {
    router.push(childItem.path);
    if (onClose) {
      onClose();
    }
  };

  const isActive = (path) => {
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const isParentActive = (item) => {
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return isActive(item.path);
  };

  return (
    <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="primary">
          APTIS Admin
        </Typography>
        {onClose && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Navigation Menu */}
      <List sx={{ pt: 1 }}>
        {menuItems.map((item, index) => (
          <Box key={item.title}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleItemClick(item)}
                selected={isParentActive(item)}
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
                    fontWeight: isParentActive(item) ? 600 : 400,
                  }}
                />
                {item.children && (
                  expandedItems[item.title] ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItemButton>
            </ListItem>

            {/* Sub-menu items */}
            {item.children && (
              <Collapse in={expandedItems[item.title]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((childItem) => (
                    <ListItem key={childItem.title} disablePadding>
                      <ListItemButton
                        onClick={() => handleChildClick(childItem)}
                        selected={isActive(childItem.path)}
                        sx={{
                          pl: 4,
                          mx: 1,
                          borderRadius: 1,
                          '&.Mui-selected': {
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText',
                            '& .MuiListItemIcon-root': {
                              color: 'primary.contrastText',
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <childItem.icon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={childItem.title}
                          primaryTypographyProps={{
                            fontSize: '0.85rem',
                            fontWeight: isActive(childItem.path) ? 600 : 400,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}

            {/* Divider after main sections */}
            {index === 0 && <Divider sx={{ my: 1, mx: 2 }} />}
          </Box>
        ))}
      </List>

      {/* Footer */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
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