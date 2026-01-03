'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Typography,
  IconButton
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

export default function MCQForm({ content, onChange, skillType, questionType }) {
  const [questionText, setQuestionText] = useState(() => {
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content || '{}') : content;
      return parsed.question || '';
    } catch {
      return '';
    }
  });
  
  const [passage, setPassage] = useState(() => {
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content || '{}') : content;
      return parsed.passage || '';
    } catch {
      return '';
    }
  });

  const [options, setOptions] = useState(() => {
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content || '{}') : content;
      return parsed.options || [
        { id: 'A', text: '', isCorrect: false },
        { id: 'B', text: '', isCorrect: false },
        { id: 'C', text: '', isCorrect: false },
        { id: 'D', text: '', isCorrect: false }
      ];
    } catch {
      return [
        { id: 'A', text: '', isCorrect: false },
        { id: 'B', text: '', isCorrect: false },
        { id: 'C', text: '', isCorrect: false },
        { id: 'D', text: '', isCorrect: false }
      ];
    }
  });

  const [explanation, setExplanation] = useState(() => {
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content || '{}') : content;
      return parsed.explanation || '';
    } catch {
      return '';
    }
  });

  const updateContent = (newQuestion, newPassage, newOptions, newExplanation) => {
    const questionData = {
      ...(newPassage && { passage: newPassage }),
      question: newQuestion,
      options: newOptions,
      explanation: newExplanation
    };
    onChange(JSON.stringify(questionData));
  };

  const handleQuestionChange = (value) => {
    setQuestionText(value);
    updateContent(value, passage, options, explanation);
  };

  const handlePassageChange = (value) => {
    setPassage(value);
    updateContent(questionText, value, options, explanation);
  };

  const handleOptionChange = (index, text) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
    updateContent(questionText, passage, newOptions, explanation);
  };

  const handleCorrectAnswerChange = (optionId) => {
    const newOptions = options.map(option => ({
      ...option,
      isCorrect: option.id === optionId
    }));
    setOptions(newOptions);
    updateContent(questionText, passage, newOptions, explanation);
  };

  const handleExplanationChange = (value) => {
    setExplanation(value);
    updateContent(questionText, passage, options, value);
  };

  const addOption = () => {
    const nextLetter = String.fromCharCode(65 + options.length);
    const newOptions = [...options, { id: nextLetter, text: '', isCorrect: false }];
    setOptions(newOptions);
    updateContent(questionText, passage, newOptions, explanation);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      // Cập nhật lại ID cho các tuỳ chọn
      const updatedOptions = newOptions.map((option, i) => ({
        ...option,
        id: String.fromCharCode(65 + i)
      }));
      setOptions(updatedOptions);
      updateContent(questionText, passage, updatedOptions, explanation);
    }
  };

  const needsPassage = skillType === 'READING';
  const correctAnswer = options.find(opt => opt.isCorrect)?.id || '';

  return (
    <Box>
      {/* Reading Passage (only for reading questions) */}
      {needsPassage && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Đoạn văn đọc
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Nhập đoạn văn"
            value={passage}
            onChange={(e) => handlePassageChange(e.target.value)}
            placeholder="Nhập đoạn văn cho học sinh đọc..."
          />
        </Box>
      )}

      {/* Question */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Câu hỏi
        </Typography>
        <TextField
          fullWidth
          label="Nội dung câu hỏi"
          value={questionText}
          onChange={(e) => handleQuestionChange(e.target.value)}
          multiline
          rows={3}
          placeholder={needsPassage ? "Theo đoạn văn trên, ..." : "Hoàn thành câu sau: She ___ to work every day."}
        />
      </Box>

      {/* Options */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Các lựa chọn ({options.length} đáp án)
          </Typography>
          {options.length < 6 && (
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={addOption}
              size="small"
            >
              Thêm lựa chọn
            </Button>
          )}
        </Box>

        {options.map((option, index) => (
          <Box key={option.id} display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="body1" sx={{ minWidth: 24, textAlign: 'center', fontWeight: 'bold' }}>
              {option.id}.
            </Typography>
            
            <TextField
              fullWidth
              label={`Lựa chọn ${option.id}`}
              value={option.text}
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
      </Box>

      {/* Correct Answer */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Đáp án đúng
        </Typography>
        <RadioGroup
          value={correctAnswer}
          onChange={(e) => handleCorrectAnswerChange(e.target.value)}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option.id}
              value={option.id}
              control={<Radio />}
              label={`${option.id}. ${option.text || '(Chưa nhập)'}`}
              disabled={!option.text.trim()}
            />
          ))}
        </RadioGroup>
      </Box>

      {/* Explanation */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Giải thích (Tùy chọn)
        </Typography>
        <TextField
          fullWidth
          label="Giải thích đáp án"
          value={explanation}
          onChange={(e) => handleExplanationChange(e.target.value)}
          multiline
          rows={3}
          placeholder="Giải thích tại sao đáp án này đúng..."
        />
      </Box>
    </Box>
  );
}