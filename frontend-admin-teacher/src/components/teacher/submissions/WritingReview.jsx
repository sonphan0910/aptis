'use client';

import { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Rating,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save,
  Edit,
  Undo,
  Redo,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  HighlightAlt,
  Comment,
  Spellcheck
} from '@mui/icons-material';

const criteriaLevels = [
  { level: 0, label: 'Không đạt', color: 'error' },
  { level: 1, label: 'Yếu', color: 'warning' },
  { level: 2, label: 'Trung bình', color: 'info' },
  { level: 3, label: 'Khá', color: 'primary' },
  { level: 4, label: 'Giỏi', color: 'success' },
  { level: 5, label: 'Xuất sắc', color: 'success' }
];

const aspectOptions = [
  'Nội dung và ý tưởng',
  'Tổ chức và cấu trúc',
  'Từ vựng',
  'Ngữ pháp',
  'Cơ học viết (chính tả, dấu câu)',
  'Phong cách và giọng điệu'
];

export default function WritingReview({ 
  submission,
  criteria,
  onScoreChange,
  onFeedbackChange,
  onSave,
  readonly = false 
}) {
  const [scores, setScores] = useState(submission?.scores || {});
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [highlights, setHighlights] = useState(submission?.highlights || []);
  const [selectedAspect, setSelectedAspect] = useState('');
  const textRef = useRef();

  const handleScoreChange = (aspect, score) => {
    const newScores = { ...scores, [aspect]: score };
    setScores(newScores);
    onScoreChange?.(newScores);
  };

  const handleFeedbackChange = (event) => {
    const newFeedback = event.target.value;
    setFeedback(newFeedback);
    onFeedbackChange?.(newFeedback);
  };

  const addHighlight = (selectedText, type = 'error') => {
    if (!selectedText || readonly) return;
    
    const newHighlight = {
      id: Date.now(),
      text: selectedText,
      type,
      aspect: selectedAspect,
      comment: '',
      position: { start: 0, end: selectedText.length }
    };
    
    setHighlights([...highlights, newHighlight]);
  };

  const removeHighlight = (highlightId) => {
    setHighlights(highlights.filter(h => h.id !== highlightId));
  };

  const calculateTotalScore = () => {
    const scoreValues = Object.values(scores);
    if (scoreValues.length === 0) return 0;
    return scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'success';
    if (score >= 3.5) return 'primary';
    if (score >= 2.5) return 'info';
    if (score >= 1.5) return 'warning';
    return 'error';
  };

  const totalScore = calculateTotalScore();
  const progress = (totalScore / 5) * 100;

  return (
    <Box>
      {/* Header with overall score */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">
            Chấm điểm bài Writing
          </Typography>
          <Box textAlign="center">
            <Typography variant="h4" color={getScoreColor(totalScore)}>
              {totalScore.toFixed(1)}/5.0
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              color={getScoreColor(totalScore)}
              sx={{ width: 100, height: 8, borderRadius: 4 }}
            />
          </Box>
        </Box>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          Vui lòng đánh giá từng khía cạnh của bài viết và cung cấp phản hồi chi tiết để giúp học sinh cải thiện.
        </Alert>
      </Paper>

      <Box display="flex" gap={3}>
        {/* Student's Writing */}
        <Paper sx={{ flex: 1, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Bài viết của học sinh
          </Typography>
          
          {!readonly && (
            <Box mb={2}>
              <FormControl size="small" sx={{ mr: 2, minWidth: 200 }}>
                <InputLabel>Khía cạnh đánh giá</InputLabel>
                <Select
                  value={selectedAspect}
                  label="Khía cạnh đánh giá"
                  onChange={(e) => setSelectedAspect(e.target.value)}
                >
                  {aspectOptions.map((aspect) => (
                    <MenuItem key={aspect} value={aspect}>
                      {aspect}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Tooltip title="Bôi đen văn bản và nhấn để đánh dấu lỗi">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<HighlightAlt />}
                  onClick={() => {
                    const selection = window.getSelection();
                    if (selection.toString()) {
                      addHighlight(selection.toString(), 'error');
                    }
                  }}
                  disabled={!selectedAspect}
                >
                  Đánh dấu lỗi
                </Button>
              </Tooltip>
            </Box>
          )}

          <Box
            ref={textRef}
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              minHeight: 300,
              bgcolor: 'grey.50',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              userSelect: readonly ? 'none' : 'text'
            }}
          >
            {submission?.content || 'Không có nội dung bài viết'}
          </Box>

          {highlights.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Các lỗi đã đánh dấu:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {highlights.map((highlight) => (
                  <Chip
                    key={highlight.id}
                    label={`${highlight.aspect}: ${highlight.text.substring(0, 20)}...`}
                    color="warning"
                    size="small"
                    onDelete={readonly ? undefined : () => removeHighlight(highlight.id)}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>

        {/* Scoring Panel */}
        <Paper sx={{ width: 400, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Bảng điểm chi tiết
          </Typography>

          <Box mb={3}>
            {aspectOptions.map((aspect) => (
              <Box key={aspect} mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  {aspect}
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Rating
                    value={scores[aspect] || 0}
                    onChange={(e, value) => handleScoreChange(aspect, value)}
                    max={5}
                    precision={0.5}
                    readOnly={readonly}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {scores[aspect] ? `${scores[aspect]}/5` : '0/5'}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Phản hồi chi tiết
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={8}
            value={feedback}
            onChange={handleFeedbackChange}
            placeholder="Nhập phản hồi chi tiết cho học sinh về các điểm mạnh, điểm cần cải thiện và gợi ý..."
            variant="outlined"
            InputProps={{
              readOnly: readonly
            }}
          />

          {!readonly && (
            <Box mt={3} display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => onSave?.({ scores, feedback, highlights })}
                fullWidth
              >
                Lưu điểm và phản hồi
              </Button>
            </Box>
          )}

          <Box mt={2}>
            <Typography variant="caption" color="text.secondary">
              Thời gian làm bài: {submission?.duration || 'N/A'} phút
              <br />
              Số từ: {submission?.word_count || 'N/A'}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}