'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Stack,
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';

export default function MCQQuestionResult({ answer, question, showCorrectAnswer = true }) {
  const options = question.options || [];
  const userAnswerId = answer.selected_option_id ||
    (answer.answer_json ? JSON.parse(answer.answer_json)?.selected_option_id : null);
  const correctOption = options.find(opt => opt.is_correct);
  const isCorrect = userAnswerId === correctOption?.id;

  // Parse content and handle JSON format  
  const displayContent = useMemo(() => {
    const content = question.content || '';

    // Try to parse JSON content
    try {
      if (content && content.trim().startsWith('{')) {
        const parsed = JSON.parse(content);
        if (parsed.question || parsed.text || parsed.passage) {
          return parsed.question || parsed.text || parsed.passage || content;
        }
      }
    } catch (e) {
      // Not JSON, use as-is
    }

    return content;
  }, [question.content]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Box sx={{ maxWidth: '900px', width: '100%' }}>
        {/* Question Content */}
        <Paper sx={{ p: 3, mb: 2, bgcolor: 'grey.50' }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {displayContent}
          </Typography>
        </Paper>

        {/* Media if available */}
        {question.media_url && (
          <Paper sx={{ p: 2, mb: 2, textAlign: 'center', bgcolor: 'grey.100' }}>
            {question.media_url.includes('audio') || question.media_url.includes('.mp3') || question.media_url.includes('.wav') ? (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Audio:</Typography>
                <audio controls style={{ width: '100%', maxWidth: '400px' }}>
                  <source src={question.media_url} />
                  Your browser does not support the audio element.
                </audio>
              </Box>
            ) : question.media_url.includes('video') || question.media_url.includes('.mp4') ? (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Video:</Typography>
                <video controls style={{ width: '100%', maxWidth: '500px', maxHeight: '300px' }}>
                  <source src={question.media_url} />
                  Your browser does not support the video element.
                </video>
              </Box>
            ) : (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Image:</Typography>
                <img
                  src={question.media_url}
                  alt="Question media"
                  style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }}
                />
              </Box>
            )}
          </Paper>
        )}

        {/* Answer Options */}
        <FormControl component="fieldset" fullWidth disabled>
          <RadioGroup value={userAnswerId || ''}>
            {options.map((option, index) => {
              const isUserSelected = userAnswerId === option.id;
              const isOptionCorrect = option.is_correct;

              return (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio checked={isUserSelected} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {String.fromCharCode(65 + index)}. {option.option_text}
                      </Typography>
                      {isOptionCorrect && showCorrectAnswer && (
                        <Chip
                          icon={<Check />}
                          label="Correct"
                          size="small"
                          color="success"
                        />
                      )}
                      {isUserSelected && !isOptionCorrect && (
                        <Chip
                          icon={<Close />}
                          label="Your choice"
                          size="small"
                          color="error"
                        />
                      )}
                      {isUserSelected && isOptionCorrect && (
                        <Chip
                          icon={<Check />}
                          label="Your choice ✓"
                          size="small"
                          color="success"
                        />
                      )}
                    </Box>
                  }
                  sx={{
                    mb: 1,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: isUserSelected
                      ? (isOptionCorrect ? 'success.50' : 'error.50')
                      : (isOptionCorrect && showCorrectAnswer ? 'success.100' : 'transparent'),
                    border: '1px solid',
                    borderColor: isUserSelected
                      ? (isOptionCorrect ? 'success.main' : 'error.main')
                      : (isOptionCorrect && showCorrectAnswer ? 'success.light' : 'grey.300')
                  }}
                />
              );
            })}
          </RadioGroup>
        </FormControl>

        {/* Score Summary */}
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={isCorrect ? "Correct" : "Incorrect"}
              color={isCorrect ? "success" : "error"}
              variant="filled"
              size="large"
            />
            <Chip
              label={`Score: ${answer.score || (isCorrect ? 1 : 0)}/${answer.max_score || 1}`}
              variant="outlined"
            />
            {!isCorrect && !userAnswerId && (
              <Chip
                label="Not answered"
                color="warning"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}