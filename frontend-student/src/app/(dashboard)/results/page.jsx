'use client';

import { useEffect } from 'react';
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
} from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import NextLink from 'next/link';
import { fetchMyAttempts } from '@/store/slices/examSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import RecentAttempts from '@/components/progress/RecentAttempts';

export default function ResultsPage() {
  const dispatch = useDispatch();
  const { myAttempts, isLoadingAttempts, error } = useSelector((state) => state.exams);

  useEffect(() => {
    dispatch(fetchMyAttempts());
  }, [dispatch]);

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
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Kết quả làm bài
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Xem lịch sử làm bài và phản hồi chi tiết về hiệu suất của bạn.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results List */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Lịch sử làm bài
              </Typography>
              <RecentAttempts 
                attempts={myAttempts} 
                showActions={true}
                maxItems={10}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}