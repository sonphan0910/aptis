'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Grid,
  Divider,
} from '@mui/material';

export default function ChatResponsesWritingResult({ answer, question, feedback = null }) {
  const userAnswer = answer.text_answer || '';

  // Parse chat questions - could be JSON array or string
  // Parse chat questions - could be JSON array or string
  // Parse chat questions - could be JSON array or string
  let chatQuestions = [];
  try {
    let rawContent = question.content;

    // First try to parse as JSON
    if (rawContent && (rawContent.startsWith('[') || rawContent.startsWith('{'))) {
      try {
        const parsed = JSON.parse(rawContent);
        if (Array.isArray(parsed)) {
          chatQuestions = parsed.map(p => typeof p === 'string' ? p : (p.content || JSON.stringify(p)));
        } else if (parsed.questions && Array.isArray(parsed.questions)) {
          chatQuestions = parsed.questions.map(p => typeof p === 'string' ? p : (p.content || JSON.stringify(p)));
        } else if (parsed.content) {
          rawContent = parsed.content; // Continue to text parsing with extracted content
        }
      } catch (inner) { }
    }

    // If no structure found yet, try text parsing
    if (chatQuestions.length === 0 && rawContent) {
      // Regex to match Strict Aptis format: "Name: Message... Your reply:"
      // regex now case insensitive and handles potential 'Task X' prefix
      const strictRegex = /(?:Task \d\s+)?([A-Za-z]+):\s+([\s\S]+?)(?=\s+Your reply:)/gi;
      const strictMatches = [];
      let match;
      while ((match = strictRegex.exec(rawContent)) !== null) {
        strictMatches.push(`${match[1]}: ${match[2].trim()}`);
      }

      if (strictMatches.length >= 3) {
        chatQuestions = strictMatches;
      } else {
        // Fallback: Newline split looking for speakers
        const lines = rawContent.split('\n');
        const simpleMatches = [];
        for (const line of lines) {
          if (line.includes(':') && (line.includes('Alex') || line.includes('Sam') || line.includes('Jordan') || line.includes('Miguel'))) {
            // Clean up instructions if attached
            const cleanLine = line.replace(/^.*(?=(Alex|Sam|Jordan|Miguel|Kim|Ali))/, '');
            if (cleanLine) simpleMatches.push(cleanLine.trim());
          }
        }

        if (simpleMatches.length >= 3) {
          chatQuestions = simpleMatches;
        } else {
          // Last resort: Show the raw content if present
          if (rawContent) chatQuestions = [rawContent];
        }
      }
    }
  } catch (e) {
    console.error("Failed to parse chat questions", e);
    chatQuestions = [question.content || ''];
  }

  // Parse answers - could be JSON array or string
  let responses = [];
  try {
    if (answer.text_answer && (answer.text_answer.startsWith('[') || answer.text_answer.startsWith('{'))) {
      const parsed = JSON.parse(answer.text_answer);
      if (Array.isArray(parsed)) {
        responses = parsed.map(p => typeof p === 'string' ? p : JSON.stringify(p));
      }
    }
  } catch (e) {
    console.error("Failed to parse chat answers", e);
  }

  // Fallback to text splitting if JSON parse didn't yield array
  if (responses.length === 0 && userAnswer) {
    if (userAnswer.includes('Reply 1:')) {
      const replyParts = userAnswer.split(/Reply \d+:/);
      responses = replyParts.slice(1).map(r => r.trim()).filter(r => r);
    } else {
      // Fallback: try other separators
      responses = userAnswer.split(/(?:\n\n|\n---\n|\n\d+\.\s)/).filter(r => r.trim()).slice(1) || [];
      // If that still fails, treat the whole thing as one response if it's short? 
      // Or if there is only 1 question, treat it as 1 answer.
      if (responses.length === 0 && userAnswer.trim()) {
        responses = [userAnswer.trim()];
      }
    }
  }

  const hasAllResponses = responses.length >= 3;

  // Extract score and feedback
  const currentScore = feedback?.score || answer.final_score || answer.score || 0;
  const maxScore = answer.max_score || question.max_score || 10;
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

  // CEFR level mapping for Task 3
  const getCefrDisplay = (level) => {
    const mapping = {
      'B2+': 'B2+ (Above B1 level)',
      'B1.2': 'B1.2 (All 3 questions on topic)',
      'B1.1': 'B1.1 (2 questions on topic)',
      'A2.2': 'A2.2 (At least 2 questions on topic)',
      'A2.1': 'A2.1 (1 question on topic)',
      'A0': 'Below A2 (Poor performance)'
    };
    return mapping[level] || level;
  };

  // Word count for each response
  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <Box>
      {/* Task Instructions */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'blue.50', border: '1px solid #e3f2fd' }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 1, fontWeight: 'bold' }}>
          APTIS Writing Task 3 - Chat Responses
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Respond to 3 chat messages with 30-40 words each. Assessment covers: task fulfillment, grammar, punctuation, vocabulary, and cohesion.
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

      {/* Chat Questions and Responses */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.primary' }}>
          Chat Conversation
        </Typography>

        <Grid container spacing={3}>
          {chatQuestions.map((chatQuestion, index) => {
            const response = responses[index] || '';
            const wordCount = getWordCount(response);
            const isGoodLength = wordCount >= 30 && wordCount <= 40;

            return (
              <Grid item xs={12} key={index}>
                <Box sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  {/* Friend's Message */}
                  <Box sx={{
                    p: 2,
                    bgcolor: 'blue.50',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5, fontWeight: 'bold' }}>
                      {/* Tiêu đề riêng cho từng phần */}
                      Task {index + 1}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {chatQuestion}
                    </Typography>
                  </Box>

                  {/* User's Response */}
                  <Box sx={{ p: 2, bgcolor: response ? 'success.50' : 'grey.100' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Your reply:
                      </Typography>
                      <Chip
                        size="small"
                        label={`${wordCount} words`}
                        color={isGoodLength ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </Stack>
                    <Typography
                      variant="body1"
                      sx={{
                        color: response ? 'text.primary' : 'text.secondary',
                        fontStyle: response ? 'normal' : 'italic',
                        lineHeight: 1.6,
                        p: 2,
                        bgcolor: 'white',
                        borderRadius: 1,
                        border: '1px solid #ddd',
                        minHeight: 50
                      }}
                    >
                      {response || 'No response provided'}
                    </Typography>
                    {response && (
                      <Typography variant="caption" sx={{
                        color: isGoodLength ? 'success.main' : 'warning.main',
                        fontWeight: 'bold',
                        mt: 1,
                        display: 'block'
                      }}>
                        {isGoodLength ? '✓ Good word count (30-40 words)' :
                          wordCount < 30 ? '⚠ Too short (target: 30-40 words)' :
                            '⚠ Too long (target: 30-40 words)'}
                      </Typography>
                    )}
                  </Box>
                </Box>
                {index < chatQuestions.length - 1 && <Divider sx={{ my: 2 }} />}
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Raw Response (if format is unclear) */}
      {responses.length < 3 && userAnswer && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'warning.50' }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'warning.dark' }}>
            Complete Response Text
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            Your full response (system may have had trouble parsing individual replies):
          </Typography>
          <Box sx={{
            p: 2,
            bgcolor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap'
          }}>
            {userAnswer}
          </Box>
        </Paper>
      )}

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
                      {suggestion.response && (
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                          {suggestion.response}
                        </Typography>
                      )}
                      {(suggestion.context || suggestion.original_phrase || suggestion.phrase || suggestion.specific_phrase) && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Original:</strong> "{suggestion.context || suggestion.original_phrase || suggestion.phrase || suggestion.specific_phrase}"
                        </Typography>
                      )}
                      {(suggestion.corrected || suggestion.corrected_version) && (
                        <Typography variant="body2" sx={{ mb: 1, color: 'success.main' }}>
                          <strong>✓ Corrected:</strong> "{suggestion.corrected || suggestion.corrected_version}"
                        </Typography>
                      )}
                      {(suggestion.explanation || suggestion.reason) && (
                        <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
                          <strong>Why:</strong> {suggestion.explanation || suggestion.reason}
                        </Typography>
                      )}
                      {(suggestion.rationale || suggestion.improvement_goal || suggestion.addressing_question) && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          <strong>Impact:</strong> {suggestion.rationale || suggestion.improvement_goal || suggestion.addressing_question}
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