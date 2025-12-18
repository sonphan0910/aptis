'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  Alert,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  School,
  Assessment,
  TrendingUp,
  LocalFireDepartment,
  PlayArrow,
  Lightbulb,
  CheckCircle,
  EmojiEvents,
  History,
} from '@mui/icons-material';
import { fetchDashboardData } from '@/store/slices/dashboardSlice';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatsCard from '@/components/common/StatsCard';
import { formatDistanceToNow } from 'date-fns';

export default function HomePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, recentAttempts, isLoading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, user]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const getStreak = () => {
    return stats?.streak || 0;
  };

  const getAverageScore = () => {
    return stats?.averageScore || 0;
  };

  const attemptsArray = Array.isArray(recentAttempts) ? recentAttempts : [];
  const displayAttempts = attemptsArray.slice(0, 3);
  const hasAttempts = attemptsArray.length > 0;

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main', 
              mr: 2,
              width: 56,
              height: 56,
              fontSize: '1.5rem'
            }}
          >
            {user?.full_name?.charAt(0)?.toUpperCase() || 'S'}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Bạn'}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Hãy tiếp tục hành trình luyện thi APTIS của bạn
            </Typography>
          </Box>
        </Box>
        
        {getStreak() > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalFireDepartment sx={{ color: '#ff6b6b', fontSize: 24 }} />
            <Chip
              label={`Chuỗi liên tiếp ${getStreak()} ngày!`}
              color="warning"
              variant="filled"
              size="medium"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Tổng số bài thi"
            value={stats?.totalExams || 0}
            icon={<Assessment />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Điểm trung bình"
            value={`${getAverageScore().toFixed(1)}%`}
            icon={<TrendingUp />}
            color="success"
            subtitle={stats?.totalAttempts ? `${stats.totalAttempts} lần làm` : 'Chưa làm bài'}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Chuỗi học liên tiếp"
            value={`${getStreak()} ngày`}
            icon={<LocalFireDepartment />}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Thời gian luyện tập"
            value={stats?.totalTime || '0h'}
            icon={<School />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Attempts */}
        <Grid item xs={12}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600, mb: 2 }}>
                <History sx={{ fontSize: 24 }} />
                Hoạt động gần đây
              </Typography>
              
              {hasAttempts ? (
                <Box>
                  <List disablePadding>
                    {displayAttempts.map((attempt, index) => (
                      <Box key={attempt.id}>
                        <ListItem
                          sx={{
                            py: 1.5,
                            px: 0,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {attempt.examTitle || 'Unknown Exam'}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 3.5, mb: 0.5 }}>
                              Điểm: <strong>{attempt.percentage}%</strong> ({attempt.score}/{attempt.maxScore})
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5 }}>
                              {formatDistanceToNow(new Date(attempt.startedAt), { addSuffix: true })}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${attempt.percentage}%`}
                            color={getScoreColor(attempt.percentage)}
                            variant="filled"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </ListItem>
                        {index < displayAttempts.length - 1 && (
                          <Box sx={{ borderBottom: '1px solid #e0e0e0', my: 1 }} />
                        )}
                      </Box>
                    ))}
                  </List>
                  {attemptsArray.length > 3 && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Button
                        size="small"
                        onClick={() => router.push('/results')}
                      >
                        Xem tất cả kết quả ({attemptsArray.length})
                      </Button>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Assessment sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Bạn chưa làm bài thi nào
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Bắt đầu hành trình luyện thi APTIS của bạn
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => router.push('/exams')}
                  >
                    Làm bài thi đầu tiên
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Practice Recommendations */}
      {stats?.weakestSkills && stats.weakestSkills.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600, mb: 2 }}>
              <Lightbulb color="warning" />
              Gợi ý luyện tập
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Dựa trên kết quả gần đây, chúng tôi khuyến nghị bạn tập trung vào các kỹ năng sau:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              {stats.weakestSkills.map((skill, index) => (
                <Paper
                  key={index}
                  elevation={3}
                  sx={{
                    p: 2,
                    bgcolor: '#fff',
                    borderRadius: 2,
                    flex: '1 1 260px',
                    minWidth: '220px',
                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)',
                    border: '1px solid #f3f3f3',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    transition: 'box-shadow 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.10)',
                      borderColor: 'primary.light',
                    },
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5, letterSpacing: 0.2 }}>
                    {skill.skill}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <LinearProgress
                      variant="determinate"
                      value={skill.percentage}
                      sx={{ flex: 1, height: 8, borderRadius: 4, background: '#f5f5f5',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #ff9800 0%, #ffc107 100%)',
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 700, minWidth: '38px', color: 'primary.main' }}>
                      {skill.percentage.toFixed(0)}%
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
            <Button
              variant="contained"
              startIcon={<Lightbulb />}
              onClick={() => router.push('/exams')}
            >
              Tìm bài tập luyện
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}