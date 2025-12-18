'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

export default function MatchingQuestion({ question, onAnswerChange }) {
  const [matches, setMatches] = useState({});

  // Initialize matches from existing answer data
  useEffect(() => {
    console.log('[MatchingQuestion] useEffect triggered:', {
      questionId: question.id,
      hasAnswerData: !!question.answer_data,
      matches: question.answer_data?.matches,
      hasItems: !!question.items
    });

    if (question.answer_data?.matches) {
      console.log('[MatchingQuestion] Loading saved matches:', question.answer_data.matches);
      setMatches(question.answer_data.matches);
    } else if (question.items) {
      // Initialize empty matches for all items
      console.log('[MatchingQuestion] Initializing empty matches for', question.items.length, 'items');
      const initialMatches = {};
      question.items.forEach(item => {
        initialMatches[item.id] = null;
      });
      setMatches(initialMatches);
    }
  }, [question.id, question.answer_data?.matches, question.items?.length]); // Track specific values

  const handleMatchChange = (itemId, optionId) => {
    const newMatches = { ...matches };
    newMatches[itemId] = optionId === '' ? null : parseInt(optionId);
    
    setMatches(newMatches);
    onAnswerChange({ matches: newMatches });
  };

  // Check if an option is already selected in another item
  const isOptionSelected = (optionId) => {
    return Object.values(matches).includes(optionId);
  };

  // Get appropriate title based on question type
  const getTitle = () => {
    const questionType = question.questionType?.code;
    if (questionType?.includes('READING')) {
      return 'Nối tiêu đề với đoạn văn:';
    } else if (questionType?.includes('LISTENING')) {
      return 'Nghe và nối thông tin:';
    }
    return 'Nối các cặp phù hợp:';
  };

  if (!question.items || question.items.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {getTitle()}
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
          {question.content}
        </Typography>
        <Typography color="error">
          Không tìm thấy các mục cần nối.
        </Typography>
      </Box>
    );
  }

  if (!question.options || question.options.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {getTitle()}
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
          {question.content}
        </Typography>
        <Typography color="error">
          Không tìm thấy các đáp án để nối.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {getTitle()}
      </Typography>
      
      {/* Main question content */}
      {question.content && (
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
          {question.content}
        </Typography>
      )}

      {/* Matching Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell width="45%"><strong>Cột A</strong></TableCell>
              <TableCell width="10%" align="center"><strong>→</strong></TableCell>
              <TableCell width="45%"><strong>Cột B (Chọn đáp án phù hợp)</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {question.items.map((item, index) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Typography variant="body1">
                    <strong>{index + 1}.</strong> {item.item_text}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="h6" color="primary">→</Typography>
                </TableCell>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <Select
                      value={matches[item.id] || ''}
                      onChange={(e) => handleMatchChange(item.id, e.target.value)}
                      displayEmpty
                      autoWidth={false}
                      disableAutoFocus
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                            overflow: 'auto',
                          }
                        }
                      }}
                    >
                      <MenuItem value="">
                        <em>-- Chọn đáp án --</em>
                      </MenuItem>
                      {question.options.map((option, optIndex) => {
                        const isSelected = isOptionSelected(option.id) && matches[item.id] !== option.id;
                        return (
                          <MenuItem 
                            key={option.id} 
                            value={option.id}
                            disabled={isSelected}
                          >
                            <strong>{String.fromCharCode(65 + optIndex)}.</strong> {option.option_text}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Reference List of Options (for easy viewing) */}
      <Paper elevation={1} sx={{ mt: 3, p: 2, backgroundColor: '#f9f9f9' }}>
        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
          Danh sách đáp án (Cột B):
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          {question.options.map((option, index) => (
            <Typography key={option.id} variant="body2">
              <strong>{String.fromCharCode(65 + index)}.</strong> {option.option_text}
            </Typography>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}