'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { TrendingUp, Assessment } from '@mui/icons-material';
import { fetchDashboardData } from '@/store/slices/dashboardSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatsCard from '@/components/common/StatsCard';

export default function ProgressPage() {
  const dispatch = useDispatch();
  const { stats, isLoading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (isLoading) {
    return <LoadingSpinner message="Loading your progress..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Progress Tracking
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor your learning journey and skill development over time.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Attempts"
            value={stats.totalAttempts || 0}
            icon={<Assessment />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Average Score"
            value={`${(stats.averageScore || 0).toFixed(1)}%`}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Study Streak"
            value={`${stats.streak || 0} days`}
            icon={<TrendingUp />}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Time"
            value={stats.totalTime || '0h'}
            icon={<Assessment />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Progress Charts and Analysis */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Detailed progress tracking and analytics will be available soon.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}