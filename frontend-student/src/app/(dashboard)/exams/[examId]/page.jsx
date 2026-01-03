'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Tab,
  Tabs,
  Divider,
  Alert,
} from '@mui/material';
import {
  AccessTime,
  Quiz,
  PlayArrow,
  Refresh,
  Star,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExamDetails, fetchMyAttempts } from '@/store/slices/examSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AttemptHistory from '@/components/exams/AttemptHistory';
import StartExamDialog from '@/components/exams/StartExamDialog';
import { Container, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import NextLink from 'next/link';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`exam-tabpanel-${index}`}
      aria-labelledby={`exam-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ExamDetailPage() {
  const [tabValue, setTabValue] = useState(0);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const { examId } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { currentExam, isLoadingDetails, myAttempts, error } = useSelector(state => state.exams);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (examId) {
      dispatch(fetchExamDetails(examId));
      dispatch(fetchMyAttempts());
    }
  }, [examId, dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStartExam = () => {
    // Redirect to take exam with full_exam mode
    router.push(`/exams/${examId}/take?type=full_exam`);
  };

  const handleContinueExam = (attemptId) => {
    router.push(`/exams/${examId}/take?attemptId=${attemptId}`);
  };

  if (isLoadingDetails) return <LoadingSpinner />;
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }
  if (!currentExam) return null;

  // Backend trả về exam object directly
  const exam = currentExam;
  // Filter attempts for this specific exam
  const userAttempts = Array.isArray(myAttempts)
    ? myAttempts.filter(attempt => attempt.exam_id === parseInt(examId))
    : [];
  const stats = {};
  const hasActiveAttempt = userAttempts.some(attempt => attempt.status === 'in_progress');
  const bestScore = userAttempts.length > 0 ? Math.max(...userAttempts.map(a => a.total_score || 0)) : null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Custom Breadcrumb for Exam Detail */}
      <Box mb={3}>
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            component={NextLink}
            href="/home"
            underline="hover"
            color="inherit"
            display="flex"
            alignItems="center"
            gap={0.5}
          >
            <Home fontSize="small" />
            Trang chủ
          </Link>
          <Link
            component={NextLink}
            href="/exams"
            underline="hover"
            color="inherit"
          >
            Duyệt bài thi
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 500 }}>
            {exam.title}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Card sx={{ mb: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {exam.title}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {exam.description}
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Chip 
                label={exam.aptisType?.aptis_type_name || exam.aptis_type} 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </Box>

         

          <Box display="flex" gap={1}>
            {hasActiveAttempt ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrow />}
                onClick={() => handleContinueExam(userAttempts.find(a => a.status === 'in_progress').id)}
              >
                Tiếp tục làm bài
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrow />}
                onClick={handleStartExam}
              >
                Bắt đầu làm bài
              </Button>
            )}
            
            {userAttempts.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleStartExam}
              >
                Làm lại
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fafafa' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                color: 'text.secondary',
              },
              '& .Mui-selected': {
                color: 'primary.main',
                fontWeight: 600,
              },
            }}
          >
            <Tab label="Tổng quan" />
            <Tab label="Phần thi" />
            <Tab label="Lịch sử làm bài" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Mô tả bài thi
          </Typography>
          <Typography paragraph>
            {exam.description || 'Không có mô tả chi tiết.'}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Kỹ năng đánh giá
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {exam.sections?.map((section) => (
              <Chip 
                key={section.id}
                label={section.skillType?.skill_type_name || 'N/A'}
                size="small"
                variant="outlined"
              />
            )) || <Typography color="textSecondary">Không có kỹ năng đánh giá</Typography>}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Cấu trúc bài thi
            </Typography>
            {exam.sections?.map((section, index) => {
              const totalQuestions = section.questions?.length || 0;
              const totalScore = section.questions?.reduce((sum, q) => sum + (parseInt(q.max_score) || 0), 0) || 0;
              return (
                <Card 
                  key={section.id} 
                  variant="outlined" 
                  sx={{ 
                    mb: 2, 
                    borderColor: 'divider',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      borderColor: 'primary.light',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2} alignItems="flex-start">
                      <Grid item xs={12} sm={8}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                          Phần {index + 1}: {section.skillType?.skill_type_name || 'N/A'}
                        </Typography>
                        {section.instruction && (
                          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                            {section.instruction}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime sx={{ fontSize: 20, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {section.duration_minutes} phút
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Quiz sx={{ fontSize: 20, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {totalQuestions} câu
                            </Typography>
                          </Box>
                          <Chip
                            label={`${totalScore} điểm`}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              );
            }) || (
              <Typography color="textSecondary">
                Không có thông tin chi tiết về cấu trúc bài thi.
              </Typography>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <AttemptHistory attempts={userAttempts} examId={examId} />
        </TabPanel>
      </Card>

      {/* Start Exam Dialog */}
      <StartExamDialog
        open={startDialogOpen}
        onClose={() => setStartDialogOpen(false)}
        exam={exam}
        onStart={(attemptType, selectedSkill) => {
          const queryParams = new URLSearchParams();
          queryParams.set('type', attemptType);
          if (selectedSkill) {
            queryParams.set('skill', selectedSkill);
          }
          router.push(`/exams/${examId}/take?${queryParams.toString()}`);
        }}
      />
    </Container>
  );
}