'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Skeleton,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Save,
  Publish,
  UnpublishedOutlined,
  Settings,
  Quiz
} from '@mui/icons-material';
import ExamForm from '@/components/teacher/exams/ExamForm';
import { 
  fetchExamById, 
  updateExam, 
  publishExam, 
  unpublishExam 
} from '@/store/slices/examSlice';
import { showNotification } from '@/store/slices/uiSlice';

export default function ExamDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useParams();
  
  const examId = params.examId;
  const examState = useSelector(state => state.exam || {});
  const { currentExam, isLoading, error } = examState;
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  // Fetch exam data on mount
  useEffect(() => {
    if (examId) {
      dispatch(fetchExamById(examId));
    }
  }, [dispatch, examId]);

  const handleUpdate = async (formData) => {
    setLoading(true);
    try {
      const result = await dispatch(updateExam({ 
        id: examId, 
        data: formData 
      }));
      
      if (updateExam.fulfilled.match(result)) {
        dispatch(showNotification({
          message: 'Cập nhật bài thi thành công!',
          type: 'success'
        }));
        setIsEditing(false);
        // Refresh exam data
        dispatch(fetchExamById(examId));
      }
    } catch (error) {
      dispatch(showNotification({
        message: 'Có lỗi xảy ra khi cập nhật bài thi',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    setPublishLoading(true);
    try {
      if (currentExam?.status === 'published') {
        await dispatch(unpublishExam(examId));
      } else {
        await dispatch(publishExam(examId));
      }
      // Refresh exam data
      dispatch(fetchExamById(examId));
    } catch (error) {
      dispatch(showNotification({
        message: 'Có lỗi xảy ra khi thay đổi trạng thái bài thi',
        type: 'error'
      }));
    } finally {
      setPublishLoading(false);
  }

  // Loading skeleton
  if (isLoading && !currentExam) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" height={400} sx={{ mt: 2 }} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Có lỗi xảy ra khi tải bài thi: {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/teacher/exams')}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {currentExam?.title || 'Bài thi'}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <Chip 
                size="small" 
                label={currentExam?.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                color={currentExam?.status === 'published' ? 'success' : 'default'}
              />
              <Chip 
                size="small" 
                label={currentExam?.aptisType?.aptis_type_name || 'N/A'}
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>

        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => router.push(`/teacher/exams/${examId}/manage`)}
          >
            Quản lý Sections
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Quiz />}
            onClick={() => router.push(`/teacher/exams/${examId}/preview`)}
          >
            Xem trước
          </Button>

          <Button
            variant={currentExam?.status === 'published' ? 'outlined' : 'contained'}
            startIcon={currentExam?.status === 'published' ? <UnpublishedOutlined /> : <Publish />}
            onClick={handlePublishToggle}
            disabled={publishLoading}
            color={currentExam?.status === 'published' ? 'default' : 'primary'}
          >
            {publishLoading ? 'Đang xử lý...' : 
             currentExam?.status === 'published' ? 'Hủy xuất bản' : 'Xuất bản'}
          </Button>
        </Box>
      </Box>

      {/* Overview Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tổng quan
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Số phần thi
              </Typography>
              <Typography variant="h6">
                {currentExam?.sections?.length || 0}
              </Typography>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Tổng câu hỏi
              </Typography>
              <Typography variant="h6">
                {currentExam?.sections?.reduce((total, section) => 
                  total + (section.questions?.length || 0), 0) || 0}
              </Typography>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Thời gian
              </Typography>
              <Typography variant="h6">
                {currentExam?.duration_minutes || 0} phút
              </Typography>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Điểm tối đa
              </Typography>
              <Typography variant="h6">
                {currentExam?.total_score || 0}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">
              Thông tin cơ bản
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setIsEditing(!isEditing)}
              size="small"
            >
              {isEditing ? 'Hủy' : 'Chỉnh sửa'}
            </Button>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {isEditing ? (
            <ExamForm
              examData={currentExam}
              onSubmit={handleUpdate}
              loading={loading}
              isEditing={true}
            />
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Tên bài thi
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {currentExam?.title || 'Chưa có tên'}
                </Typography>
              </Grid>

              {currentExam?.description && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Mô tả
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {currentExam.description}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Loại APTIS
                </Typography>
                <Typography variant="body1">
                  {currentExam?.aptisType?.aptis_type_name || 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Thời gian
                </Typography>
                <Typography variant="body1">
                  {currentExam?.duration_minutes || 0} phút
                </Typography>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
}