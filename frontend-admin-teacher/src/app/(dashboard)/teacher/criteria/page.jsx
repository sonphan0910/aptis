'use client';

import { Box, Button, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import CriteriaList from '@/components/teacher/criteria/CriteriaList';

export default function CriteriaPage() {
  const router = useRouter();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý tiêu chí chấm điểm
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push('/teacher/criteria/new')}
          size="large"
        >
          Tạo tiêu chí
        </Button>
      </Box>

      <CriteriaList />
    </Box>
  );
}