import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import attemptService from '@/services/attemptService';

// Async thunks
export const startNewAttempt = createAsyncThunk(
  'attempts/startNewAttempt',
  async ({ exam_id, attempt_type, selected_skill }, { rejectWithValue }) => {
    console.log('[startNewAttempt] THUNK CALLED with params:', { exam_id, attempt_type, selected_skill });
    
    try {
      const payload = {
        exam_id,
        attempt_type,
      };
      
      // Only add selected_skill_id if it's a valid number or null for full_exam
      if (attempt_type === 'single_skill' && selected_skill) {
        payload.selected_skill_id = selected_skill;
      } else if (attempt_type === 'full_exam') {
        payload.selected_skill_id = null;
      }
      
      console.log('[startNewAttempt] Sending payload to API:', payload);
      console.log('[startNewAttempt] attemptService:', !!attemptService);
      console.log('[startNewAttempt] attemptService.startAttempt:', !!attemptService.startAttempt);
      
      const response = await attemptService.startAttempt(payload);
      console.log('[startNewAttempt] API Response received:', response);
      return response.data;
    } catch (error) {
      console.error('[startNewAttempt] Error details:', error);
      console.error('[startNewAttempt] Error response:', error.response?.data);
      console.error('[startNewAttempt] Error message:', error.message);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi bắt đầu bài thi');
    }
  }
);

