'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Tab,
  Tabs
} from '@mui/material';
import { ArrowBack, Save, Grade } from '@mui/icons-material';
import WritingReview from '@/components/teacher/submissions/WritingReview';
import SpeakingReview from '@/components/teacher/submissions/SpeakingReview';
import { fetchSubmissionDetail, submitReview } from '@/store/slices/submissionSlice';
import { showNotification } from '@/store/slices/uiSlice';

export default function SubmissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  
  const attemptId = params.attemptId;
  const { currentSubmission, loading } = useSelector(state => state.submission);
  
  const [activeTab, setActiveTab] = useState(0);
  const [reviewData, setReviewData] = useState({
    scores: {},
    feedback: '',
    final_score: null
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (attemptId) {
      dispatch(fetchSubmissionDetail(attemptId));
    }
  }, [attemptId, dispatch]);

  useEffect(() => {
    if (currentSubmission) {
      setReviewData({
        scores: currentSubmission.criteria_scores || {},
        feedback: currentSubmission.teacher_feedback || '',
        final_score: currentSubmission.final_score
      });
    }
  }, [currentSubmission]);

  const handleReviewSubmit = async () => {
    setSaving(true);
    try {
      const result = await dispatch(submitReview({
        attemptId,
        ...reviewData
      }));
      
      if (submitReview.fulfilled.match(result)) {
        dispatch(showNotification({
          message: 'Gửi đánh giá thành công!',
          type: 'success'
        }));
        router.push('/teacher/submissions');
      }
    } catch (error) {
      dispatch(showNotification({
        message: 'Có lỗi xảy ra khi gửi đánh giá',
        type: 'error'
      }));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !currentSubmission) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const { skill, student_name, exam_title, question_text } = currentSubmission;

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
              {student_name} - {exam_title} ({skill})
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
              submission={currentSubmission}
              reviewData={reviewData}
              onReviewChange={setReviewData}
            />
          ) : (
            <SpeakingReview
              submission={currentSubmission}
              reviewData={reviewData}
              onReviewChange={setReviewData}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}