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

export default function MCQForm({ content = {}, onChange }) {
  const [question, setQuestion] = useState(content.question || '');
  const [options, setOptions] = useState(content.options || [
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' }
  ]);
  const [correctAnswer, setCorrectAnswer] = useState(content.correct_answer || '');
  const [explanation, setExplanation] = useState(content.explanation || '');

  useEffect(() => {
    onChange({
      question,
      options,
      correct_answer: correctAnswer,
      explanation
    });
  }, [question, options, correctAnswer, explanation]);

  const handleOptionChange = (index, text) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const addOption = () => {
    const nextLetter = String.fromCharCode(65 + options.length);
    setOptions([...options, { id: nextLetter, text: '' }]);
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
      
      // Nếu đáp án đúng bị xóa, reset
      if (correctAnswer === options[index].id) {
        setCorrectAnswer('');
      }
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        label="Câu hỏi"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        multiline
        rows={3}
        sx={{ mb: 3 }}
        required
      />

      <Typography variant="subtitle1" gutterBottom>
        Tuỳ chọn
      </Typography>
      
      <RadioGroup
        value={correctAnswer}
        onChange={(e) => setCorrectAnswer(e.target.value)}
      >
        {options.map((option, index) => (
          <Box key={option.id} display="flex" alignItems="center" gap={1} mb={1}>
            <FormControlLabel
              value={option.id}
              control={<Radio />}
              label={`${option.id}.`}
              sx={{ minWidth: 60 }}
            />
            <TextField
              fullWidth
              placeholder={`Tuỳ chọn ${option.id}`}
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
      </RadioGroup>

      <Button
        startIcon={<Add />}
        onClick={addOption}
        variant="outlined"
        sx={{ mb: 3 }}
        disabled={options.length >= 6}
      >
        Thêm tuỳ chọn
      </Button>

      <TextField
        fullWidth
        label="Giải thích đáp án"
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        multiline
        rows={3}
        placeholder="Giải thích tại sao đáp án này là đúng..."
      />
    </Box>
  );
}