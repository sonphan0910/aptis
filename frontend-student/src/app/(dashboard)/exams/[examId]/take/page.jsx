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
  ExitToApp,
  NavigateBefore,
  NavigateNext,
  Flag,
  GridView,
  CheckCircle,
  RadioButtonUnchecked,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { submitAttempt, updateTimer } from '@/store/slices/attemptSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import QuestionDisplay from '@/components/exam-taking/QuestionDisplay';
import ExamTimer from '@/components/exam-taking/ExamTimer';
import ExamModeDialog from '@/components/exam-taking/ExamModeDialog';
import attemptService from '@/services/attemptService';
import { useExamState } from '@/hooks/useExamState';

console.log('[TakeExamPage] Imports loaded:', {
  LoadingSpinner: !!LoadingSpinner,
  QuestionDisplay: !!QuestionDisplay,
  ExamTimer: !!ExamTimer,
  ExamModeDialog: !!ExamModeDialog,
  attemptService: !!attemptService
});

export default function TakeExamPage() {
  const { examId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  
  const attemptId = searchParams.get('attemptId');
  const attemptType = searchParams.get('type') || 'full_exam';
  const selectedSkill = searchParams.get('skill');
  
  const { user } = useSelector(state => state.auth);

  // Use custom hook for state management
  const {
    drawerOpen, setDrawerOpen,
    exitDialogOpen, setExitDialogOpen,
    submitDialogOpen, setSubmitDialogOpen,
    modeDialogOpen, setModeDialogOpen,
    currentQuestionIndex, setCurrentQuestionIndex,
    hideHeader,
    availableSkills, setAvailableSkills,
    selectedSkillFilter, setSelectedSkillFilter,
    isMicrophoneTestActive,
    microphoneTestCompleted,
    isNavigationDisabled,
    currentAttempt, questions, answers, loading, error,
    timeRemaining, timerInitialized, autoSaveStatus,
    handleStartExam,
    handleAnswerChange,
    handleNextQuestion,
    handlePreviousQuestion,
    handleQuestionNavigation,
    handleHideHeader,
    startMicrophoneTest,
    completeMicrophoneTest,
    getQuestionStatus,
    getProgressPercentage
  } = useExamState(examId, attemptId, attemptType, selectedSkill);

  const timerRef = useRef(null);

  // Timer management - update timer every second
  useEffect(() => {
    if (currentAttempt && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        dispatch(updateTimer());
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [currentAttempt, timeRemaining, dispatch]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining <= 0 && currentAttempt && timerInitialized) {
      console.log('[TakeExamPage] Time up, auto-submitting');
      handleTimeUp();
    }
  }, [timeRemaining, currentAttempt, timerInitialized]);

  // Debug: Log current question structure (MUST BE BEFORE CONDITIONAL RETURNS)
  const currentQuestion = questions[currentQuestionIndex];
  useEffect(() => {
    if (currentQuestion) {
      console.log('[TakeExamPage] Current question structure:', {
        id: currentQuestion.id,
        questionType: currentQuestion.questionType?.code,
        hasMediaUrl: !!currentQuestion.media_url,
        media_url: currentQuestion.media_url,
        hasOptions: !!currentQuestion.options,
        optionsCount: currentQuestion.options?.length,
        hasItems: !!currentQuestion.items,
        itemsCount: currentQuestion.items?.length
      });
    }
  }, [currentQuestion]);

  // Handle time up - submit attempt and redirect
  const handleTimeUp = async () => {
    if (currentAttempt) {
      await dispatch(submitAttempt(currentAttempt.id));
      router.push(`/results/${currentAttempt.id}`);
    }
  };

  // Handle submit - called from submit dialog
  const handleSubmit = async () => {
    if (currentAttempt) {
      await dispatch(submitAttempt(currentAttempt.id));
      router.push(`/results/${currentAttempt.id}`);
    }
    setSubmitDialogOpen(false);
  };

  // Handle exit - go back to dashboard
  const handleExit = () => {
    router.push('/dashboard');
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
    firstQuestionContent: questions[0]?.content?.substring(0, 50),
    microphoneTestCompleted, // Debug này
    currentQuestionType: questions[currentQuestionIndex]?.questionType?.code
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
      
      // Set first skill as default filter for full exam
      if (skillsArray.length > 0 && attemptType === 'full_exam') {
        setSelectedSkillFilter(skillsArray[0].id);
      }
      
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
      
      // Set first skill as default filter for full exam
      if (attemptType === 'full_exam') {
        setSelectedSkillFilter(fallbackSkills[0].id);
      }
      
      console.log('[TakeExamPage] Fallback skills set:', fallbackSkills.length);
      
      // Also force dialog open with fallback skills
      if (!currentAttempt) {
        console.log('[TakeExamPage] Force opening dialog after fallback skills set');
        setModeDialogOpen(true);
      }
    }
  };

  // Helper function to group questions by skill
  const groupQuestionsBySkill = () => {
    const grouped = {};
    questions.forEach(q => {
      const skillId = q.skill_type_id || 'unknown';
      if (!grouped[skillId]) {
        grouped[skillId] = [];
      }
      grouped[skillId].push(q);
    });
    return grouped;
  };

  // Helper function to group questions by section
  const groupQuestionsBySection = (skillQuestions) => {
    const grouped = {};
    skillQuestions.forEach(q => {
      const sectionId = q.section_id || 'general';
      const sectionName = q.section?.section_name || q.section_name || 'General';
      if (!grouped[sectionId]) {
        grouped[sectionId] = {
          name: sectionName,
          questions: []
        };
      }
      grouped[sectionId].questions.push(q);
    });
    return grouped;
  };

  // Get filtered questions based on skill selection
  const getFilteredQuestions = () => {
    if (attemptType === 'full_exam' && selectedSkillFilter) {
      return questions.filter(q => q.skill_type_id === selectedSkillFilter);
    }
    return questions;
  };

  // Get current skill info
  const getCurrentSkillInfo = () => {
    if (attemptType === 'full_exam' && selectedSkillFilter) {
      return availableSkills.find(s => s.id === selectedSkillFilter);
    }
    return null;
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

  const currentAnswer = answers.find(a => a.question_id === currentQuestion.id);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top AppBar - Hidden during preparation */}
      {!hideHeader && (
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
              
              {/* Show current skill for full exam */}
              {attemptType === 'full_exam' && getCurrentSkillInfo() && (
                <Chip
                  label={`📚 ${getCurrentSkillInfo().skill_type_name}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              
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
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, minHeight: 0 }}>
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
              <QuestionDisplay
                question={currentQuestion}
                answer={currentAnswer}
                onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                attemptId={currentAttempt?.id}
                onMoveToNextQuestion={handleNextQuestion}
                onHideHeader={handleHideHeader}
                microphoneTestCompleted={microphoneTestCompleted}
                onStartMicrophoneTest={startMicrophoneTest}
                onCompleteMicrophoneTest={completeMicrophoneTest}
              />
            </CardContent>
          </Card>
          
          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<NavigateBefore />}
              onClick={handlePreviousQuestion}
              disabled={
                currentQuestionIndex === 0 || 
                isNavigationDisabled || 
                (currentQuestion?.questionType?.code?.includes('SPEAKING'))
              }
            >
              Câu trước
            </Button>
            
            <Box display="flex" gap={1}>
              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setSubmitDialogOpen(true)}
                  disabled={isNavigationDisabled}
                >
                  Nộp bài
                </Button>
              ) : (
                <Button
                  variant="contained"
                  endIcon={<NavigateNext />}
                  onClick={handleNextQuestion}
                  disabled={isNavigationDisabled}
                >
                  Câu tiếp
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Question Navigation Drawer - Grid View with Skill Filtering */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 420, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Title and Skill Info */}
          <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
            Danh sách câu hỏi
          </Typography>
          
          {/* Skill Tabs for Full Exam Mode */}
          {attemptType === 'full_exam' && availableSkills.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">
                Chọn kỹ năng:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {availableSkills.map(skill => (
                  <Button
                    key={skill.id}
                    variant={selectedSkillFilter === skill.id ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => {
                      setSelectedSkillFilter(skill.id);
                      setCurrentQuestionIndex(0);
                    }}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.85rem',
                    }}
                  >
                    {skill.skill_type_name}
                  </Button>
                ))}
              </Box>
            </Box>
          )}

          {/* Questions Grid - Grouped by Section */}
          <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
            {(() => {
              const filteredQuestions = getFilteredQuestions();
              const skillInfo = getCurrentSkillInfo();
              const groupedBySection = groupQuestionsBySection(filteredQuestions);
              
              return (
                <Box>
                  {/* Current Skill/Section Header */}
                  {attemptType === 'full_exam' && skillInfo && (
                    <Paper sx={{ p: 2, mb: 2, backgroundColor: 'primary.light' }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.dark">
                        📚 {skillInfo.skill_type_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {filteredQuestions.length} câu hỏi
                      </Typography>
                    </Paper>
                  )}

                  {/* Questions by Section */}
                  {Object.entries(groupedBySection).map(([sectionId, sectionData]) => (
                    <Box key={sectionId} sx={{ mb: 3 }}>
                      {/* Section Header */}
                      <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 4,
                            height: 24,
                            backgroundColor: 'primary.main',
                            borderRadius: 1,
                          }}
                        />
                        <Typography variant="subtitle2" fontWeight="bold">
                          {sectionData.name}
                        </Typography>
                        <Chip
                          label={sectionData.questions.length}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      {/* Section Questions Grid */}
                      <Grid container spacing={1}>
                        {sectionData.questions.map((question, idx) => {
                          const globalIndex = questions.findIndex(q => q.id === question.id);
                          const status = getQuestionStatus(question.id);
                          const isActive = globalIndex === currentQuestionIndex;
                          const isAnswered = status === 'answered';
                          
                          // Check if navigation should be disabled for this question
                          const currentQuestion = questions[currentQuestionIndex];
                          const isNavigationDisabledForQuestion = 
                            currentQuestion?.questionType?.code?.includes('SPEAKING') && 
                            globalIndex < currentQuestionIndex;
                          
                          return (
                            <Grid item xs={3} key={question.id}>
                              <Paper
                                onClick={() => {
                                  if (!isNavigationDisabledForQuestion) {
                                    handleQuestionNavigation(globalIndex);
                                    setDrawerOpen(false);
                                  }
                                }}
                                sx={{
                                  p: 1.5,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: isNavigationDisabledForQuestion ? 'not-allowed' : 'pointer',
                                  minHeight: 60,
                                  backgroundColor: isActive ? 'primary.main' : isAnswered ? 'success.main' : 'grey.100',
                                  color: isActive || isAnswered ? 'white' : 'text.primary',
                                  border: isActive ? '2px solid' : '1px solid',
                                  borderColor: isActive ? 'primary.dark' : 'grey.300',
                                  borderRadius: 1,
                                  transition: 'all 0.3s ease',
                                  opacity: isNavigationDisabledForQuestion ? 0.6 : 1,
                                  '&:hover': isNavigationDisabledForQuestion ? {} : {
                                    boxShadow: 2,
                                    transform: 'scale(1.05)',
                                  }
                                }}
                              >
                                <Box sx={{ textAlign: 'center', width: '100%' }}>
                                  <Typography variant="body2" fontWeight="bold">
                                    {globalIndex + 1}
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
                  ))}
                </Box>
              );
            })()}
          </Box>

          {/* Legend */}
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Chú thích:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
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
    </Box>
  );
}