'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

export default function WordLevelWritingResult({ answer, question, feedback = null }) {
  // Parse student answers from formatted text "Answer 1: text\n\nAnswer 2: text"
  const textAnswer = answer.text_answer || '';
  const parsedAnswers = {};

  if (textAnswer) {
    const answerParts = textAnswer.split('\n\n');
    answerParts.forEach(part => {
      const match = part.match(/^Answer (\d+):\s*(.*)$/s);
      if (match) {
        const [, index, text] = match;
        parsedAnswers[index] = text.trim();
      }
    });
  }

  // Helper to safely parse JSON
  const parseContent = (content) => {
    if (typeof content !== 'string') return content;
    try {
      if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
        const parsed = JSON.parse(content);
        if (typeof parsed === 'string') return parseContent(parsed);
        return parsed;
      }
    } catch (e) {
      return content;
    }
    return content;
  };

  // Parse questions from content
  let questions = [];
  try {
    const parsed = parseContent(question.content);
    if (Array.isArray(parsed)) {
      questions = parsed.map(p => typeof p === 'string' ? p : (p.content || JSON.stringify(p)));
    } else if (parsed && typeof parsed === 'object') {
      if (parsed.questions && Array.isArray(parsed.questions)) {
        questions = parsed.questions;
      } else if (parsed.content) {
        // Handle "content" string with newlines
        if (typeof parsed.content === 'string' && parsed.content.includes('\n')) {
          questions = parsed.content.split('\n').filter(q => q.trim().length > 0);
        } else {
          questions = [parsed.content];
        }
      }
    } else {
      // Plain string
      const str = parsed || '';
      if (str.includes('\n')) {
        questions = str.split('\n').filter(q => q.trim().length > 0);
      } else {
        questions = [str];
      }
    }
  } catch (e) {
    console.error("Error parsing WordLevel questions", e);
    questions = [question.content];
  }

  // Filter out empty or non-question lines if needed, but Form Filling usually implies all lines are prompts
  questions = questions.filter(q => q && q.trim().length > 0);

  // Extract score and feedback
  const score = feedback?.score || answer.final_score || answer.score || 0;
  const maxScore = answer.max_score || question.max_score || 10; // Use actual max_score from answer/question
  const cefrLevel = feedback?.cefr_level || 'Not assessed';
  const comment = feedback?.comment || '';
  let suggestions = feedback?.suggestions || [];
  if (typeof suggestions === 'string') {
    try {
      if (suggestions.trim().startsWith('[') || suggestions.trim().startsWith('{')) {
        suggestions = JSON.parse(suggestions);
      }
    } catch (e) {
      console.error("Failed to parse suggestions JSON", e);
    }
  }

  // Convert parsed answers to array format for display
  const answers = questions.map((_, index) => parsedAnswers[index + 1] || '');

  // Color coding based on score
  const getScoreColor = (score) => {
    if (score >= 3) return 'success';
    if (score >= 2) return 'info';
    if (score >= 1) return 'warning';
    return 'error';
  };

  // CEFR level mapping for Task 1
  const getCefrDisplay = (level) => {
    const mapping = {
      'A0': 'A0 (No intelligible responses)',
      'A1.1': 'A1.1 (1-2 intelligible responses)',
      'A1.2': 'A1.2 (3-4 intelligible responses)',
      'above A1': 'Above A1 (All responses intelligible)'
    };
    return mapping[level] || level;
  };

  return (
    <Box>
      {/* Task Instructions */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'blue.50', border: '1px solid #e3f2fd' }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 1, fontWeight: 'bold' }}>
          APTIS Writing Task 1 - Word-level Writing
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Fill in basic information using 1-5 words per question. Assessment focuses on task fulfillment and communicative competence.
        </Typography>
      </Paper>

      {/* Score and CEFR removed as per request */}

      {comment && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            {comment}
          </Typography>
        </Paper>
      )}

      {/* Questions and Answers */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
          Your Responses
        </Typography>

        <Grid container spacing={2}>
          {questions.map((question, index) => (
            <Grid item xs={12} key={index}>
              <Box sx={{
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                bgcolor: answers[index] ? 'success.50' : 'grey.50'
              }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {index + 1}. {question.trim()}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: answers[index] ? 'text.primary' : 'text.secondary',
                    fontStyle: answers[index] ? 'normal' : 'italic',
                    p: 1,
                    bgcolor: 'white',
                    borderRadius: 0.5,
                    border: '1px solid #ddd'
                  }}
                >
                  {answers[index] || 'No response provided'}
                </Typography>
              </Box>
              {index < questions.length - 1 && <Divider sx={{ my: 1 }} />}
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Teacher Feedback */}
      {answer.manual_feedback && (
        <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            px: 3,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              👨‍🏫 Teacher Review
            </Typography>
            {answer.final_score !== null && (
              <Chip
                label={`Score: ${answer.final_score}/${answer.max_score || question.max_score || 10}`}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: '#1565c0',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}
                size="medium"
              />
            )}
          </Box>
          <Box sx={{ bgcolor: '#f8faff', p: 3 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'text.primary', mb: 2 }}>
              {answer.manual_feedback}
            </Typography>
            {answer.reviewed_at && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 2, borderTop: '1px solid #e3e8ef' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  📅 Reviewed on: {new Date(answer.reviewed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {/* AI Feedback */}
      {suggestions && (suggestions.length > 0 || typeof suggestions === 'string') && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'orange.50', border: '1px solid #fff3e0' }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'orange.800' }}>
            🤖 AI Comprehensive Assessment
          </Typography>
          <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', color: 'orange.900', fontWeight: 'bold' }}>
            Suggestions for Improvement
          </Typography>

          {Array.isArray(suggestions) ? (
            <Stack spacing={2}>
              {suggestions.map((suggestion, idx) => (
                <Box key={idx} sx={{
                  p: 2,
                  bgcolor: 'white',
                  border: '1px solid #ffe0b2',
                  borderRadius: 1
                }}>
                  {typeof suggestion === 'string' ? (
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                      {suggestion}
                    </Typography>
                  ) : (
                    <Box>
                      {(suggestion.context || suggestion.original || suggestion.incorrect_phrase) && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Original:</strong> "{suggestion.context || suggestion.original || suggestion.incorrect_phrase}"
                        </Typography>
                      )}
                      {(suggestion.corrected || suggestion.corrected_version) && (
                        <Typography variant="body2" sx={{ mb: 1, color: 'success.main' }}>
                          <strong>✓ Corrected:</strong> "{suggestion.corrected || suggestion.corrected_version}"
                        </Typography>
                      )}
                      {suggestion.explanation && (
                        <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
                          <strong>Why:</strong> {suggestion.explanation}
                        </Typography>
                      )}
                      {suggestion.rationale && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          <strong>Impact:</strong> {suggestion.rationale}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {typeof suggestions === 'string' ? suggestions : JSON.stringify(suggestions, null, 2)}
            </Typography>
          )}
        </Paper>
      )}


    </Box>
  );
}