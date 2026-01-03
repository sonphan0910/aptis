'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Alert,
  Breadcrumbs,
  Link,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Stack,
  Divider,
} from '@mui/material';
import { 
  NavigateNext, 
  Home, 
  Assessment, 
  CheckCircle, 
  Schedule,
  Grade,
  Filter,
  Refresh,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { fetchMyAttempts } from '@/store/slices/examSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import RecentAttempts from '@/components/progress/RecentAttempts';

export default function ResultsPage() {
  const dispatch = useDispatch();
  const { myAttempts, isLoadingAttempts, error } = useSelector((state) => state.exams);
  const [statusFilter, setStatusFilter] = useState('all');
  const [attemptTypeFilter, setAttemptTypeFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchMyAttempts());
  }, [dispatch]);

  // Filter attempts based on selected criteria
  const filteredAttempts = myAttempts.filter(attempt => {
    const statusMatch = statusFilter === 'all' || attempt.status === statusFilter;
    const typeMatch = attemptTypeFilter === 'all' || attempt.attempt_type === attemptTypeFilter;
    return statusMatch && typeMatch;
  });

  // Calculate statistics
  const totalAttempts = myAttempts.length;
  const completedAttempts = myAttempts.filter(a => ['submitted', 'graded', 'reviewed'].includes(a.status)).length;
  const averageScore = myAttempts
    .filter(a => a.total_score !== null)
    .reduce((sum, a, _, arr) => sum + (a.total_score / arr.length), 0);

  const handleRefresh = () => {
    dispatch(fetchMyAttempts());
  };

  if (isLoadingAttempts) {
    return <LoadingSpinner message="Đang tải kết quả của bạn..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb */}
      <Box mb={3}>
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            component={NextLink}
            href="/home"
            underline="hover"
            color="inherit"
            display="flex"
            alignItems="center"
            gap={0.5}
          >
            <Home fontSize="small" />
            Trang chủ
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 500 }}>
            Kết quả
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              Kết quả làm bài
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Xem lịch sử làm bài và phân tích chi tiết về hiệu suất của bạn.
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoadingAttempts}
          >
            Làm mới
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Assessment color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {totalAttempts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng số lần làm bài
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {completedAttempts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã hoàn thành
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Grade color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {averageScore > 0 ? Math.round(averageScore) : '--'}
                {averageScore > 0 && '%'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Điểm trung bình
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Schedule color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {myAttempts.filter(a => a.status === 'in_progress').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đang làm dở
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Filter color="action" />
            <Typography variant="h6">Bộ lọc</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="in_progress">Đang làm</MenuItem>
                  <MenuItem value="submitted">Đã nộp</MenuItem>
                  <MenuItem value="graded">Đã chấm</MenuItem>
                  <MenuItem value="reviewed">Đã xem lại</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Loại bài thi</InputLabel>
                <Select
                  value={attemptTypeFilter}
                  label="Loại bài thi"
                  onChange={(e) => setAttemptTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="full_exam">Thi đầy đủ</MenuItem>
                  <MenuItem value="single_skill">Luyện từng kỹ năng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Chip 
                label={`${filteredAttempts.length} kết quả`} 
                color="primary" 
                variant="outlined"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results List */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Lịch sử làm bài ({filteredAttempts.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {filteredAttempts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Không tìm thấy kết quả phù hợp với bộ lọc
                  </Typography>
                </Box>
              ) : (
                <RecentAttempts 
                  attempts={filteredAttempts} 
                  showActions={true}
                  maxItems={20}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}