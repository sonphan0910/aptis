'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import LoadingSpinner from './LoadingSpinner';

export default function RoleGuard({ children, allowedRoles = [] }) {
  const router = useRouter();
  const { user, loading } = useSelector(state => state.auth);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!loading && user && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Box p={3}>
        <Alert severity="error">
          <Typography variant="h6">Không có quyền truy cập</Typography>
          <Typography>Bạn không có quyền truy cập vào trang này.</Typography>
        </Alert>
      </Box>
    );
  }

  return children;
}