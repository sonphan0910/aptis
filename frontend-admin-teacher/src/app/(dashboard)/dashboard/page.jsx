'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Grading as GradingIcon,
  TrendingUp,
  TrendingDown,
  Schedule,
  CheckCircle,
  Error,
  Warning,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/app.config';

// Mock data for dashboard
const mockStats = {
  questions: {
    total: 1247,
    change: +12,
    trend: 'up',
  },
  exams: {
    total: 89,
    change: +5,
    trend: 'up',
  },
  users: {
    total: 2156,
    change: -8,
    trend: 'down',
  },
  submissions: {
    total: 445,
    change: +23,
    trend: 'up',
  },
};

const mockRecentExams = [
  { id: 1, title: 'Toán học lớp 12 - Kỳ thi cuối kỳ', students: 125, status: 'published', date: '2024-01-15' },
  { id: 2, title: 'Vật lý - Kiểm tra giữa kỳ', students: 89, status: 'draft', date: '2024-01-18' },
  { id: 3, title: 'Hóa học cơ bản', students: 156, status: 'scheduled', date: '2024-01-20' },
  { id: 4, title: 'Sinh học tế bào', students: 78, status: 'published', date: '2024-01-22' },
];

const mockPendingGrading = [
  { id: 1, examTitle: 'Toán học lớp 12', submissions: 23, deadline: '2024-01-16' },
  { id: 2, examTitle: 'Vật lý nâng cao', submissions: 15, deadline: '2024-01-17' },
  { id: 3, examTitle: 'Hóa học', submissions: 8, deadline: '2024-01-18' },
];

const StatCard = ({ title, value, change, trend, icon: Icon, onClick }) => (
  <Card
    sx={{
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease-in-out',
      '&:hover': onClick ? {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      } : {},
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value.toLocaleString()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {trend === 'up' ? (
              <TrendingUp color="success" fontSize="small" />
            ) : (
              <TrendingDown color="error" fontSize="small" />
            )}
            <Typography
              variant="body2"
              color={trend === 'up' ? 'success.main' : 'error.main'}
              sx={{ ml: 0.5 }}
            >
              {change > 0 ? '+' : ''}{change} từ tháng trước
            </Typography>
          </Box>
        </Box>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 56,
            height: 56,
          }}
        >
          <Icon />
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const getStatusChip = (status) => {
  const statusConfig = {
    published: { label: 'Đã xuất bản', color: 'success' },
    draft: { label: 'Nháp', color: 'default' },
    scheduled: { label: 'Đã lên lịch', color: 'info' },
  };
  
  const config = statusConfig[status] || { label: status, color: 'default' };
  return <Chip label={config.label} color={config.color} size="small" />;
};

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            {getCurrentGreeting()}, {user?.name || 'Admin'}! 👋
          </Typography>
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Đây là tổng quan về hệ thống APTIS của bạn
        </Typography>
        {loading && <LinearProgress sx={{ mt: 2 }} />}
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng số câu hỏi"
            value={mockStats.questions.total}
            change={mockStats.questions.change}
            trend={mockStats.questions.trend}
            icon={QuizIcon}
            onClick={() => router.push(ROUTES.QUESTIONS.LIST)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng số bài thi"
            value={mockStats.exams.total}
            change={mockStats.exams.change}
            trend={mockStats.exams.trend}
            icon={AssignmentIcon}
            onClick={() => router.push(ROUTES.EXAMS.LIST)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng số người dùng"
            value={mockStats.users.total}
            change={mockStats.users.change}
            trend={mockStats.users.trend}
            icon={PeopleIcon}
            onClick={() => router.push(ROUTES.USERS.LIST)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bài thi cần chấm"
            value={mockStats.submissions.total}
            change={mockStats.submissions.change}
            trend={mockStats.submissions.trend}
            icon={GradingIcon}
            onClick={() => router.push(ROUTES.SUBMISSIONS.LIST)}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Exams */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Bài thi gần đây
            </Typography>
            <List>
              {mockRecentExams.map((exam, index) => (
                <Box key={exam.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar>
                        <AssignmentIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={exam.title}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {exam.students} học sinh
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            • {exam.date}
                          </Typography>
                        </Box>
                      }
                    />
                    {getStatusChip(exam.status)}
                  </ListItem>
                  {index < mockRecentExams.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Pending Grading */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Cần chấm bài
            </Typography>
            <List>
              {mockPendingGrading.map((item, index) => (
                <Box key={item.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <GradingIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.examTitle}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {item.submissions} bài cần chấm
                          </Typography>
                          <Typography variant="caption" color="error.main">
                            Hạn: {item.deadline}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < mockPendingGrading.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions or Recent Activities could go here */}
    </Box>
  );
}