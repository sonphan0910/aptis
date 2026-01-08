'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Breadcrumbs,
  Link,
  Alert
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import ExamForm from '@/components/teacher/exams/ExamForm';
import { createExam } from '@/store/slices/examSlice';
import { showNotification } from '@/store/slices/uiSlice';

export default function NewExamPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await dispatch(createExam(formData));
      
      if (createExam.fulfilled.match(result)) {
        dispatch(showNotification({
          message: 'Tạo bài thi thành công!',
          type: 'success'
        }));
        
        // Redirect back to exam list
        router.push('/teacher/exams');
      } else {
        setError('Có lỗi xảy ra khi tạo bài thi');
      }
    } catch (error) {
      console.error('Create exam error:', error);
      setError(error.message || 'Có lỗi xảy ra khi tạo bài thi');
      dispatch(showNotification({
        message: 'Có lỗi xảy ra khi tạo bài thi',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/teacher/exams');
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          underline="hover" 
          color="inherit" 
          onClick={handleBack}
          sx={{ cursor: 'pointer' }}
        >
          Quản lý bài thi
        </Link>
        <Typography color="text.primary">
          Tạo bài thi mới
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          variant="outlined"
          sx={{ mr: 2 }}
        >
          Quay lại
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Tạo bài thi mới
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <ExamForm 
        onSubmit={handleFormSubmit} 
        loading={loading}
        isEditing={false}
      />
    </Box>
  );
}