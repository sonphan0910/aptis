'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import ExamForm from '@/components/teacher/exams/ExamForm';
import { createExam } from '@/store/slices/examSlice';
import { showNotification } from '@/store/slices/uiSlice';

export default function NewExamPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    try {
      const result = await dispatch(createExam(formData));
      
      if (createExam.fulfilled.match(result)) {
        dispatch(showNotification({
          message: 'Tạo bài thi thành công!',
          type: 'success'
        }));
        
        // Redirect to exam detail page for further editing
        const examId = result.payload.data.id;
        router.push(`/teacher/exams/${examId}`);
      }
    } catch (error) {
      dispatch(showNotification({
        message: 'Có lỗi xảy ra khi tạo bài thi',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/teacher/exams')}
          sx={{ mr: 2 }}
        >
          Quay lại
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Tạo bài thi mới
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thông tin cơ bản
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tạo thông tin cơ bản cho bài thi. Sau khi tạo, bạn có thể thêm các phần thi và câu hỏi.
          </Typography>
          
          <ExamForm
            examData={null}
            onSubmit={handleFormSubmit}
            loading={loading}
            isEditing={false}
          />
        </CardContent>
      </Card>
    </Box>
  );
}