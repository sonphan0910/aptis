'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Divider
} from '@mui/material';
import { Add, Delete, CheckCircle, Warning, Upload, AudioFile } from '@mui/icons-material';
import { questionApi } from '../../../../services/questionService';

/**
 * Listening MCQ Multiple Questions Form - Part 4 của Listening skill
 * Nhiều câu hỏi liên quan đến cùng một đoạn audio
 */
export default function ListeningMCQMultiForm({ content, onChange, onAudioFilesChange, isEdit = false }) {
  const [title, setTitle] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(''); // For local file preview
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', ''], correctAnswer: 0 }
  ]);
  const [instructions, setInstructions] = useState('Listen carefully to the audio and answer all questions.');

  // Error handling states
  const [errors, setErrors] = useState({});
  const [isValidated, setIsValidated] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Cleanup preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    };
  }, [audioPreviewUrl]);

  // Audio file selection function
  const handleAudioFileSelect = (file) => {
    if (!file) return;

    setAudioFile(file);

    // Create preview URL for local playback
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl); // Clean up old URL
    }
    const previewUrl = URL.createObjectURL(file);
    setAudioPreviewUrl(previewUrl);

    // Pass file to parent QuestionForm via callback (clean approach)
    if (onAudioFilesChange) {
      onAudioFilesChange({
        mainAudio: file,
        speakerAudios: []
      });
    }

    console.log('✅ Audio file selected:', file.name);

    // Clear error immediately
    if (errors.audio) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.audio;
        return newErrors;
      });
    }
  };

  const validateData = useCallback(() => {
    const newErrors = {};

    // Check title
    if (!title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    }

    // Check audio file - allow either audioUrl OR audioFile
    if (!audioUrl && !audioFile) {
      newErrors.audio = 'Vui lòng chọn file audio';
    }

    // Check questions
    const validQuestions = questions.filter(q => {
      const hasQuestion = q.question.trim();
      const hasOptions = q.options.filter(opt => opt.trim()).length >= 2;
      const hasValidAnswer = q.correctAnswer >= 0 && q.correctAnswer < q.options.length && q.options[q.correctAnswer].trim();
      return hasQuestion && hasOptions && hasValidAnswer;
    });

    if (validQuestions.length === 0) {
      newErrors.questions = 'Phải có ít nhất 1 câu hỏi hợp lệ';
    }

    // Check individual questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.question.trim()) { // Only validate if question has content
        const validOptions = q.options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          newErrors.questions = `Câu ${i + 1}: Phải có ít nhất 2 lựa chọn`;
          break;
        }
        if (q.correctAnswer >= q.options.length || !q.options[q.correctAnswer].trim()) {
          newErrors.questions = `Câu ${i + 1}: Đáp án đúng không hợp lệ`;
          break;
        }
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setIsValidated(isValid);

    // Send data to parent when valid
    if (isValid && onChange) {
      const questionsToSend = questions.filter(q => q.question.trim());

      // Prepare data for backend helper function
      const structuredData = {
        questions: questionsToSend.map(q => ({
          question: q.question.trim(),
          options: q.options.filter(opt => opt.trim()).map(opt => ({ text: opt, correct: false })), // Multiple choice format
          correctAnswer: q.correctAnswer
        })),
        isMultiple: true, // Multiple choice MCQ
        audioUrl: audioUrl,
        audioFile: audioFile, // Include File object for upload
        instructions: instructions.trim(),
        title: title.trim()
      };

      // Send content as JSON string for backend auto-generation
      // Also send audioFile separately (similar to SpeakingImageBasedForm)
      onChange(JSON.stringify(structuredData));
    }

    return isValid;
  }, [title, audioUrl, audioFile, questions, instructions, onChange]);

  // Handle question changes
  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  // Handle option changes
  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };

  // Handle adding new question
  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', ''], correctAnswer: 0 }]);
  };

  // Handle removing question
  const handleRemoveQuestion = (index) => {
    if (questions.length <= 1) return; // Minimum 1 question required
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  // Handle adding option to a question
  const handleAddOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push('');
    setQuestions(newQuestions);
  };

  // Handle removing option from a question
  const handleRemoveOption = (qIndex, optIndex) => {
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];

    if (question.options.length <= 2) return; // Minimum 2 options required

    // Remove the option
    question.options = question.options.filter((_, i) => i !== optIndex);

    // Adjust correct answer if necessary
    if (question.correctAnswer === optIndex) {
      question.correctAnswer = 0; // Reset to first option
    } else if (question.correctAnswer > optIndex) {
      question.correctAnswer -= 1; // Adjust index
    }

    setQuestions(newQuestions);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Listening MCQ - Multiple Questions
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Tạo nhiều câu hỏi Listening liên quan đến cùng một đoạn audio
      </Typography>

      {/* Title */}
      <TextField
        label="Tiêu đề câu hỏi"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        margin="normal"
        error={!!errors.title}
        helperText={errors.title}
      />

      {/* Audio Upload */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          File Audio
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            component="label"
            startIcon={isUploading ? <Upload /> : <AudioFile />}
            disabled={isUploading}
          >
            {isUploading ? 'Đang tải lên...' : 'Chọn file audio'}
            <input
              type="file"
              hidden
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setAudioFile(file);
                  handleAudioFileSelect(file);
                }
              }}
            />
          </Button>

          {audioFile && (
            <Typography variant="body2" color="text.secondary">
              {audioFile.name}
            </Typography>
          )}
        </Box>

        {/* Audio Preview - for newly selected file */}
        {audioPreviewUrl && (
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              🎧 Nghe thử audio đã chọn:
            </Typography>
            <audio controls style={{ width: '100%', maxWidth: 400 }}>
              <source src={audioPreviewUrl} />
              Your browser does not support the audio element.
            </audio>
          </Box>
        )}

        {/* Existing audio URL (for edit mode) */}
        {audioUrl && !audioPreviewUrl && (
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Audio hiện tại:
            </Typography>
            <audio controls style={{ width: '100%', maxWidth: 400 }}>
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </Box>
        )}

        {errors.audio && (
          <Typography variant="caption" color="error" display="block" mt={1}>
            {errors.audio}
          </Typography>
        )}
      </Paper>

      {/* Questions */}
      <Typography variant="subtitle1" gutterBottom>
        Câu hỏi:
      </Typography>

      {questions.map((q, qIndex) => (
        <Paper key={qIndex} elevation={1} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="subtitle2">
              Câu hỏi {qIndex + 1}
            </Typography>
            <IconButton
              onClick={() => handleRemoveQuestion(qIndex)}
              disabled={questions.length <= 1}
              color="error"
              size="small"
            >
              <Delete />
            </IconButton>
          </Box>

          {/* Question text */}
          <TextField
            label="Nội dung câu hỏi"
            value={q.question}
            onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
            fullWidth
            multiline
            rows={2}
            margin="normal"
            size="small"
          />

          {/* Options */}
          <Typography variant="body2" color="text.secondary" mt={2} mb={1}>
            Lựa chọn:
          </Typography>

          {q.options.map((option, optIndex) => (
            <Box key={optIndex} display="flex" alignItems="center" mb={1}>
              <TextField
                label={`${String.fromCharCode(65 + optIndex)}`}
                value={option}
                onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                sx={{ flexGrow: 1, mr: 1 }}
                size="small"
              />
              <IconButton
                onClick={() => handleRemoveOption(qIndex, optIndex)}
                disabled={q.options.length <= 2}
                color="error"
                size="small"
              >
                <Delete />
              </IconButton>
            </Box>
          ))}

          <Button
            onClick={() => handleAddOption(qIndex)}
            startIcon={<Add />}
            variant="text"
            size="small"
            sx={{ mb: 2 }}
          >
            Thêm lựa chọn
          </Button>

          {/* Correct Answer */}
          <FormControl fullWidth size="small">
            <InputLabel>Đáp án đúng</InputLabel>
            <Select
              value={q.correctAnswer}
              onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
              label="Đáp án đúng"
            >
              {q.options.map((option, index) => (
                <MenuItem key={index} value={index} disabled={!option.trim()}>
                  {String.fromCharCode(65 + index)}: {option.trim() || '(Trống)'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      ))}

      <Button
        onClick={handleAddQuestion}
        startIcon={<Add />}
        variant="outlined"
        sx={{ mb: 3 }}
      >
        Thêm câu hỏi
      </Button>

      {/* Instructions */}
      <TextField
        label="Hướng dẫn"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        fullWidth
        multiline
        rows={2}
        margin="normal"
      />

      {/* Manual Validation Button */}
      <Button
        onClick={validateData}
        variant="contained"
        color="info"
        size="small"
        sx={{ mb: 3, ml: 1 }}
        disabled={isUploading}
        startIcon={isUploading ? <Upload /> : <CheckCircle />}
      >
        {isUploading ? 'Đang tải audio...' : 'Kiểm tra câu hỏi'}
      </Button>

      {/* Validation Status */}
      {isValidated && (
        <Alert severity="success" icon={<CheckCircle />}>
          Câu hỏi Listening MCQ Multi hợp lệ!
        </Alert>
      )}

      {/* Show validation errors */}
      {Object.keys(errors).length > 0 && (
        <Alert severity="error" icon={<Warning />} sx={{ mt: 2 }}>
          <Typography variant="body2">
            Vui lòng sửa các lỗi sau:
          </Typography>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
    </Box>
  );
}