'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
} from '@mui/material';

export default function WritingFormFillingQuestion({ question, onAnswerChange }) {
  const [answer, setAnswer] = useState('');
  const [wordCount, setWordCount] = useState(0);

  // Parse question content
  const questionData = React.useMemo(() => {
    if (!question.content) return { title: "Form Filling", question: "Please fill in the form." };

    try {
      // 1. Try to parse as JSON first
      if (typeof question.content === 'string' && (question.content.trim().startsWith('{') || question.content.trim().startsWith('['))) {
        const parsed = JSON.parse(question.content);

        // Handle common JSON structures
        const title = parsed.title || parsed.instructions || "Form Filling Task";
        const questionText = parsed.question || parsed.content || parsed.prompt || "";

        return {
          title,
          question: questionText || "Please provide your answer:"
        };
      }

      // 2. If it's already an object
      if (typeof question.content === 'object' && question.content !== null) {
        return {
          title: question.content.title || question.content.instructions || "Form Filling Task",
          question: question.content.question || question.content.content || "Please provide your answer:"
        };
      }

      // 3. Fallback: Parse as plain text
      const lines = question.content.split('\n').filter(line => line.trim());
      const title = lines[0] || "Form Filling Task";

      return {
        title,
        question: question.content
      };
    } catch (error) {
      console.warn('[WritingFormFillingQuestion] Content parsing failed:', error);
      return {
        title: "Form Filling Task",
        question: typeof question.content === 'string' ? question.content : "Please provide your answer:"
      };
    }
  }, [question.content]);

  // Initialize answer from question.answer_data
  useEffect(() => {
    if (question.answer_data?.text_answer) {
      setAnswer(question.answer_data.text_answer);
    } else if (question.answer_data?.answer_json) {
      try {
        const parsed = JSON.parse(question.answer_data.answer_json);
        setAnswer(parsed.text || '');
      } catch (error) {
        setAnswer('');
      }
    } else {
      setAnswer('');
    }
  }, [question.id, question.answer_data]);

  useEffect(() => {
    // Count words
    const words = answer.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [answer]);

  const handleAnswerChange = (event) => {
    const newText = event.target.value;
    setAnswer(newText);

    onAnswerChange({
      answer_type: 'text',
      text_answer: newText
    });
  };

  if (!questionData) {
    return <Box sx={{ p: 2 }}><Typography color="error">Không thể tải câu hỏi</Typography></Box>;
  }

  const questionText = String(questionData.question || '');

  return (
    <Box sx={{ maxHeight: '100vh', overflow: 'auto', p: 2 }}>
      {/* Question Content */}
      <Box sx={{ mb: 3 }}>
        {questionText.split('\n').map((line, index) => {
          if (line.trim() === '') return null;

          return (
            <Typography
              key={index}
              variant="body1"
              sx={{ mb: 1, whiteSpace: 'pre-line', fontWeight: 500 }}
            >
              {line}
            </Typography>
          );
        })}
      </Box>

      <TextField
        multiline
        fullWidth
        rows={4}
        value={answer}
        onChange={handleAnswerChange}
        variant="outlined"
        helperText={`${wordCount} words`}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: '1rem',
            lineHeight: 1.6,
            backgroundColor: 'white'
          }
        }}
      />
    </Box>
  );
}