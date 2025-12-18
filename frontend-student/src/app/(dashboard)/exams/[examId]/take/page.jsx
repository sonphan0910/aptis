'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  LinearProgress,
  Card,
  CardContent,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  Paper,
} from '@mui/material';
import {
  Menu,
  Pause,
  ExitToApp,
  NavigateBefore,
  NavigateNext,
  Flag,
  GridView,
  CheckCircle,
  RadioButtonUnchecked,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  startNewAttempt, 
  loadAttempt,
  loadQuestions, 
  saveAnswer, 
  submitAttempt,
  updateTimer,
  updateLocalAnswer 
} from '@/store/slices/attemptSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import QuestionDisplay from '@/components/exam-taking/QuestionDisplay';
import ExamTimer from '@/components/exam-taking/ExamTimer';
import ExamModeDialog from '@/components/exam-taking/ExamModeDialog';
import attemptService from '@/services/attemptService';

console.log('[TakeExamPage] Imports loaded:', {
  LoadingSpinner: !!LoadingSpinner,
  QuestionDisplay: !!QuestionDisplay,
  ExamTimer: !!ExamTimer,
  ExamModeDialog: !!ExamModeDialog,
  attemptService: !!attemptService
});

export default function TakeExamPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [modeDialogOpen, setModeDialogOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const { examId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const timerRef = useRef(null);
  
  const attemptId = searchParams.get('attemptId');
  const attemptType = searchParams.get('type') || 'full_exam';
  const selectedSkill = searchParams.get('skill');
  
  const { 
    currentAttempt, 
    questions, 
    answers, 
    loading, 
    error,
    timeRemaining,
    timerInitialized,
    autoSaveStatus 
  } = useSelector(state => state.attempts);
  
  const { user } = useSelector(state => state.auth);

  const handleStartExam = useCallback(async ({ attemptType, selectedSkill }) => {
    console.log('[TakeExamPage] !!!!! handleStartExam called !!!!');
    console.log('[TakeExamPage] Starting exam with mode:', { attemptType, selectedSkill });
    
    setModeDialogOpen(false);
    
    console.log('[TakeExamPage] Dispatching startNewAttempt with:', {
      exam_id: parseInt(examId, 10),
      attempt_type: attemptType,
      selected_skill: selectedSkill
    });
    
    try {
      const action = await dispatch(startNewAttempt({
        exam_id: parseInt(examId, 10),
        attempt_type: attemptType,
        selected_skill: selectedSkill
      })).unwrap();
      
      console.log('[TakeExamPage] Attempt created successfully:', action);
      
      // Load questions after attempt is created
      const attemptId = action.data?.id || action.id;
      if (attemptId) {
        console.log('[TakeExamPage] Loading questions for attempt:', attemptId);
        await dispatch(loadQuestions({
          attemptId,
          offset: 0,
          limit: 50 // Load all questions at once for now
        })).unwrap();
        console.log('[TakeExamPage] Questions loaded successfully');
      }
    } catch (error) {
      console.error('[TakeExamPage] Error starting exam:', error);
    }
  }, [examId, dispatch]);

  // Initialize attempt
  useEffect(() => {
    console.log('[TakeExamPage] useEffect triggered with:', { 
      examId, 
      currentAttempt: !!currentAttempt, 
      attemptId, 
      attemptType, 
      selectedSkill,
      hasInitialized,
      modeDialogOpen
    });
    
    // Only initialize once
    if (hasInitialized) {
      console.log('[TakeExamPage] Already initialized, skipping');
      return;
    }
    
    if (!examId) return;
    
    setHasInitialized(true);
    
    if (attemptId) {
      console.log('[TakeExamPage] Loading existing attempt:', attemptId);
      // Continue existing attempt
      dispatch(loadAttempt(attemptId));
    } else if (attemptType) {
      // Auto-start if attemptType is provided in URL
      console.log('[TakeExamPage] Auto-starting with params from URL:', { attemptType, selectedSkill });
      handleStartExam({ attemptType, selectedSkill: selectedSkill || null });
    } else {
      // Show mode selection dialog for new attempts without params
      console.log('[TakeExamPage] No params, showing mode selection dialog');
      setModeDialogOpen(true);
      // Load available skills for single_skill mode
      loadAvailableSkills();
    }
  }, [examId, attemptId, attemptType, dispatch, hasInitialized, currentAttempt, selectedSkill, handleStartExam]);

  // Load questions when attempt is ready
  useEffect(() => {
    const shouldLoadQuestions = 
      currentAttempt && 
      currentAttempt.id && 
      questions.length === 0 && 
      !loading;
    
    if (shouldLoadQuestions) {
      console.log('[TakeExamPage] Attempt ready, loading questions for attempt:', currentAttempt.id);
      dispatch(loadQuestions({
        attemptId: currentAttempt.id,
        offset: 0,
        limit: 50
      }));
    }
  }, [currentAttempt, questions.length, loading, dispatch]);

  // Timer management
  useEffect(() => {
    if (currentAttempt && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        dispatch(updateTimer());
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [currentAttempt, timeRemaining, dispatch]);

  // Auto-submit when time runs out
  useEffect(() => {
    // Only auto-submit if we have a valid attempt and timer was properly initialized and has run out
    if (timeRemaining <= 0 && currentAttempt && timerInitialized) {
      console.log('[TakeExamPage] Time up, auto-submitting attempt:', currentAttempt.id);
      handleTimeUp();
    }
  }, [timeRemaining, currentAttempt, timerInitialized]);

  const handleTimeUp = async () => {
    if (currentAttempt) {
      await dispatch(submitAttempt(currentAttempt.id));
      router.push(`/results/${currentAttempt.id}`);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    console.log('[handleAnswerChange] Question:', questionId, 'Answer:', answer);
    
    // Find question to determine type
    const question = questions.find(q => q.id === questionId);
    if (!question) {
      console.error('[handleAnswerChange] Question not found:', questionId);
      return;
    }

    // STEP 1: Optimistic update - update local state immediately for instant UI feedback
    dispatch(updateLocalAnswer({ 
      questionId, 
      answerData: answer 
    }));

    // STEP 2: Format payload for API
    const payload = {
      attempt_id: currentAttempt.id,
      question_id: questionId,
    };

    // Detect answer type and format accordingly
    if (answer.selected_option !== undefined) {
      // MCQ answer
      payload.answer_type = 'option';
      payload.selected_option_id = parseInt(answer.selected_option);
    } else if (answer.matches !== undefined) {
      // Matching answer (object mapping item IDs to option IDs)
      payload.answer_type = 'json';
      payload.answer_json = JSON.stringify(answer.matches);
    } else if (answer.gap_answers !== undefined) {
      // Gap filling answer (array of strings)
      payload.answer_type = 'json';
      payload.answer_json = JSON.stringify(answer.gap_answers);
    } else if (answer.text !== undefined) {
      // Text answer (Writing, etc.)
      payload.answer_type = 'text';
      payload.text_answer = answer.text;
    } else if (answer.audio_url !== undefined) {
      // Audio answer (Speaking)
      payload.answer_type = 'audio';
      payload.audio_url = answer.audio_url;
    } else if (typeof answer === 'object') {
      // Complex answer (Ordering, etc.)
      payload.answer_type = 'json';
      payload.answer_json = JSON.stringify(answer);
    } else {
      console.error('[handleAnswerChange] Unknown answer format:', answer);
      return;
    }

    console.log('[handleAnswerChange] Formatted payload:', payload);
    
    // STEP 3: Save to API (will update state again with server response)
    dispatch(saveAnswer(payload));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestionIndex(index);
    setDrawerOpen(false);
  };

  const handleSubmit = async () => {
    if (currentAttempt) {
      await dispatch(submitAttempt(currentAttempt.id));
      router.push(`/results/${currentAttempt.id}`);
    }
    setSubmitDialogOpen(false);
  };

  const handleExit = () => {
    router.push('/dashboard');
  };

  const handlePause = () => {
    // Implementation for pause functionality
    setPauseDialogOpen(true);
  };

  const getQuestionStatus = (questionId) => {
    const answer = answers.find(a => a.question_id === questionId);
    
    console.log('[getQuestionStatus] Checking question:', {
      questionId,
      hasAnswer: !!answer,
      answerId: answer?.id,
      answerType: answer?.answer_type,
      hasAnswerData: !!answer?.answer_data,
      answeredAt: answer?.answered_at,
      isModified: answer?.isModified
    });

    // Check if answer exists (including optimistic updates)
    if (answer) {
      // If has answer_data (optimistic or saved), mark as answered
      if (answer.answer_data) {
        // Additional validation: check if answer_data has actual content
        const hasContent = 
          (answer.answer_data.selected_option) ||
          (answer.answer_data.matches && Object.keys(answer.answer_data.matches).length > 0) ||
          (answer.answer_data.gap_answers && answer.answer_data.gap_answers.some(a => a && a.trim())) ||
          (answer.answer_data.text && answer.answer_data.text.trim()) ||
          (answer.answer_data.audio_url) ||
          (answer.answer_data.ordered_items);
        
        if (hasContent) {
          return 'answered';
        }
      }
      
      // Fallback: check answered_at
      if (answer.answered_at) {
        // Verify answer actually has content based on type
        if (answer.answer_type === 'option' && answer.selected_option_id) {
          return 'answered';
        } else if (answer.answer_type === 'json' && answer.answer_json) {
          return 'answered';
        } else if (answer.answer_type === 'text' && answer.text_answer) {
          return 'answered';
        } else if (answer.answer_type === 'audio' && answer.audio_url) {
          return 'answered';
        }
      }
    }
    
    return 'unanswered';
  };

  const getQuestionTypeLabel = (questionType) => {
    const questionTypeMap = {
      'GV_MCQ': 'Multiple Choice',
      'GV_GAP_FILL': 'Gap Filling',
      'GV_MATCHING': 'Matching',
      'READING_MCQ': 'Multiple Choice',
      'READING_TRUE_FALSE': 'True/False',
      'READING_MATCHING': 'Matching Headings',
      'READING_SHORT_ANSWER': 'Short Answer',
      'LISTENING_MCQ': 'Multiple Choice',
      'LISTENING_GAP_FILL': 'Gap Filling',
      'LISTENING_MATCHING': 'Matching',
      'LISTENING_NOTE_COMPLETION': 'Note Completion',
      'WRITING_SHORT': 'Short Writing',
      'WRITING_LONG': 'Long Writing',
      'WRITING_EMAIL': 'Email Writing',
      'WRITING_ESSAY': 'Essay Writing',
      'SPEAKING_INTRO': 'Personal Introduction',
      'SPEAKING_DESCRIPTION': 'Picture Description',
      'SPEAKING_COMPARISON': 'Comparison',
      'SPEAKING_DISCUSSION': 'Topic Discussion',
    };
    return questionTypeMap[questionType] || questionType;
  };

  const getProgressPercentage = () => {
    const answeredCount = questions.filter(q => 
      getQuestionStatus(q.id) === 'answered'
    ).length;
    return (answeredCount / questions.length) * 100;
  };

  console.log('[TakeExamPage] Render state:', { 
    loading, 
    error, 
    currentAttempt: !!currentAttempt, 
    questionsLength: questions.length,
    timeRemaining,
    timerInitialized,
    currentAttemptId: currentAttempt?.id,
    answersLength: answers.length,
    firstQuestion: questions[0]?.id,
    firstQuestionType: questions[0]?.questionType?.code,
    firstQuestionContent: questions[0]?.content?.substring(0, 50)
  });

  // Check if we need to extract questions again from current attempt
  useEffect(() => {
    if (currentAttempt && currentAttempt.answers && questions.length === 0) {
      console.log('[TakeExamPage] Current attempt has answers but no questions extracted, attempting to extract...');
      console.log('[TakeExamPage] Answers in current attempt:', currentAttempt.answers.length);
      if (currentAttempt.answers.length > 0 && currentAttempt.answers[0].question) {
        console.log('[TakeExamPage] Sample answer structure:', currentAttempt.answers[0]);
      }
    }
  }, [currentAttempt, questions.length]);

  const loadAvailableSkills = async () => {
    console.log('[TakeExamPage] loadAvailableSkills called for examId:', examId);
    try {
      const response = await attemptService.getExamSkills(examId);
      console.log('[TakeExamPage] Skills API response:', response);
      console.log('[TakeExamPage] Skills data:', response.data);
      console.log('[TakeExamPage] Skills data.data:', response.data?.data);
      console.log('[TakeExamPage] Skills array from data.skills:', response.data?.skills);
      console.log('[TakeExamPage] Skills array from data.data.skills:', response.data?.data?.skills);
      
      // Fix the parsing logic based on the actual response structure
      const skillsArray = response.data?.data?.skills || response.data?.skills || [];
      console.log('[TakeExamPage] Final skills array:', skillsArray);
      
      // Ensure component re-renders after skills are loaded
      setAvailableSkills(skillsArray);
      console.log('[TakeExamPage] Skills set successfully:', skillsArray.length);
      
      // Force dialog to show after skills are loaded if no attempt exists
      if (!currentAttempt) {
        console.log('[TakeExamPage] Force opening dialog after skills loaded');
        setModeDialogOpen(true);
      }
    } catch (error) {
      console.error('[TakeExamPage] Error loading skills:', error);
      // Fallback to default skills
      console.log('[TakeExamPage] Using fallback skills');
      const fallbackSkills = [
        { id: 1, skill_type_name: 'Grammar & Vocabulary', description: 'Test your grammar and vocabulary knowledge' },
        { id: 2, skill_type_name: 'Reading', description: 'Reading comprehension exercises' },
        { id: 3, skill_type_name: 'Writing', description: 'Writing tasks and essays' },
        { id: 4, skill_type_name: 'Listening', description: 'Listening comprehension tests' },
        { id: 5, skill_type_name: 'Speaking', description: 'Speaking and pronunciation practice' }
      ];
      setAvailableSkills(fallbackSkills);
      console.log('[TakeExamPage] Fallback skills set:', fallbackSkills.length);
      
      // Also force dialog open with fallback skills
      if (!currentAttempt) {
        console.log('[TakeExamPage] Force opening dialog after fallback skills set');
        setModeDialogOpen(true);
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="h6" gutterBottom>Lỗi tải bài thi</Typography>
        <Typography>{error}</Typography>
        <Button 
          variant="outlined" 
          onClick={() => router.push('/dashboard')} 
          sx={{ mt: 2 }}
        >
          Quay về Dashboard
        </Button>
      </Alert>
    );
  }
  
  // Show loading if we have an attempt but questions are still loading
  if (currentAttempt && questions.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LoadingSpinner />
        <Typography sx={{ mt: 2 }}>Đang tải câu hỏi...</Typography>
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Attempt ID: {currentAttempt.id} | Answers: {answers.length} | Questions: {questions.length}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          First Answer: {answers[0]?.id} | Has Question: {!!answers[0]?.question}
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => {
            console.log('Manual refresh attempt');
            console.log('Current attempt answers:', answers.map(a => ({ id: a.id, hasQuestion: !!a.question, questionId: a.question?.id })));
            dispatch(loadAttempt(currentAttempt.id));
          }} 
          sx={{ mt: 2 }}
        >
          Thử lại
        </Button>
      </Box>
    );
  }
  
  if (!currentAttempt) {
    console.log('[TakeExamPage] No currentAttempt, rendering initialization screen with dialog');
    return (
      <Box>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Đang khởi tạo bài thi...</Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Mode Dialog Open: {modeDialogOpen ? 'true' : 'false'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Skills loaded: {availableSkills.length}
          </Typography>
          <LoadingSpinner />
          
          {/* Debug: Always show dialog */}
          <Button 
            variant="outlined" 
            onClick={() => setModeDialogOpen(true)} 
            sx={{ mt: 2 }}
          >
            Debug: Show Dialog
          </Button>
        </Box>
        
        {/* Exam Mode Selection Dialog - MOVED HERE */}
        {console.log('[TakeExamPage] About to render ExamModeDialog with:', {
          open: modeDialogOpen,
          availableSkillsCount: availableSkills.length,
          examTitle: 'APTIS Exam',
          dialogExists: !!ExamModeDialog
        })}
        {modeDialogOpen && console.log('[TakeExamPage] Dialog should be visible now!')}
        <ExamModeDialog
          open={modeDialogOpen}
          onClose={() => {
            console.log('[TakeExamPage] ExamModeDialog onClose called');
            setModeDialogOpen(false);
            router.push('/dashboard');
          }}
          onStartExam={handleStartExam}
          exam={{ title: 'APTIS Exam', duration_minutes: 90 }}
          availableSkills={availableSkills}
        />
        {console.log('[TakeExamPage] ExamModeDialog rendered')}
      </Box>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.question_id === currentQuestion.id);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top AppBar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton 
            edge="start" 
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <GridView />
          </IconButton>
          
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" noWrap>
              {currentAttempt.exam.title}
            </Typography>
            <Chip 
              label={`${currentQuestionIndex + 1}/${questions.length}`} 
              size="small" 
              variant="outlined"
            />
            {/* Save status indicator */}
            {autoSaveStatus === 'saving' && (
              <Chip 
                label="Đang lưu..." 
                size="small" 
                color="info"
                variant="outlined"
              />
            )}
            {autoSaveStatus === 'saved' && (
              <Chip 
                label="✓ Đã lưu" 
                size="small" 
                color="success"
                variant="filled"
              />
            )}
          </Box>
          
          <ExamTimer timeRemaining={timeRemaining} />
          
          <IconButton onClick={handlePause} sx={{ ml: 1 }}>
            <Pause />
          </IconButton>
          
          <IconButton onClick={() => setExitDialogOpen(true)} sx={{ ml: 1 }}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
        
        {/* Progress Bar */}
        <LinearProgress 
          variant="determinate" 
          value={getProgressPercentage()} 
          sx={{ height: 4 }}
        />
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <QuestionDisplay
                question={currentQuestion}
                answer={currentAnswer}
                onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                attemptId={currentAttempt?.id}
              />
            </CardContent>
          </Card>
          
          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<NavigateBefore />}
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Câu trước
            </Button>
            
            <Box display="flex" gap={1}>
              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setSubmitDialogOpen(true)}
                >
                  Nộp bài
                </Button>
              ) : (
                <Button
                  variant="contained"
                  endIcon={<NavigateNext />}
                  onClick={handleNextQuestion}
                >
                  Câu tiếp
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Question Navigation Drawer - Grid View */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 380, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Danh sách câu hỏi
          </Typography>
          
          <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
            <Grid container spacing={1}>
              {questions.map((question, index) => {
                const status = getQuestionStatus(question.id);
                const isActive = index === currentQuestionIndex;
                const isAnswered = status === 'answered';
                
                return (
                  <Grid item xs={3} key={question.id}>
                    <Paper
                      onClick={() => handleQuestionNavigation(index)}
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        minHeight: 60,
                        backgroundColor: isActive ? 'primary.main' : isAnswered ? 'success.main' : 'grey.100',
                        color: isActive || isAnswered ? 'white' : 'text.primary',
                        border: isActive ? '2px solid' : '1px solid',
                        borderColor: isActive ? 'primary.dark' : 'grey.300',
                        borderRadius: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: 2,
                          transform: 'scale(1.05)',
                        }
                      }}
                    >
                      <Box sx={{ textAlign: 'center', width: '100%' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {index + 1}
                        </Typography>
                        {isAnswered && (
                          <CheckCircle sx={{ fontSize: 16, mt: 0.5 }} />
                        )}
                        {!isAnswered && (
                          <RadioButtonUnchecked sx={{ fontSize: 16, mt: 0.5, opacity: 0.5 }} />
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Legend */}
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Chú thích:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 30, height: 30, backgroundColor: 'success.main', borderRadius: 0.5 }} />
                <Typography variant="caption">Đã làm</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 30, height: 30, backgroundColor: 'grey.100', border: '1px solid', borderColor: 'grey.300', borderRadius: 0.5 }} />
                <Typography variant="caption">Chưa làm</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 30, height: 30, backgroundColor: 'primary.main', borderRadius: 0.5 }} />
                <Typography variant="caption">Hiện tại</Typography>
              </Box>
            </Box>
          </Box>
          
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<Flag />}
            onClick={() => {
              setDrawerOpen(false);
              setSubmitDialogOpen(true);
            }}
            sx={{ mt: 2 }}
          >
            Nộp bài
          </Button>
        </Box>
      </Drawer>

      {/* Exit Dialog */}
      <Dialog open={exitDialogOpen} onClose={() => setExitDialogOpen(false)}>
        <DialogTitle>Thoát khỏi bài thi</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn thoát? Tiến trình làm bài sẽ được lưu lại.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExitDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleExit} color="primary">Thoát</Button>
        </DialogActions>
      </Dialog>

      {/* Submit Dialog */}
      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)}>
        <DialogTitle>Nộp bài thi</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Bạn có chắc chắn muốn nộp bài? Sau khi nộp, bạn không thể thay đổi câu trả lời.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Số câu đã trả lời: {questions.filter(q => getQuestionStatus(q.id) === 'answered').length}/{questions.length}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Nộp bài
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pause Dialog */}
      <Dialog open={pauseDialogOpen} onClose={() => setPauseDialogOpen(false)}>
        <DialogTitle>Tạm dừng bài thi</DialogTitle>
        <DialogContent>
          <Typography>
            Bài thi đã được tạm dừng. Thời gian vẫn tiếp tục trôi.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPauseDialogOpen(false)} color="primary">
            Tiếp tục
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}