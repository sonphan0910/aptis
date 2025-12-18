'use client';

import { useRouter } from 'next/navigation';
import { Box, Button, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import dynamic from 'next/dynamic';

const ExamList = dynamic(() => import('@/components/teacher/exams/ExamList'), { ssr: false });

export default function ExamsPage() {
  const router = useRouter();

  const handleCreateExam = () => {
    router.push('/teacher/exams/new');
  };

  return (
    <Box sx={{ p: 0 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý bài thi
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateExam}
          size="large"
        >
          Tạo bài thi
        </Button>
      </Box>

      <ExamList
        showActions={true}
        showFilters={true}
      />
    </Box>
  );
}