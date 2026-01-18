'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Typography,
  Alert,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import { CheckCircle, Warning, RecordVoiceOver } from '@mui/icons-material';

/**
 * Speaking Personal Introduction Form - Task 1 của Speaking skill
 * Dựa trên seed data: A2 level, 0-5 scale
 * Personal introduction với thời gian chuẩn bị và ghi âm
 */
export default function SpeakingPersonalIntroForm({ content, onChange }) {
  const [task, setTask] = useState('');
  const [instructions, setInstructions] = useState('');
  const [preparationTime, setPreparationTime] = useState(30);
  const [recordingTime, setRecordingTime] = useState(90);
  const [promptQuestions, setPromptQuestions] = useState('');
  
  // Error handling states
  const [errors, setErrors] = useState({});
  const [isValidated, setIsValidated] = useState(false);

  // Parse existing content if available
  useEffect(() => {
    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        setTask(parsed.task || '');
        setInstructions(parsed.instructions || '');
        setPreparationTime(parsed.preparation_time || 30);
        setRecordingTime(parsed.recording_time || 90);
        setPromptQuestions(parsed.prompt_questions || '');
      } catch (error) {
        // If content is not JSON, treat as task
        setTask(content || '');
      }
    }
  }, [content]);

  // Validation function
  const validateData = useCallback(() => {
    const newErrors = {};
    
    // Check task
    if (!task.trim()) {
      newErrors.task = 'Yêu cầu bài nói không được để trống';
    }
    
    // Check instructions
    if (!instructions.trim()) {
      newErrors.instructions = 'Hướng dẫn không được để trống';
    }
    
    // Check times
    if (preparationTime < 10 || preparationTime > 120) {
      newErrors.preparationTime = 'Thời gian chuẩn bị nên từ 10-120 giây';
    }
    
    if (recordingTime < 30 || recordingTime > 300) {
      newErrors.recordingTime = 'Thời gian ghi âm nên từ 30-300 giây';
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setIsValidated(isValid);
    return isValid;
  }, [task, instructions, preparationTime, recordingTime]);

  // Auto-validate when data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (task.trim() || instructions.trim()) {
        validateData();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [task, instructions, preparationTime, recordingTime, validateData]);

  // Update parent component
  useEffect(() => {
    const questionData = {
      task: task.trim(),
      instructions: instructions.trim(),
      preparation_time: parseInt(preparationTime) || 30,
      recording_time: parseInt(recordingTime) || 90,
      prompt_questions: promptQuestions.trim(),
      level: 'A2',
      scale: '0-5'
    };
    
    if (onChange) {
      onChange(JSON.stringify(questionData));
    }
  }, [task, instructions, preparationTime, recordingTime, promptQuestions, onChange]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom color="primary">
        Speaking - Personal Introduction (Task 1)
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Hướng dẫn:</Typography>
        <Typography variant="body2">
          • Task 1: Personal introduction, A2 level<br/>
          • Chấm điểm: 0-5 scale bởi AI<br/>
          • Tập trung: Basic personal information, hobbies, family
        </Typography>
      </Alert>

      {/* Level and Scale Info */}
      <Box sx={{ mb: 3 }}>
        <Chip label="Level: A2" color="primary" variant="outlined" sx={{ mr: 1 }} />
        <Chip label="Scale: 0-5" color="secondary" variant="outlined" />
      </Box>

      {/* Task */}
      <TextField
        fullWidth
        label="Yêu cầu bài nói"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        multiline
        rows={4}
        error={!!errors.task}
        helperText={errors.task}
        sx={{ mb: 3 }}
        placeholder="Please tell me about yourself. You have 30 seconds to think about what you want to say and then you will have 1 minute 30 seconds to speak."
      />

      {/* Instructions */}
      <TextField
        fullWidth
        label="Hướng dẫn chi tiết"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        multiline
        rows={3}
        error={!!errors.instructions}
        helperText={errors.instructions}
        sx={{ mb: 3 }}
        placeholder="Please introduce yourself and talk about your background, interests, and goals."
      />

      {/* Prompt Questions */}
      <TextField
        fullWidth
        label="Câu hỏi gợi ý (tùy chọn)"
        value={promptQuestions}
        onChange={(e) => setPromptQuestions(e.target.value)}
        multiline
        rows={3}
        sx={{ mb: 3 }}
        placeholder="You could talk about:&#10;• Your name and where you're from&#10;• Your job or studies&#10;• Your hobbies and interests&#10;• Your future plans"
      />

      {/* Timing Settings */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Thời gian chuẩn bị (giây)"
            type="number"
            value={preparationTime}
            onChange={(e) => setPreparationTime(e.target.value)}
            error={!!errors.preparationTime}
            helperText={errors.preparationTime || 'Thời gian học viên suy nghĩ'}
            inputProps={{ min: 10, max: 120 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Thời gian ghi âm (giây)"
            type="number"
            value={recordingTime}
            onChange={(e) => setRecordingTime(e.target.value)}
            error={!!errors.recordingTime}
            helperText={errors.recordingTime || 'Thời gian học viên nói'}
            inputProps={{ min: 30, max: 300 }}
          />
        </Grid>
      </Grid>

      {/* Preview */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <RecordVoiceOver color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle2">Xem trước bài thi:</Typography>
        </Box>
        <Typography variant="body2" gutterBottom>
          <strong>Preparation Time:</strong> {preparationTime} seconds
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Speaking Time:</strong> {recordingTime} seconds
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Task:</strong> {task || 'Chưa có nội dung'}
        </Typography>
        {promptQuestions && (
          <Typography variant="body2">
            <strong>Prompt Questions:</strong> {promptQuestions}
          </Typography>
        )}
      </Paper>

      {/* Validation Status */}
      {isValidated && (
        <Alert severity="success" icon={<CheckCircle />}>
          Câu hỏi Speaking Personal Introduction hợp lệ!
        </Alert>
      )}

      {/* Show validation errors */}
      {Object.keys(errors).length > 0 && (
        <Alert severity="warning" icon={<Warning />} sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Cần hoàn thiện:</Typography>
          {Object.entries(errors).map(([field, message]) => (
            <Typography key={field} variant="body2">• {message}</Typography>
          ))}
        </Alert>
      )}
    </Box>
  );
}