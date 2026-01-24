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
  Save
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
  const answerId = searchParams.get('answerId'); // Get the answer ID from query param
  
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
    if (submissionDetail?.answers) {
      // Find the specific answer if answerId is provided, otherwise use first
      let answer;
      if (answerId) {
        answer = submissionDetail.answers.find(a => a.id === parseInt(answerId));
      }
      if (!answer) {
        answer = submissionDetail.answers[0];
      }
      
      if (answer) {
        setScore(answer.final_score || answer.score || 0);
        setFeedback(answer.manual_feedback || '');
      }
    }
  }, [submissionDetail, answerId]);

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
      // Find the correct answer
      let targetAnswer;
      if (answerId) {
        targetAnswer = submissionDetail.answers.find(a => a.id === parseInt(answerId));
      }
      if (!targetAnswer) {
        targetAnswer = submissionDetail.answers[0];
      }
      
      if (!targetAnswer?.id) {
        showNotification('Không thể xác định câu trả lời', 'error');
        setSaving(false);
        return;
      }
      
      // Chỉ gửi final_score và manual_feedback thôi
      await submissionApi.submitAnswerReview(targetAnswer.id, {
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
    return <Chip label={config.label} color={config.color} size="small" sx={{ '& .MuiChip-label': { color: '#fff'} }} />;
  };

  if (loading || !submissionDetail) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const { skill, student, exam, answers } = submissionDetail;
  
  // Find the specific answer if answerId is provided, otherwise use first
  let answer;
  if (answerId && answers) {
    answer = answers.find(a => a.id === parseInt(answerId));
  }
  if (!answer && answers) {
    answer = answers[0];
  }
  
  // Derive skill from question type code (more reliable than submissionDetail.skill)
  const getSkillFromQuestionCode = (code) => {
    if (!code) return null;
    if (code.startsWith('WRITING_')) return 'Writing';
    if (code.startsWith('SPEAKING_')) return 'Speaking';
    if (code.startsWith('LISTENING_')) return 'Listening';
    if (code.startsWith('READING_')) return 'Reading';
    return null;
  };
  
  const derivedSkill = answer?.question?.questionType?.code 
    ? getSkillFromQuestionCode(answer.question.questionType.code)
    : skill;
  
  const question = answer?.question || {};
  const maxScore = answer?.max_score || 100;
  const scorePercentage = maxScore ? (score / maxScore) * 100 : 0;
  
  // Determine grading status: check final_score first, then grading_status
  const hasManualScore = answer?.final_score !== null && answer?.final_score !== undefined && answer?.final_score !== '';
  const gradingStatus = hasManualScore ? 'manually_graded' : (answer?.grading_status || 'ungraded');
  
  // Check if we should show comparison:
  // - In grade mode: always show for editing
  // - In view mode: only show if no manual score yet (ungraded or ai_graded)
  const shouldShowComparison = mode === 'grade' || (mode === 'view' && !hasManualScore);

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
              <Chip label={derivedSkill || 'Không xác định'} color="primary" size="small" />
              {getStatusChip(gradingStatus)}
              {mode === 'view' && (
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => router.push(`/teacher/submissions/${attemptId}?mode=grade`)}
                >
                  Chuyển sang chấm
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Student Answer Display */}
        <Grid item xs={12} md={7}>
    
            {/* Question Content */}
            {question && (
              <Box mb={3}>

                <QuestionDisplay question={question} answer={answer} />
              </Box>
            )}

            {/* Answer Content */}
            {answer && (
              <Box>
                <DetailedAnswerRenderer question={question} answer={answer} />
              </Box>
            )}
      
        </Grid>

        {/* Right Column - Grading Form */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Chấm điểm và đánh giá
            </Typography>
            
            {/* AI Score vs Manual Score Comparison - Only show in grade mode or if scores differ */}
            {shouldShowComparison && answer && (
              <Box mb={3}>

                
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
              

            </Box>

            {/* Manual Feedback Input */}
            <Box mb={3}>

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
                  startIcon={saving ? <CircularProgress size={16} /> : <Save />}
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