export const loadAttempt = createAsyncThunk(
  'attempts/loadAttempt',
  async (attemptId, { rejectWithValue }) => {
    try {
      const response = await attemptService.getAttempt(attemptId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải bài thi');
    }
  }
);

export const loadQuestions = createAsyncThunk(
  'attempts/loadQuestions',
  async ({ attemptId, sectionId, offset = 0, limit = 20 }, { rejectWithValue }) => {
    console.log('[loadQuestions] Loading questions:', { attemptId, sectionId, offset, limit });
    try {
      const params = { offset, limit };
      if (sectionId) params.section_id = sectionId;
      
      const response = await attemptService.getAttemptQuestions(attemptId, params);
      console.log('[loadQuestions] Loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('[loadQuestions] Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải câu hỏi');
    }
  }
);

export const saveAnswer = createAsyncThunk(
  'attempts/saveAnswer',
  async (answerPayload, { rejectWithValue }) => {
    try {
      // answerPayload should already be in correct format from page
      console.log('[saveAnswer] Saving answer:', answerPayload);
      const response = await attemptService.saveAnswer(answerPayload);
      return response.data;
    } catch (error) {
      console.error('[saveAnswer] Error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lưu câu trả lời');
    }
  }
);

export const submitAttempt = createAsyncThunk(
  'attempts/submitAttempt',
  async (attemptId, { rejectWithValue }) => {
    try {
      const response = await attemptService.submitAttempt(attemptId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi nộp bài thi');
    }
  }
);

export const fetchAttemptResults = createAsyncThunk(
  'attempts/fetchAttemptResults',
  async (attemptId, { rejectWithValue }) => {
    try {
      const response = await attemptService.getAttemptResults(attemptId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải kết quả bài thi');
    }
  }
);

export const fetchUserAttempts = createAsyncThunk(
  'attempts/fetchUserAttempts',
  async ({ page = 1, limit = 10, examId }, { rejectWithValue }) => {
    try {
      const response = await attemptService.getUserAttempts({ page, limit, examId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải lịch sử bài thi');
    }
  }
);

export const startAttempt = createAsyncThunk(
  'attempts/startAttempt',
  async (attemptData, { rejectWithValue }) => {
    try {
      const response = await attemptService.startAttempt(attemptData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start attempt');
    }
  }
);

export const fetchCurrentAttempt = createAsyncThunk(
  'attempts/fetchCurrentAttempt',
  async (attemptId, { rejectWithValue }) => {
    try {
      const response = await attemptService.getAttempt(attemptId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attempt');
    }
  }
);

export const uploadAudioAnswer = createAsyncThunk(
  'attempts/uploadAudioAnswer',
  async ({ attemptId, questionId, audioFile }, { rejectWithValue }) => {
    try {
      const response = await attemptService.uploadAudioAnswer(attemptId, questionId, audioFile);
      return { ...response.data, questionId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload audio');
    }
  }
);

const initialState = {
  currentAttempt: null,
  questions: [],
  answers: [],
  questionsLoaded: false, // Track if questions loaded
  questionsLoading: false, // Loading state for questions
  currentQuestionIndex: 0,
  timeRemaining: 0,
  timerInitialized: false,
  isExamStarted: false,
  isPaused: false,
  isSubmitting: false,
  autoSaveStatus: 'idle', // idle, saving, saved, error
  loading: false,
  error: null,
  submissionResult: null,
  attemptResults: null,
  userAttempts: [],
  pagination: {
    page: 1,
    totalPages: 1,
    totalItems: 0
  }
};

const attemptSlice = createSlice({
  name: 'attempts',
  initialState,
  reducers: {
    setCurrentQuestion: (state, action) => {
      state.currentQuestionIndex = action.payload;
    },
    updateTimer: (state) => {
      if (state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      }
    },
    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    pauseExam: (state) => {
      state.isPaused = true;
    },
    resumeExam: (state) => {
      state.isPaused = false;
    },
    setAutoSaveStatus: (state, action) => {
      state.autoSaveStatus = action.payload;
    },
    updateLocalAnswer: (state, action) => {
      const { questionId, answerData } = action.payload;
      console.log('[updateLocalAnswer] Optimistic update:', { questionId, answerData });
      
      const existingAnswer = state.answers.find(a => a.question_id === questionId);
      if (existingAnswer) {
        existingAnswer.answer_data = answerData;
        existingAnswer.isModified = true;
        existingAnswer.lastModified = new Date().toISOString();
        // Mark as answered for immediate UI feedback
        existingAnswer.answered_at = existingAnswer.answered_at || new Date().toISOString();
      } else {
        state.answers.push({
          question_id: questionId,
          answer_data: answerData,
          isModified: true,
          lastModified: new Date().toISOString(),
          answered_at: new Date().toISOString()
        });
      }
      console.log('[updateLocalAnswer] Updated state, total answers:', state.answers.length);
    },
    markAnswerForReview: (state, action) => {
      const { questionId, forReview } = action.payload;
      const existingAnswer = state.answers.find(a => a.question_id === questionId);
      if (existingAnswer) {
        existingAnswer.markedForReview = forReview;
      } else {
        state.answers.push({
          question_id: questionId,
          answer_data: null,
          markedForReview: forReview
        });
      }
    },
    clearCurrentAttempt: (state) => {
      state.currentAttempt = null;
      state.questions = [];
      state.answers = [];
      state.currentQuestionIndex = 0;
      state.timeRemaining = 0;
      state.timerInitialized = false;
      state.isExamStarted = false;
      state.isPaused = false;
      state.submissionResult = null;
      state.error = null;
    },
    clearSubmissionResult: (state) => {
      state.submissionResult = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start New Attempt
      .addCase(startNewAttempt.pending, (state) => {
        console.log('[startNewAttempt.pending] Starting attempt...');
        state.loading = true;
        state.error = null;
      })
      .addCase(startNewAttempt.fulfilled, (state, action) => {
        console.log('[startNewAttempt.fulfilled] Lightweight response received');
        state.loading = false;
        state.currentAttempt = action.payload.data || action.payload;
        state.isExamStarted = true;
        state.currentQuestionIndex = 0;
        
        // New strategy: questions will be loaded separately
        state.questions = [];
        state.questionsLoaded = false;
        state.answers = [];
        
        // Set timer based on exam duration
        const durationMinutes = state.currentAttempt.exam?.duration_minutes || 90;
        state.timeRemaining = durationMinutes * 60;
        state.timerInitialized = true;
        
        console.log('[startNewAttempt.fulfilled] Attempt created:', {
          attemptId: state.currentAttempt.id,
          duration: durationMinutes,
          questionsCount: state.currentAttempt.questions_count,
          loadUrl: state.currentAttempt.load_questions_url
        });
      })
      .addCase(startNewAttempt.rejected, (state, action) => {
        console.error('[startNewAttempt.rejected] Error:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // Load Attempt
      .addCase(loadAttempt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAttempt.fulfilled, (state, action) => {
        console.log('[loadAttempt.fulfilled] Response received:', action.payload);
        state.loading = false;
        state.currentAttempt = action.payload;
        if (action.payload.answers && action.payload.answers.length > 0) {
          state.answers = action.payload.answers;
          // Extract questions from answers
          state.questions = action.payload.answers.map(answer => answer.question).filter(Boolean);
          console.log('[loadAttempt.fulfilled] Questions extracted:', state.questions.length);
          console.log('[loadAttempt.fulfilled] Sample question:', state.questions[0]);
        } else {
          console.warn('[loadAttempt.fulfilled] No answers found in response');
          state.questions = [];
          state.answers = [];
        }
        if (action.payload.exam?.duration_minutes && action.payload.start_time) {
          const startTime = new Date(action.payload.start_time);
          const now = new Date();
          const elapsedSeconds = (now - startTime) / 1000;
          const totalSeconds = action.payload.exam.duration_minutes * 60;
          state.timeRemaining = Math.max(0, totalSeconds - elapsedSeconds);
          state.timerInitialized = true;
          console.log('[loadAttempt.fulfilled] Timer set to:', state.timeRemaining, 'seconds for existing attempt');
          console.log('[loadAttempt.fulfilled] Questions loaded:', state.questions.length);
        }
      })
      .addCase(loadAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Save Answer
      .addCase(saveAnswer.pending, (state) => {
        state.autoSaveStatus = 'saving';
      })
      .addCase(saveAnswer.fulfilled, (state, action) => {
        state.autoSaveStatus = 'saved';
        
        console.log('[saveAnswer.fulfilled] Received response:', action.payload);
        
        const answerIndex = state.answers.findIndex(a => a.question_id === action.payload.question_id);
        
        if (answerIndex >= 0) {
          // Update existing answer with full response data
          state.answers[answerIndex] = {
            ...state.answers[answerIndex],
            ...action.payload,
            isModified: false,
            lastSaved: new Date().toISOString()
          };
          console.log('[saveAnswer.fulfilled] Updated answer at index', answerIndex, ':', state.answers[answerIndex]);
        } else {
          // Add new answer if not found
          state.answers.push({
            ...action.payload,
            isModified: false,
            lastSaved: new Date().toISOString()
          });
          console.log('[saveAnswer.fulfilled] Added new answer:', action.payload);
        }
        
        console.log('[saveAnswer.fulfilled] Total answers in state:', state.answers.length);
      })
      .addCase(saveAnswer.rejected, (state, action) => {
        state.autoSaveStatus = 'error';
        state.error = action.payload;
        console.error('[saveAnswer.rejected]', action.payload);
      })

      // Submit Attempt
      .addCase(submitAttempt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAttempt.fulfilled, (state, action) => {
        state.loading = false;
        state.submissionResult = action.payload;
        state.isExamStarted = false;
      })
      .addCase(submitAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Load Questions Progressively
      .addCase(loadQuestions.pending, (state) => {
        state.questionsLoading = true;
      })
      .addCase(loadQuestions.fulfilled, (state, action) => {
        state.questionsLoading = false;
        
        // Extract questions and answers from response
        const { answers: newAnswers, pagination } = action.payload.data || action.payload;
        
        console.log('[loadQuestions.fulfilled] Processing answers:', newAnswers?.length);
        
        if (newAnswers && newAnswers.length > 0) {
          newAnswers.forEach(answer => {
            console.log('[loadQuestions.fulfilled] Processing answer:', {
              id: answer.id,
              question_id: answer.question_id,
              answer_type: answer.answer_type,
              has_answer_data: !!answer.answer_data,
              answered_at: answer.answered_at
            });

            if (answer.question) {
              // Add question if not already in state
              if (!state.questions.find(q => q.id === answer.question.id)) {
                state.questions.push(answer.question);
              }
              
              // Add/update answer with full data
              const existingIndex = state.answers.findIndex(a => a.question_id === answer.question_id);
              if (existingIndex >= 0) {
                state.answers[existingIndex] = {
                  ...state.answers[existingIndex],
                  ...answer
                };
              } else {
                state.answers.push(answer);
              }
            }
          });
          
          console.log('[loadQuestions.fulfilled] State after loading:', {
            questionsCount: state.questions.length,
            answersCount: state.answers.length,
            sampleAnswer: state.answers[0]
          });
        }
        
        state.questionsLoaded = !pagination?.hasMore; // Mark as fully loaded if no more
      })
      .addCase(loadQuestions.rejected, (state, action) => {
        state.questionsLoading = false;
        state.error = action.payload;
        console.error('[loadQuestions.rejected]', action.payload);
      })

      // Fetch Attempt Results
      .addCase(fetchAttemptResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttemptResults.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { success: true, data: { attempt, sectionScores, totalScore, status } }
        // We want to extract the data part
        state.attemptResults = action.payload.data || action.payload;
      })
      .addCase(fetchAttemptResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch User Attempts
      .addCase(fetchUserAttempts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAttempts.fulfilled, (state, action) => {
        state.loading = false;
        state.userAttempts = action.payload.attempts || [];
        state.pagination = {
          page: action.payload.page || 1,
          totalPages: action.payload.totalPages || 1,
          totalItems: action.payload.totalItems || 0
        };
      })
      .addCase(fetchUserAttempts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Start Attempt
      .addCase(startAttempt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startAttempt.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttempt = action.payload;
        state.isExamStarted = true;
        state.currentQuestionIndex = 0;
        state.answers = [];
        state.timeRemaining = action.payload.exam?.duration_minutes ? action.payload.exam.duration_minutes * 60 : 0;
      })
      .addCase(startAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Current Attempt
      .addCase(fetchCurrentAttempt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentAttempt.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttempt = action.payload;
        state.isExamStarted = true;
        if (action.payload.answers) {
          state.answers = action.payload.answers;
        }
        if (action.payload.exam?.duration_minutes && action.payload.start_time) {
          const startTime = new Date(action.payload.start_time);
          const now = new Date();
          const elapsedSeconds = (now - startTime) / 1000;
          const totalSeconds = action.payload.exam.duration_minutes * 60;
          state.timeRemaining = Math.max(0, totalSeconds - elapsedSeconds);
        }
      })
      .addCase(fetchCurrentAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Upload Audio Answer
      .addCase(uploadAudioAnswer.pending, (state) => {
        state.autoSaveStatus = 'saving';
      })
      .addCase(uploadAudioAnswer.fulfilled, (state, action) => {
        state.autoSaveStatus = 'saved';
        const answerIndex = state.answers.findIndex(a => a.question_id === action.payload.questionId);
        if (answerIndex >= 0) {
          state.answers[answerIndex].audio_url = action.payload.audio_url;
          state.answers[answerIndex].isModified = false;
        }
      })
      .addCase(uploadAudioAnswer.rejected, (state, action) => {
        state.autoSaveStatus = 'error';
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentQuestion,
  updateTimer,
  setTimeRemaining,
  pauseExam,
  resumeExam,
  setAutoSaveStatus,
  updateLocalAnswer,
  markAnswerForReview,
  clearCurrentAttempt,
  clearSubmissionResult,
  clearError,
} = attemptSlice.actions;

export default attemptSlice.reducer;