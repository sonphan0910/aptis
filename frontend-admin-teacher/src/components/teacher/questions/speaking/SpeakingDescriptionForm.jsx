'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Typography,
  Alert,
  Chip,
  Grid,
  Paper,
  Button
} from '@mui/material';
import { CheckCircle, Warning, Image, RecordVoiceOver } from '@mui/icons-material';

/**
 * Speaking Description Form - Task 2 của Speaking skill
 * Dựa trên seed data: B1 level, 0-5 scale
 * Picture/topic description với thời gian chuẩn bị và ghi âm
 */
export default function SpeakingDescriptionForm({ content, onChange }) {
  const [task, setTask] = useState('');
  const [instructions, setInstructions] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  const [pictureDescription, setPictureDescription] = useState('');
  const [preparationTime, setPreparationTime] = useState(45);
  const [recordingTime, setRecordingTime] = useState(120);
  const [keyPoints, setKeyPoints] = useState('');
  
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
        setPictureUrl(parsed.picture_url || '');
        setPictureDescription(parsed.picture_description || '');
        setPreparationTime(parsed.preparation_time || 45);
        setRecordingTime(parsed.recording_time || 120);
        setKeyPoints(parsed.key_points || '');
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
    
    // Check if either picture URL or description is provided
    if (!pictureUrl.trim() && !pictureDescription.trim()) {
      newErrors.picture = 'Phải có URL hình ảnh hoặc mô tả hình ảnh';
    }
    
    // Check times
    if (preparationTime < 15 || preparationTime > 120) {
      newErrors.preparationTime = 'Thời gian chuẩn bị nên từ 15-120 giây';
    }
    
    if (recordingTime < 60 || recordingTime > 300) {
      newErrors.recordingTime = 'Thời gian ghi âm nên từ 60-300 giây';
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setIsValidated(isValid);
    return isValid;
  }, [task, instructions, pictureUrl, pictureDescription, preparationTime, recordingTime]);

  // Auto-validate when data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (task.trim() || instructions.trim() || pictureUrl.trim() || pictureDescription.trim()) {
        validateData();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [task, instructions, pictureUrl, pictureDescription, preparationTime, recordingTime, validateData]);

  // Update parent component
  useEffect(() => {
    const questionData = {
      task: task.trim(),
      instructions: instructions.trim(),
      picture_url: pictureUrl.trim(),
      picture_description: pictureDescription.trim(),
      preparation_time: parseInt(preparationTime) || 45,
      recording_time: parseInt(recordingTime) || 120,
      key_points: keyPoints.trim(),
      level: 'B1',
      scale: '0-5'
    };
    
    if (onChange) {
      onChange(JSON.stringify(questionData));
    }
  }, [task, instructions, pictureUrl, pictureDescription, preparationTime, recordingTime, keyPoints, onChange]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom color="primary">
        Speaking - Picture Description (Task 2)
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Hướng dẫn:</Typography>
        <Typography variant="body2">
          • Task 2: Picture/topic description, B1 level<br/>
          • Chấm điểm: 0-5 scale bởi AI<br/>
          • Tập trung: Detailed description, coherent structure
        </Typography>
      </Alert>

      {/* Level and Scale Info */}
      <Box sx={{ mb: 3 }}>
        <Chip label="Level: B1" color="primary" variant="outlined" sx={{ mr: 1 }} />
        <Chip label="Scale: 0-5" color="secondary" variant="outlined" />
      </Box>

      {/* Task */}
      <TextField
        fullWidth
        label="Yêu cầu bài nói"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        multiline
        rows={3}
        error={!!errors.task}
        helperText={errors.task}
        sx={{ mb: 3 }}
        placeholder="Look at the picture and describe what you can see. You have 45 seconds to think about what you want to say and then you will have 2 minutes to speak."
      />

      {/* Instructions */}
      <TextField
        fullWidth
        label="Hướng dẫn chi tiết"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        multiline
        rows={2}
        error={!!errors.instructions}
        helperText={errors.instructions}
        sx={{ mb: 3 }}
        placeholder="Describe the picture in detail. Talk about what you can see, where it might be, and what might be happening."
      />

      {/* Picture Information */}
      <Typography variant="subtitle1" gutterBottom>
        Hình ảnh:
      </Typography>
      
      <TextField
        fullWidth
        label="URL hình ảnh"
        value={pictureUrl}
        onChange={(e) => setPictureUrl(e.target.value)}
        sx={{ mb: 2 }}
        placeholder="https://example.com/image.jpg"
        error={!!errors.picture}
      />
      
      <TextField
        fullWidth
        label="Mô tả hình ảnh (nếu không có URL)"
        value={pictureDescription}
        onChange={(e) => setPictureDescription(e.target.value)}
        multiline
        rows={3}
        sx={{ mb: 3 }}
        placeholder="Mô tả chi tiết hình ảnh để giáo viên có thể hiển thị hoặc vẽ cho học viên"
        error={!!errors.picture}
        helperText={errors.picture}
      />

      {/* Key Points */}
      <TextField
        fullWidth
        label="Điểm chính cần mô tả (gợi ý cho giáo viên)"
        value={keyPoints}
        onChange={(e) => setKeyPoints(e.target.value)}
        multiline
        rows={3}
        sx={{ mb: 3 }}
        placeholder="• Objects in the picture&#10;• People and their activities&#10;• Setting/location&#10;• Colors, weather, mood"
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
            helperText={errors.preparationTime || 'Thời gian học viên quan sát và suy nghĩ'}
            inputProps={{ min: 15, max: 120 }}
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
            helperText={errors.recordingTime || 'Thời gian học viên mô tả'}
            inputProps={{ min: 60, max: 300 }}
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
        {pictureUrl && (
          <Box display="flex" alignItems="center" mt={1}>
            <Image sx={{ mr: 1 }} />
            <Typography variant="body2">Picture URL: {pictureUrl}</Typography>
          </Box>
        )}
        {pictureDescription && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Picture Description:</strong> {pictureDescription}
          </Typography>
        )}
      </Paper>

      {/* Validation Status */}
      {isValidated && (
        <Alert severity="success" icon={<CheckCircle />}>
          Câu hỏi Speaking Description hợp lệ!
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