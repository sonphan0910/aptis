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

/**
 * GapFillingForm component for Reading and Listening Gap Filling questions
 * Based on seed data structure from 05-seed-questions.js
 */
export default function GapFillingForm({ content, onChange }) {
  const [passage, setPassage] = useState('');
  const [options, setOptions] = useState(['well', 'only', 'really', 'under', 'much', 'food']);
  const [correctAnswers, setCorrectAnswers] = useState(['well', 'only', 'really', 'under', 'much', 'food']);
  const [prompt, setPrompt] = useState('Choose one word from the list for each gap. The first one is done for you.');

  // Parse existing content if available
  useEffect(() => {
    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        setPassage(parsed.passage || '');
        setOptions(parsed.options || ['well', 'only', 'really', 'under', 'much', 'food']);
        setCorrectAnswers(parsed.correctAnswers || ['well', 'only', 'really', 'under', 'much', 'food']);
        setPrompt(parsed.prompt || 'Choose one word from the list for each gap. The first one is done for you.');
      } catch (error) {
        // If content is not JSON, treat as passage
        setPassage(content);
      }
    }
  }, [content]);

  // Update parent component when data changes
  useEffect(() => {
    const questionData = {
      passage,
      options,
      correctAnswers,
      prompt
    };
    
    const jsonString = JSON.stringify(questionData);
    if (jsonString !== content) {
      onChange(jsonString);
    }
  }, [passage, options, correctAnswers, prompt]);

  // Auto-detect gaps in passage
  const gapMatches = passage.match(/\[GAP\d+\]/g) || [];
  const gapCount = gapMatches.length;

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      
      // Update correct answers accordingly
      const newCorrectAnswers = correctAnswers.filter((_, i) => i !== index);
      setCorrectAnswers(newCorrectAnswers);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCorrectAnswerChange = (index, value) => {
    const newCorrectAnswers = [...correctAnswers];
    newCorrectAnswers[index] = value;
    setCorrectAnswers(newCorrectAnswers);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Gap Filling Question
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Tạo câu hỏi điền từ vào chỗ trống. Sử dụng [GAP1], [GAP2], [GAP3]... để đánh dấu chỗ trống.
      </Typography>

      {/* Prompt */}
      <TextField
        fullWidth
        label="Hướng dẫn"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Choose one word from the list for each gap. The first one is done for you."
        sx={{ mb: 3 }}
        helperText="Hướng dẫn cho học sinh về cách làm bài"
      />

      {/* Passage with gaps */}
      <TextField
        fullWidth
        label="Đoạn văn có chỗ trống"
        value={passage}
        onChange={(e) => setPassage(e.target.value)}
        multiline
        rows={6}
        sx={{ mb: 2 }}
        placeholder="Dear Sam,\n\nI hope you're doing [GAP1]! I wanted to tell you about my recent trip to the park. It was [GAP2] a lovely day to be outside..."
        helperText="Sử dụng [GAP1], [GAP2], [GAP3]... để đánh dấu chỗ trống"
      />

      {/* Gap count info */}
      {gapCount > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Đã phát hiện {gapCount} chỗ trống: {gapMatches.join(', ')}
          </Typography>
        </Alert>
      )}

      {/* Options list */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Danh sách từ để chọn ({options.length} từ)
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Danh sách các từ mà học sinh sẽ chọn để điền vào chỗ trống
        </Typography>
        
        {options.map((option, index) => (
          <Box key={index} display="flex" alignItems="center" gap={2} mb={1}>
            <Typography sx={{ minWidth: 30 }}>
              {index + 1}.
            </Typography>
            <TextField
              fullWidth
              placeholder={`Từ ${index + 1}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              size="small"
            />
            <IconButton
              color="error"
              onClick={() => removeOption(index)}
              size="small"
              disabled={options.length <= 2}
            >
              <Delete />
            </IconButton>
          </Box>
        ))}

        <Button
          startIcon={<Add />}
          onClick={addOption}
          variant="outlined"
          size="small"
        >
          Thêm từ
        </Button>
      </Box>

      {/* Correct answers */}
      {gapCount > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Đáp án đúng cho từng chỗ trống
          </Typography>
          
          {Array.from({ length: gapCount }, (_, index) => (
            <Box key={index} display="flex" alignItems="center" gap={2} mb={2}>
              <Typography sx={{ minWidth: 80 }}>
                [GAP{index + 1}]:
              </Typography>
              <TextField
                select
                value={correctAnswers[index] || ''}
                onChange={(e) => handleCorrectAnswerChange(index, e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
                SelectProps={{
                  native: true
                }}
              >
                <option value="">-- Chọn đáp án --</option>
                {options.map((option, optIndex) => (
                  <option key={optIndex} value={option}>
                    {option}
                  </option>
                ))}
              </TextField>
            </Box>
          ))}
        </Box>
      )}

      {/* Preview */}
      {passage && gapCount > 0 && (
        <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Xem trước
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Hướng dẫn:</strong> {prompt}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Danh sách từ:</strong> {options.filter(o => o.trim()).join(', ')}
          </Typography>
          
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {passage}
          </Typography>
        </Box>
      )}
    </Box>
  );
}