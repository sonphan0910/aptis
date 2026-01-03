'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Typography,
  Paper,
  IconButton
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

export default function TrueFalseForm({ content, onChange }) {
  const [statements, setStatements] = useState(() => {
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content || '{}') : content;
      return parsed.statements || [{ text: '', answer: true }];
    } catch {
      return [{ text: '', answer: true }];
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

  const updateContent = (newPassage, newStatements) => {
    const questionData = {
      passage: newPassage,
      statements: newStatements
    };
    onChange(JSON.stringify(questionData));
  };

  const handlePassageChange = (value) => {
    setPassage(value);
    updateContent(value, statements);
  };

  const handleStatementChange = (index, field, value) => {
    const newStatements = [...statements];
    newStatements[index][field] = value;
    setStatements(newStatements);
    updateContent(passage, newStatements);
  };

  const addStatement = () => {
    const newStatements = [...statements, { text: '', answer: true }];
    setStatements(newStatements);
    updateContent(passage, newStatements);
  };

  const removeStatement = (index) => {
    if (statements.length > 1) {
      const newStatements = statements.filter((_, i) => i !== index);
      setStatements(newStatements);
      updateContent(passage, newStatements);
    }
  };

  return (
    <Box>
      {/* Reading Passage */}
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

      {/* True/False Statements */}
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Các câu Đúng/Sai ({statements.length} câu)
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addStatement}
            size="small"
          >
            Thêm câu
          </Button>
        </Box>

        {statements.map((statement, index) => (
          <Paper key={index} elevation={1} sx={{ p: 3, mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Câu {index + 1}
              </Typography>
              {statements.length > 1 && (
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => removeStatement(index)}
                >
                  <Delete />
                </IconButton>
              )}
            </Box>

            <TextField
              fullWidth
              label="Nội dung câu"
              value={statement.text}
              onChange={(e) => handleStatementChange(index, 'text', e.target.value)}
              placeholder="Nhập câu để học sinh đánh giá đúng/sai..."
              sx={{ mb: 2 }}
            />

            <FormControl component="fieldset">
              <FormLabel component="legend">Đáp án đúng</FormLabel>
              <RadioGroup
                row
                value={statement.answer}
                onChange={(e) => handleStatementChange(index, 'answer', e.target.value === 'true')}
              >
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label="Đúng (True)"
                />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label="Sai (False)"
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}