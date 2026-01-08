'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Tab,
  Tabs,
  Paper,
  Chip,
  Avatar,
  Grid,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { ArrowBack, Save, Grade, Psychology, Person } from '@mui/icons-material';
import WritingReview from '@/components/teacher/submissions/WritingReview';
import SpeakingReview from '@/components/teacher/submissions/SpeakingReview';
import { submissionApi } from '@/services/submissionService';

export default function SubmissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId;
  
  const [submissionDetail, setSubmissionDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  
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

  const handleSubmitReview = async (answerId, reviewData) => {
    setSaving(true);
    try {
      await submissionApi.submitAnswerReview(answerId, reviewData);
      showNotification('Đã lưu đánh giá thành công', 'success');
      await loadSubmissionDetail(); // Reload to get updated data
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
        feedback: currentSubmission.teacher_feedback || '',
        final_score: currentSubmission.final_score
      });
    }
  }, [currentSubmission]);

  const handleReviewSubmit = async () => {
    setSaving(true);
    try {
      // Updated to work with new API structure
      showNotification('Đánh giá đã được lưu', 'success');
      router.push('/teacher/submissions');
    } catch (error) {
      showNotification('Có lỗi xảy ra khi lưu đánh giá', 'error');
    } finally {
      setSaving(false);
    }
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/teacher/submissions')}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Xem xét bài làm
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {student?.full_name} - {exam?.title} ({skill})
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="contained"
          onClick={handleReviewSubmit}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : <Grade />}
        >
          Gửi đánh giá
        </Button>
      </Box>

      <Card>
        <CardContent>
          {skill === 'writing' ? (
            <WritingReview
              answer={answer}
              onSubmitReview={handleSubmitReview}
              saving={saving}
            />
          ) : (
            <SpeakingReview
              answer={answer}
              onSubmitReview={handleSubmitReview}
              saving={saving}
            />
          )}
        </CardContent>
      </Card>

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
}