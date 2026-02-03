'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
} from '@mui/material';

export default function WritingShortAnswerQuestion({ question, onAnswerChange }) {
  const [answers, setAnswers] = useState({});

  // Initialize answers from question.answer_data
  useEffect(() => {
    if (question.answer_data && typeof question.answer_data === 'object') {
      if (question.answer_data.text_answer) {
        try {
          // Parse formatted text like "Answer 1: text\n\nAnswer 2: text"
          const textAnswer = question.answer_data.text_answer;
          const parsedAnswers = {};

          // Split by double newlines and parse each answer
          const answerParts = textAnswer.split('\n\n');
          answerParts.forEach(part => {
            const match = part.match(/^Answer (\d+):\s*(.*)$/s);
            if (match) {
              const [, index, text] = match;
              parsedAnswers[index] = text;
            }
          });

          setAnswers(parsedAnswers);
        } catch (error) {
          console.error('[WritingShortAnswerQuestion] Failed to parse text_answer:', error);
          setAnswers({});
        }
      } else {
        setAnswers({});
      }
    } else {
      setAnswers({});
    }
  }, [question.id, question.answer_data]);

  const handleAnswerChange = (messageIndex, value) => {
    const newAnswers = {
      ...answers,
      [messageIndex + 1]: value  // Convert 0-based index to 1-based string key
    };

    setAnswers(newAnswers);

    // Convert to formatted text for consistent storage
    const formattedText = Object.entries(newAnswers)
      .map(([key, value]) => `Answer ${key}: ${value}`)
      .join('\n\n');

    // Send update to parent
    onAnswerChange({
      answer_type: 'text',
      text_answer: formattedText
    });
  };

  // Parse question content
  const questionData = React.useMemo(() => {
    if (!question.content) return { title: "Short Answer", messages: ["Please provide your answer:"] };

    try {
      // 1. Try to parse as JSON first
      if (typeof question.content === 'string' && (question.content.trim().startsWith('{') || question.content.trim().startsWith('['))) {
        const parsed = JSON.parse(question.content);

        let messages = [];
        if (Array.isArray(parsed.messages)) messages = parsed.messages;
        else if (Array.isArray(parsed.questions)) messages = parsed.questions;
        else if (typeof parsed.content === 'string') messages = parsed.content.split('\n').filter(l => l.trim());
        else if (typeof parsed.prompt === 'string') messages = [parsed.prompt];
        else if (typeof parsed.task === 'string') messages = [parsed.task];

        return {
          title: parsed.title || parsed.instructions || "Short Answer Questions",
          messages: messages.length > 0 ? messages : ["Please provide your answer:"]
        };
      }

      // 2. If it's already an object
      if (typeof question.content === 'object' && question.content !== null) {
        const obj = question.content;
        let messages = [];
        if (Array.isArray(obj.messages)) messages = obj.messages;
        else if (Array.isArray(obj.questions)) messages = obj.questions;
        else if (typeof obj.content === 'string') messages = obj.content.split('\n').filter(l => l.trim());

        return {
          title: obj.title || obj.instructions || "Short Answer Questions",
          messages: messages.length > 0 ? messages : ["Please provide your answer:"]
        };
      }

      // 3. Fallback: Parse as plain text (legacy or direct input)
      const lines = question.content.split('\n').filter(line => line.trim());

      return {
        title: "Short Answer Questions",
        messages: lines.length > 0 ? lines : ["Please provide your answer:"]
      };
    } catch (error) {
      console.warn('[WritingShortAnswerQuestion] Content parsing failed, using raw string:', error);
      return {
        title: "Short Answer Questions",
        messages: [typeof question.content === 'string' ? question.content : "Please provide your answer:"]
      };
    }
  }, [question.content]);

  const countWords = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  if (!questionData) {
    return <Box sx={{ p: 2 }}><Typography color="error">Không thể tải câu hỏi</Typography></Box>;
  }

  const messages = Array.isArray(questionData.messages) ? questionData.messages : ["Please provide your answer:"];

  return (
    <Box sx={{ maxHeight: '100vh', overflow: 'auto', p: 2 }}>
      <Grid container spacing={2}>
        {messages.map((message, index) => {
          const answerText = answers[index + 1] || '';
          const wordCount = countWords(answerText);
          return (
            <Grid item xs={12} key={index}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom sx={{ mb: 1, fontWeight: 500 }}>
                  {typeof message === 'object' ? (message.text || message.question || JSON.stringify(message)) : message}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  value={answerText}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  variant="outlined"
                  placeholder="Type your answer here..."
                  helperText={`${wordCount} words`}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white'
                    }
                  }}
                />
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}