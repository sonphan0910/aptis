'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Divider,
  LinearProgress,
} from '@mui/material';

export default function ShortTextWritingResult({ answer, question, feedback = null }) {
  // Helper to safely parse JSON, handling potential double-stringification
  const parseContent = (content) => {
    if (typeof content !== 'string') return content;
    try {
      if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
        const parsed = JSON.parse(content);
        // If parsed is still a string (double encoded), recurse
        if (typeof parsed === 'string') return parseContent(parsed);
        return parsed;
      }
    } catch (e) {
      return content;
    }
    return content;
  };

  // Parse answers
  let parsedAnswers = [];
  try {
    const rawAnswer = answer.text_answer;
    const parsed = parseContent(rawAnswer);
    if (Array.isArray(parsed)) {
      parsedAnswers = parsed;
    } else {
      parsedAnswers = [parsed || ''];
    }
  } catch (e) {
    parsedAnswers = [answer.text_answer || ''];
  }

  // Parse questions
  let parsedQuestions = [];
  try {
    const rawContent = question.content;
    const parsed = parseContent(rawContent);

    if (Array.isArray(parsed)) {
      // For Task 2 (Short Text), we expect a single question. 
      // If we get an array, join it to form one context/prompt.
      const combined = parsed.map(p => (typeof p === 'string' ? p : (p.content || JSON.stringify(p)))).join('\n');
      parsedQuestions = [combined];
    } else if (parsed && typeof parsed === 'object') {
      if (parsed.questions && Array.isArray(parsed.questions)) {
        // Should not happen for standard Task 2, but if so, join them?
        // Or if the data structure forces multiple questions, we might accept it.
        // But the user insists on "exactly one question".
        // Let's assume 'questions' array here might be lines of the same prompt.
        const lines = parsed.questions.map(p => (typeof p === 'string' ? p : (p.content || JSON.stringify(p))));
        parsedQuestions = [lines.join('\n')];
      } else if (parsed.content) {
        // Keep content as single block
        parsedQuestions = [parsed.content];
      } else {
        parsedQuestions = [JSON.stringify(parsed)];
      }
    } else {
      // Primitive string - keep as single block even if it has newlines
      parsedQuestions = [parsed || ''];
    }
  } catch (e) {
    console.error("Error parsing questions:", e);
    parsedQuestions = [question.content || ''];
  }

  // Ensure we have pairs
  // Ensure we have pairs
  const displayItems = parsedQuestions.map((q, idx) => {
    // Clean up question text if it's an object or JSON string
    let qText = typeof q === 'string' ? q : (q.content || JSON.stringify(q));
    // Remove quotes if it looks like a JSON string "..."
    if (qText.startsWith('"') && qText.endsWith('"')) {
      qText = qText.slice(1, -1);
    }
    return {
      question: qText,
      answer: parsedAnswers[idx] || ''
    };
  });

  const targetWordCount = { min: 20, max: 30 };

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

  // Color coding based on score
  const getScoreColor = (score) => {
    if (score >= 4) return 'success';
    if (score >= 3) return 'info';
    if (score >= 2) return 'warning';
    return 'error';
  };

  // CEFR level mapping for Task 2
  const getCefrDisplay = (level) => {
    const mapping = {
      'A0': 'A0 (No meaningful language)',
      'A1.1': 'A1.1 (Limited words/phrases)',
      'A1.2': 'A1.2 (Not fully on topic)',
      'A2.1': 'A2.1 (On topic, list of sentences)',
      'A2.2': 'A2.2 (On topic, some connectors)',
      'B1+': 'B1+ (Above A2 level)'
    };
    return mapping[level] || level;
  };

  // Word count progress


  return (
    <Box>
      {/* Task Instructions */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'blue.50', border: '1px solid #e3f2fd' }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 1, fontWeight: 'bold' }}>
          APTIS Writing Task 2 - Short Text Writing
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Write a response of 20-30 words. Assessment covers: task fulfillment, grammar, punctuation, vocabulary, and cohesion.
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

      {/* Questions and Responses */}
      {displayItems.map((item, index) => {
        const wordCount = item.answer.trim().split(/\s+/).filter(word => word.length > 0).length;
        const isWithinWordCount = wordCount >= targetWordCount.min && wordCount <= targetWordCount.max;
        const wordCountProgress = Math.min((wordCount / targetWordCount.max) * 100, 100);
        const hasAnswer = item.answer.trim() !== '';

        return (
          <Paper key={index} sx={{ p: 3, mb: 3 }}>
            {/* Question */}
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'text.primary', fontSize: '1rem' }}>
                Question {displayItems.length > 1 ? index + 1 : ''}
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {item.question}
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontSize: '1rem' }}>
              Your Response
            </Typography>

            {/* Word Count Progress */}
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Word Count: {wordCount}/{targetWordCount.max} (target: {targetWordCount.min}-{targetWordCount.max})
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: isWithinWordCount ? 'success.main' : 'warning.main',
                    fontWeight: 'bold'
                  }}
                >
                  {isWithinWordCount ? '✓ Within target' : wordCount < targetWordCount.min ? 'Too short' : 'Too long'}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={wordCountProgress}
                color={isWithinWordCount ? 'success' : 'warning'}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box sx={{
              p: 3,
              bgcolor: hasAnswer ? 'white' : 'grey.100',
              border: `2px solid ${hasAnswer ? (isWithinWordCount ? '#4caf50' : '#ff9800') : '#ccc'}`,
              borderRadius: 2,
              minHeight: 100
            }}>
              <Typography
                variant="body1"
                sx={{
                  color: hasAnswer ? 'text.primary' : 'text.secondary',
                  fontStyle: hasAnswer ? 'normal' : 'italic',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {item.answer || 'No response provided'}
              </Typography>
            </Box>
          </Paper>
        );
      })}

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