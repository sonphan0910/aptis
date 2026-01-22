'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  Alert,
  Snackbar,
  TextField,
  Rating,
  Grid,
  Divider,
  LinearProgress,
  Avatar,
  Paper
} from '@mui/material';
import { 
  ArrowBack, 
  Save, 
  Grade, 
  VolumeUp,
  Description,
  Person,
  Assignment,
  Star
} from '@mui/icons-material';
import { submissionApi } from '@/services/submissionService';
import QuestionDisplay from '@/components/QuestionDisplay';
import DetailedAnswerRenderer from '@/components/DetailedAnswerRenderer';

export default function SubmissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const attemptId = params.attemptId;
  const mode = searchParams.get('mode') || 'view';
  
  const [submissionDetail, setSubmissionDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (attemptId) {
      loadSubmissionDetail();
    }
  }, [attemptId]);

  useEffect(() => {
    if (submissionDetail?.answers?.[0]) {
      const answer = submissionDetail.answers[0];
      setScore(answer.final_score || answer.score || 0);
      setFeedback(answer.manual_feedback || '');
    }
  }, [submissionDetail]);

  const loadSubmissionDetail = async () => {
    setLoading(true);
    try {
      const response = await submissionApi.getSubmissionDetail(attemptId);
      setSubmissionDetail(response.data);
    } catch (error) {
      console.error('Error loading submission detail:', error);
      showNotification('Lỗi khi tải chi tiết bài làm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!submissionDetail || !submissionDetail.answers || submissionDetail.answers.length === 0) {
      showNotification('Không có dữ liệu bài làm', 'error');
      return;
    }

    setSaving(true);
    try {
      const answerId = submissionDetail.answers[0].id;
      
      // Chỉ gửi final_score và manual_feedback thôi
      await submissionApi.submitAnswerReview(answerId, {
        final_score: score,
        manual_feedback: feedback
      });
      
      showNotification('Đã lưu đánh giá thành công', 'success');
      await loadSubmissionDetail();
      
      setTimeout(() => {
        if (mode === 'grade') {
          router.push('/teacher/submissions');
        }
      }, 1500);
    } catch (error) {
      console.error('Error submitting review:', error);
      showNotification('Lỗi khi lưu đánh giá', 'error');
    } finally {
      setSaving(false);
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

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'primary';
    if (percentage >= 40) return 'info';
    if (percentage >= 20) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'Xuất sắc';
    if (percentage >= 60) return 'Tốt';
    if (percentage >= 40) return 'Đạt yêu cầu';
    if (percentage >= 20) return 'Cần cải thiện';
    return 'Chưa đạt';
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'manually_graded': { label: 'Đã chấm thủ công', color: 'success' },
      'ai_graded': { label: 'AI đã chấm', color: 'primary' },
      'auto_graded': { label: 'Tự động chấm', color: 'info' },
      'ungraded': { label: 'Chưa chấm', color: 'warning' }
    };
    
    const config = statusConfig[status] || { label: 'Không xác định', color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (loading || !submissionDetail) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const { skill, student, exam, answers } = submissionDetail;
  const answer = answers && answers.length > 0 ? answers[0] : null;
  const question = answer?.question || {};
  const maxScore = answer?.max_score || 100;
  const scorePercentage = maxScore ? (score / maxScore) * 100 : 0;
  
  // Determine grading status based on answer data
  const gradingStatus = answer?.grading_status || 
    (answer?.final_score !== null && answer?.final_score !== undefined ? 'manually_graded' : 'ungraded');

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/teacher/submissions')}
            sx={{ mr: 2 }}
          >
            Quay lại danh sách
          </Button>
          <Box>
       
            <Typography variant="subtitle1" color="text.secondary">
              {student?.full_name} - {exam?.title}
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              <Chip label={skill || 'Không xác định'} color="primary" size="small" />
              {getStatusChip(gradingStatus)}
              {mode === 'view' && (
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => router.push(`/teacher/submissions/${attemptId}?mode=grade`)}
                  startIcon={<Grade />}
                >
                  Chuyển sang chấm
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>


      
      {mode === 'grade' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Chế độ chấm:</strong> Bạn có thể chấm điểm và đưa ra phản hồi. 
          Nhớ nhấn "Lưu đánh giá" sau khi hoàn thành.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column - Student Answer Display */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <Avatar 
                src={student?.avatar} 
                sx={{ width: 32, height: 32, mr: 2 }}
              >
                {student?.full_name?.charAt(0)}
              </Avatar>
              {student?.full_name}
              <Chip 
                label={`${skill?.toUpperCase()} - ${question?.questionType?.question_type_name || 'Unknown'}`} 
                size="small" 
                color="primary" 
                sx={{ ml: 2 }}
              />
            </Typography>
            
            {/* Question Content */}
            {question && (
              <Box mb={3}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" mb={2}>
                  Câu hỏi chi tiết:
                </Typography>
                <QuestionDisplay question={question} answer={answer} />
              </Box>
            )}

            {/* Answer Content */}
            {answer && (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="secondary" mb={2}>
                  Câu trả lời học sinh:
                </Typography>
                <DetailedAnswerRenderer question={question} answer={answer} />
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Grading Form */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Chấm điểm và đánh giá
            </Typography>
            
            {/* AI Score vs Manual Score Comparison */}
            {answer && (
              <Box mb={3}>
                <Typography variant="subtitle2" mb={2} color="text.secondary">
                  So sánh điểm AI và điểm thủ công:
                </Typography>
                
                {/* AI Score */}
                <Box display="flex" justifyContent="space-between" alignItems="center" p={2} bgcolor="info.50" borderRadius={1} mb={1}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold" color="info.main">Điểm AI:</Typography>
                    <Typography variant="h6" color="info.main">{answer.score || 0}/{answer.max_score}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(answer.score || 0) / (answer.max_score || 1) * 100}
                    sx={{ width: '40%', height: 8, borderRadius: 4 }}
                    color="info"
                  />
                  <Typography variant="body2" color="info.main" fontWeight="bold">
                    {Math.round((answer.score || 0) / (answer.max_score || 1) * 100)}%
                  </Typography>
                </Box>

                {/* Manual/Final Score */}
                <Box display="flex" justifyContent="space-between" alignItems="center" p={2} bgcolor="primary.50" borderRadius={1}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">Điểm cuối:</Typography>
                    <Typography variant="h6" color="primary.main">{score}/{maxScore}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={scorePercentage}
                    sx={{ width: '40%', height: 8, borderRadius: 4 }}
                    color="primary"
                  />
                  <Typography variant="body2" color="primary.main" fontWeight="bold">
                    {Math.round(scorePercentage)}%
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Final Score Input */}
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                Điểm cuối cùng (Final Score):
              </Typography>
              <TextField
                type="number"
                label="Nhập điểm cuối cùng"
                value={score}
                onChange={(e) => setScore(Math.max(0, Math.min(maxScore, parseFloat(e.target.value) || 0)))}
                InputProps={{
                  endAdornment: <Typography color="text.secondary">/{maxScore}</Typography>
                }}
                fullWidth
                disabled={mode === 'view'}
                inputProps={{ min: 0, max: maxScore, step: 0.1 }}
                error={score > maxScore}
                helperText={
                  score > maxScore ? 
                    `Điểm không được vượt quá ${maxScore}` : 
                    `Điểm AI gốc: ${answer?.score || 0}/${maxScore}`
                }
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: 2
                    }
                  }
                }}
              />
              
              {/* Score Rating Visual */}
              <Box mt={1} display="flex" alignItems="center" gap={2}>
                <Rating
                  value={score / maxScore * 5}
                  readOnly
                  precision={0.1}
                  size="small"
                />
                <Chip 
                  label={getScoreLabel(score, maxScore)} 
                  color={getScoreColor(score, maxScore)}
                  size="small"
                />
              </Box>
            </Box>

            {/* Manual Feedback Input */}
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="secondary">
                Nhận xét thủ công (Manual Feedback):
              </Typography>
              <TextField
                multiline
                rows={8}
                label="Viết nhận xét chi tiết cho học sinh..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                fullWidth
                disabled={mode === 'view'}
                placeholder={`Ví dụ cho ${skill === 'writing' ? 'Writing' : 'Speaking'}:
- Nội dung: ${skill === 'writing' ? 'Ý tưởng rõ ràng, bố cục tốt' : 'Phát âm rõ ràng, lưu loát'}
- Ngôn ngữ: ${skill === 'writing' ? 'Ngữ pháp chính xác, từ vựng phong phú' : 'Sử dụng từ vựng phù hợp'}
- Cần cải thiện: ${skill === 'writing' ? 'Liên kết câu, chính tả' : 'Ngữ điệu, tự tin hơn'}`}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'secondary.main',
                      borderWidth: 2
                    }
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Gợi ý: Hãy đưa ra nhận xét cụ thể và xây dựng để giúp học sinh cải thiện
              </Typography>
            </Box>

            {/* Action Buttons */}
            {mode === 'grade' && (
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitReview}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} /> : <Grade />}
                  fullWidth
                >
                  {saving ? 'Đang lưu...' : 'Lưu đánh giá'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/teacher/submissions')}
                  disabled={saving}
                  sx={{ minWidth: 100 }}
                >
                  Hủy
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

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
  );
};

