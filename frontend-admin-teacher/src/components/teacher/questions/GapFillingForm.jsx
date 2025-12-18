'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import { Add, Delete, Info } from '@mui/icons-material';

export default function GapFillingForm({ content = {}, onChange }) {
  const [text, setText] = useState(content.text || '');
  const [options, setOptions] = useState(content.options || ['', '', '', '']);
  const [correctAnswers, setCorrectAnswers] = useState(content.correct_answers || []);
  const [explanation, setExplanation] = useState(content.explanation || '');

  useEffect(() => {
    // Tự động tìm các chỗ trống trong văn bản
    const gapMatches = text.match(/\[\d+\]/g) || [];
    const gapNumbers = gapMatches.map(gap => parseInt(gap.match(/\d+/)[0]));
    
    // Cập nhật correctAnswers theo số chỗ trống
    const newCorrectAnswers = [...correctAnswers];
    gapNumbers.forEach(num => {
      if (!newCorrectAnswers[num - 1]) {
        newCorrectAnswers[num - 1] = '';
      }
    });
    
    if (JSON.stringify(newCorrectAnswers) !== JSON.stringify(correctAnswers)) {
      setCorrectAnswers(newCorrectAnswers);
    }

    onChange({
      text,
      options,
      correct_answers: correctAnswers,
      explanation
    });
  }, [text, options, correctAnswers, explanation]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleCorrectAnswerChange = (gapIndex, value) => {
    const newCorrectAnswers = [...correctAnswers];
    newCorrectAnswers[gapIndex] = value;
    setCorrectAnswers(newCorrectAnswers);
  };

  // Tính toán các chỗ trống từ văn bản
  const gapMatches = text.match(/\[\d+\]/g) || [];
  const gapNumbers = gapMatches.map(gap => parseInt(gap.match(/\d+/)[0]));
  const maxGapNumber = Math.max(...gapNumbers, 0);

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Sử dụng [1], [2], [3]... để đánh dấu chỗ trống trong văn bản
        </Typography>
      </Alert>

      <TextField
        fullWidth
        label="Văn bản có chỗ trống"
        value={text}
        onChange={(e) => setText(e.target.value)}
        multiline
        rows={4}
        sx={{ mb: 2 }}
        placeholder="Nhập văn bản của bạn và sử dụng [1], [2]... cho các chỗ trống"
        required
      />

      {gapNumbers.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Đã phát hiện {gapNumbers.length} chỗ trống:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
            {gapNumbers.map(num => (
              <Chip key={num} label={`[${num}]`} size="small" color="primary" variant="outlined" />
            ))}
          </Box>
        </Box>
      )}

      <Typography variant="subtitle1" gutterBottom>
        Các tuỳ chọn
      </Typography>
      
      {options.map((option, index) => (
        <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
          <Typography sx={{ minWidth: 30 }}>
            {String.fromCharCode(65 + index)}.
          </Typography>
          <TextField
            fullWidth
            placeholder={`Tuỳ chọn ${String.fromCharCode(65 + index)}`}
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            size="small"
          />
          {options.length > 2 && (
            <IconButton
              color="error"
              onClick={() => removeOption(index)}
              size="small"
            >
              <Delete />
            </IconButton>
          )}
        </Box>
      ))}

      <Button
        startIcon={<Add />}
        onClick={addOption}
        variant="outlined"
        sx={{ mb: 3 }}
        disabled={options.length >= 8}
      >
        Thêm tuỳ chọn
      </Button>

      {maxGapNumber > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Đáp án đúng
          </Typography>
          {Array.from({ length: maxGapNumber }, (_, i) => i + 1).map(gapNum => (
            <Box key={gapNum} display="flex" alignItems="center" gap={2} mb={1}>
              <Typography sx={{ minWidth: 60 }}>Chỗ [{gapNum}]:</Typography>
              <TextField
                placeholder="Nhập đáp án đúng"
                value={correctAnswers[gapNum - 1] || ''}
                onChange={(e) => handleCorrectAnswerChange(gapNum - 1, e.target.value)}
                size="small"
                sx={{ flexGrow: 1 }}
              />
            </Box>
          ))}
        </Box>
      )}

      <TextField
        fullWidth
        label="Giải thích"
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        multiline
        rows={3}
        placeholder="Giải thích về các đáp án đúng..."
      />
    </Box>
  );
}