'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
} from '@mui/material';

export default function GapFillingQuestion({ question, onAnswerChange }) {
  const [answers, setAnswers] = useState([]);

  // Initialize answers array from existing answer data
  useEffect(() => {
    console.log('[GapFillingQuestion] useEffect triggered:', {
      questionId: question.id,
      hasAnswerData: !!question.answer_data,
      gapAnswers: question.answer_data?.gap_answers,
      hasItems: !!question.items
    });

    if (question.answer_data?.gap_answers) {
      // If answer_data exists (previously saved), use it
      if (Array.isArray(question.answer_data.gap_answers)) {
        console.log('[GapFillingQuestion] Loading saved answers:', question.answer_data.gap_answers);
        setAnswers(question.answer_data.gap_answers);
      }
    } else if (question.items) {
      // Initialize empty answers array based on number of items
      console.log('[GapFillingQuestion] Initializing empty answers for', question.items.length, 'items');
      setAnswers(new Array(question.items.length).fill(''));
    }
  }, [question.id, question.answer_data?.gap_answers, question.items?.length]); // Track specific values

  const handleGapChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    
    // Pass answers array to parent - this will be formatted correctly for backend
    onAnswerChange({ gap_answers: newAnswers });
  };

  if (!question.items || question.items.length === 0) {
    return (
      <Box>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
          {question.content}
        </Typography>
        <Typography color="error">
          Không tìm thấy các câu hỏi con (items) cho câu hỏi này.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Display each gap item */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {question.items.map((item, index) => (
          <Paper 
            key={item.id || index} 
            elevation={1}
            sx={{ p: 2, backgroundColor: '#f5f5f5' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography 
                variant="body1" 
                sx={{ flex: 1, fontWeight: 500 }}
              >
                {index + 1}. {item.item_text}
              </Typography>
              <TextField
                size="small"
                value={answers[index] || ''}
                onChange={(e) => handleGapChange(index, e.target.value)}
                placeholder="Nhập câu trả lời..."
                sx={{
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                  }
                }}
              />
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Show options if available */}
      {question.options && question.options.length > 0 && (
        <Box mt={3} sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Từ gợi ý:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {question.options.map((option, index) => (
              <Typography
                key={option.id || index}
                sx={{
                  px: 2,
                  py: 0.5,
                  backgroundColor: 'white',
                  border: '1px solid #90caf9',
                  borderRadius: 1,
                  fontSize: '0.9rem',
                }}
              >
                {option.option_text || option}
              </Typography>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}