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
  Grid,
  Paper,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ArrowBack,
  Quiz as QuestionIcon,
  AccessTime as TimeIcon,
  Assignment as SectionIcon,
  Visibility as PreviewIcon
} from '@mui/icons-material';
import { fetchExamById } from '@/store/slices/examSlice';

export default function ExamPreviewPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useParams();
  
  const examId = params.examId;
  const examState = useSelector(state => state.exam || {});
  const { currentExam, isLoading, error } = examState;

  // Fetch exam data on mount
  useEffect(() => {
    if (examId) {
      dispatch(fetchExamById(examId));
    }
  }, [dispatch, examId]);

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

  if (!currentExam) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Không tìm thấy bài thi
      </Alert>
    );
  }

  const totalQuestions = currentExam.sections?.reduce((total, section) => 
    total + (section.questions?.length || 0), 0) || 0;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push(`/teacher/exams/${examId}`)}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Xem trước bài thi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Xem trước bài thi như sinh viên sẽ thấy
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2}>
          <Chip 
            icon={<PreviewIcon />}
            label={currentExam.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
            color={currentExam.status === 'published' ? 'success' : 'default'}
          />
        </Box>
      </Box>

      {/* Exam Header Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {currentExam.title}
              </Typography>
              
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Chip 
                  size="small"
                  label={currentExam.aptisType?.aptis_type_name || 'N/A'}
                  color="primary"
                  variant="outlined"
                />
                <Chip 
                  size="small"
                  icon={<TimeIcon />}
                  label={`${currentExam.duration_minutes} phút`}
                  variant="outlined"
                />
                <Chip 
                  size="small"
                  icon={<QuestionIcon />}
                  label={`${totalQuestions} câu hỏi`}
                  variant="outlined"
                />
              </Box>

              {currentExam.description && (
                <Typography variant="body1" color="text.secondary">
                  {currentExam.description}
                </Typography>
              )}
            </Box>

            <Paper sx={{ p: 2, textAlign: 'center', minWidth: 120 }}>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {currentExam.total_score || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Điểm tối đa
              </Typography>
            </Paper>
          </Box>

          <Divider />

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {currentExam.sections?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phần thi
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {totalQuestions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Câu hỏi
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {currentExam.duration_minutes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phút
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {currentExam.sections?.reduce((total, section) => 
                    total + (section.duration_minutes || 0), 0) || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng thời gian sections
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sections Preview */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cấu trúc bài thi
          </Typography>

          {!currentExam.sections || currentExam.sections.length === 0 ? (
            <Alert severity="info">
              Bài thi chưa có phần thi nào. Hãy thêm các phần thi để hoàn thiện bài thi.
            </Alert>
          ) : (
            <List>
              {currentExam.sections.map((section, index) => (
                <Card key={section.id || index} sx={{ mb: 2 }} variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <SectionIcon color="primary" />
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            Phần {section.section_order || index + 1}: {section.skillType?.skill_type_name || 'N/A'}
                          </Typography>
                          <Box display="flex" gap={1} mt={1}>
                            <Chip 
                              size="small"
                              label={`${section.questions?.length || 0} câu hỏi`}
                              color="primary"
                              variant="outlined"
                            />
                            <Chip 
                              size="small"
                              icon={<TimeIcon />}
                              label={`${section.duration_minutes || 0} phút`}
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {section.instruction && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Hướng dẫn:</strong> {section.instruction}
                        </Typography>
                      </Alert>
                    )}

                    {section.questions && section.questions.length > 0 ? (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Danh sách câu hỏi:
                        </Typography>
                        <List dense>
                          {section.questions.map((question, qIndex) => (
                            <ListItem key={question.id || qIndex}>
                              <ListItemIcon>
                                <QuestionIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={`Câu ${question.question_order || qIndex + 1}`}
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {question.question?.content?.substring(0, 100) || 'Nội dung câu hỏi...'}
                                      {question.question?.content?.length > 100 && '...'}
                                    </Typography>
                                    <Chip 
                                      size="small" 
                                      label={`${question.max_score || 0} điểm`}
                                      variant="outlined"
                                      sx={{ mt: 1 }}
                                    />
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    ) : (
                      <Alert severity="warning">
                        Phần này chưa có câu hỏi nào. Hãy thêm câu hỏi để hoàn thiện phần thi.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Preview Actions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="center" gap={2}>
            <Button
              variant="outlined"
              onClick={() => router.push(`/teacher/exams/${examId}`)}
            >
              Chỉnh sửa thông tin
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push(`/teacher/exams/${examId}/manage`)}
            >
              Quản lý sections
            </Button>
            {currentExam.status === 'published' && (
              <Button
                variant="contained"
                color="success"
                disabled
              >
                Bài thi đã được xuất bản
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}