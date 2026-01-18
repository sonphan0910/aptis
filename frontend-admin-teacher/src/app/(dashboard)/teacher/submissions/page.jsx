'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Alert,
  Snackbar,
  Container,
  CircularProgress,
  Chip,
  Icon
} from '@mui/material';
import {
  Psychology,
  Person,
  Warning,
  Assignment,
  CheckCircle
} from '@mui/icons-material';
import SubmissionFilters from '@/components/teacher/submissions/SubmissionFilters';
import SubmissionList from '@/components/teacher/submissions/SubmissionList';
import { submissionApi } from '@/services/submissionService';
import { useRouter } from 'next/navigation';

export default function SubmissionsPage() {
  const router = useRouter();
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  
  const [filters, setFilters] = useState({
    grading_status: '',
    skill_type: '',
    page: 1,
    limit: 20
  });

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load data when component mounts or filters change
  useEffect(() => {
    loadSubmissions();
    loadStats();
  }, [filters]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const response = await submissionApi.getSubmissions(filters);
      setSubmissions(response.data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      showNotification('Lỗi khi tải danh sách bài làm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Chỉ gọi API stats khi có filter cụ thể
      const hasFilters = filters.skill_type;
      
      if (!hasFilters) {
        // Load all submissions stats by default
        const response = await submissionApi.getGradingStats({});
        setStats(response.data);
        return;
      }

      const response = await submissionApi.getGradingStats({
        skill_type: filters.skill_type
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default stats on error
      setStats({
        total: 0,
        ungraded: 0,
        ai_graded: 0,
        manually_graded: 0,
        needs_review: 0
      });
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 }); // Reset to page 1 when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      grading_status: '',
      skill_type: '',
      page: 1,
      limit: 20
    });
  };

  const handleViewSubmission = (submission) => {
    // Navigate to submission detail view using attempt ID
    router.push(`/teacher/submissions/${submission.attempt?.id}?mode=view`);
  };

  const handleGradeSubmission = (submission) => {
    // Navigate to same page as view but with grading mode
    router.push(`/teacher/submissions/${submission.attempt?.id}?mode=grade`);
  };

  const handleRegradeSubmissions = async (answerIds, regradeType) => {
    try {
      const response = await submissionApi.regradeSubmissions(answerIds, regradeType);
      
      showNotification(
        `Đã đánh dấu ${response.data.regradedCount} bài làm để chấm lại bằng AI`,
        'success'
      );
      
      // Refresh data
      await loadSubmissions();
      await loadStats();
    } catch (error) {
      console.error('Error regrading submissions:', error);
      showNotification('Lỗi khi chấm lại bài làm', 'error');
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Quản lý chấm bài
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Chấm điểm và quản lý bài làm Writing & Speaking của học sinh
          </Typography>
        </Box>

        {/* Statistics Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Assignment sx={{ fontSize: 40, color: 'grey.600', mb: 1 }} />
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Tổng số bài
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.total || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ height: '100%', bgcolor: 'error.50' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Warning sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Cần chấm ngay
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="error.main">
                    {stats.ungraded || 0}
                  </Typography>
                  <Chip label="Ưu tiên cao" size="small" color="error" />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ height: '100%', bgcolor: 'warning.50' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Psychology sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    AI đã chấm
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="warning.main">
                    {stats.ai_graded || 0}
                  </Typography>
                  <Chip label="Cần kiểm tra" size="small" color="warning" />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ height: '100%', bgcolor: 'success.50' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    GV đã chấm
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="success.main">
                    {stats.manually_graded || 0}
                  </Typography>
                  <Chip label="Hoàn thành" size="small" color="success" />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ height: '100%', bgcolor: 'error.50' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Warning sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Cần xem xét
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="error.main">
                    {stats.needs_review || 0}
                  </Typography>
                  <Chip label="Cần sửa" size="small" color="error" />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <SubmissionFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Main Content */}
        <Paper sx={{ mt: 3 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={8}>
              <CircularProgress />
              <Typography variant="h6" sx={{ ml: 2 }}>
                Đang tải dữ liệu...
              </Typography>
            </Box>
          ) : (
            <SubmissionList
              submissions={submissions}
              loading={loading}
              onRefresh={loadSubmissions}
              onViewSubmission={handleViewSubmission}
              onGradeSubmission={handleGradeSubmission}
              onRegradeSubmissions={handleRegradeSubmissions}
            />
          )}
        </Paper>

        {/* Notification */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}