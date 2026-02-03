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

export default function EmailWritingResult({ answer, question, feedback = null }) {
  const userAnswer = answer.text_answer || '';

  // Parse question content if it's JSON
  let questionContent = question.content;
  try {
    if (questionContent && (questionContent.startsWith('{') || questionContent.startsWith('['))) {
      const parsed = JSON.parse(questionContent);
      // specific logic depending on how the JSON looks, assuming it might be { content: "..." } or similar
      // If it's just a string wrapper
      if (typeof parsed === 'string') questionContent = parsed;
      else if (parsed.content) questionContent = parsed.content;
    }
  } catch (e) {
    // Keep original if parse fails
  }

  // Parse emails - look for "Friend Email:", "Manager Email:", "Formal Email:" patterns
  let emails = [];
  if (userAnswer.includes('Friend Email:')) {
    const sections = userAnswer.split(/(Friend Email:|Manager Email:|Formal Email:)/i);
    for (let i = 1; i < sections.length; i += 2) {
      if (sections[i + 1]) {
        emails.push(sections[i + 1].trim());
      }
    }
  } else {
    // Fallback: split by common separators
    emails = userAnswer.split(/(?:\n\n\d+\.|---|\n#{2,}|\nEmail \d+:|\n\d+\.\s)/i).filter(e => e.trim());
  }

  const hasInformalEmail = emails.length >= 1;
  const hasFormalEmail = emails.length >= 2;

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
    if (score >= 5) return 'success';
    if (score >= 4) return 'info';
    if (score >= 3) return 'warning';
    return 'error';
  };

  // CEFR level mapping for Task 4
  const getCefrDisplay = (level) => {
    const mapping = {
      'C2': 'C2 (Above C1 level)',
      'C1': 'C1 (Features as B2.2 but higher)',
      'B2.2': 'B2.2 (Two clearly different registers)',
      'B2.1': 'B2.1 (Appropriate register in ONE response)',
      'B1.2': 'B1.2 (Register not used consistently)',
      'B1.1': 'B1.1 (No evidence of register awareness)',
      'A1/A2': 'A1/A2 (Below B1 level)'
    };
    return mapping[level] || level;
  };

  // Word count analysis
  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const informalEmail = emails[0] || '';
  const managerEmail = emails[1] || '';
  const formalEmail = emails[2] || '';
  const informalWordCount = getWordCount(informalEmail);
  const managerWordCount = getWordCount(managerEmail);
  const formalWordCount = getWordCount(formalEmail);

  // Target word counts for 3 email types
  const informalTarget = { min: 40, max: 60 };
  const managerTarget = { min: 80, max: 100 };
  const formalTarget = { min: 120, max: 150 };

  const isInformalGoodLength = informalWordCount >= informalTarget.min && informalWordCount <= informalTarget.max;
  const isManagerGoodLength = managerWordCount >= managerTarget.min && managerWordCount <= managerTarget.max;
  const isFormalGoodLength = formalWordCount >= formalTarget.min && formalWordCount <= formalTarget.max;

  return (
    <Box>
      {/* Task Instructions */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'blue.50', border: '1px solid #e3f2fd' }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 1, fontWeight: 'bold' }}>
          APTIS Writing Task 4 - Formal and Informal Writing
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Write two emails: informal (40-50 words) and formal (120-150 words). Key assessment: register control, grammar, vocabulary, and cohesion.
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

      {/* Email Task Context */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
          Email Context
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {questionContent}
        </Typography>
      </Paper>

      {/* Email Responses */}
      <Grid container spacing={2}>
        {/* Friend Email */}
        <Grid item xs={12} md={6}>
          <Paper sx={{
            p: 3,
            height: '100%',
            border: hasInformalEmail ? '2px solid #4caf50' : '2px solid #ccc'
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                1. Friend Email
              </Typography>
              <Chip
                size="small"
                label={`${informalWordCount} words`}
                color={isInformalGoodLength ? 'success' : 'warning'}
                variant="outlined"
              />
            </Stack>

            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Target: {informalTarget.min}-{informalTarget.max} words • Register: Casual, friendly
            </Typography>

            <Box sx={{
              p: 2,
              bgcolor: hasInformalEmail ? 'white' : 'grey.100',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              minHeight: 150
            }}>
              <Typography
                variant="body2"
                sx={{
                  color: hasInformalEmail ? 'text.primary' : 'text.secondary',
                  fontStyle: hasInformalEmail ? 'normal' : 'italic',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {informalEmail || 'No friend email provided'}
              </Typography>
            </Box>

            {hasInformalEmail && (
              <Typography variant="caption" sx={{
                color: isInformalGoodLength ? 'success.main' : 'warning.main',
                fontWeight: 'bold',
                mt: 1,
                display: 'block'
              }}>
                {isInformalGoodLength ? '✓ Good word count' :
                  informalWordCount < informalTarget.min ? '⚠ Too short' : '⚠ Too long'}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Manager Email */}
        <Grid item xs={12} md={6}>
          <Paper sx={{
            p: 3,
            height: '100%',
            border: emails.length >= 2 ? '2px solid #ff9800' : '2px solid #ccc'
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                2. Manager Email
              </Typography>
              <Chip
                size="small"
                label={`${managerWordCount} words`}
                color={isManagerGoodLength ? 'success' : 'warning'}
                variant="outlined"
              />
            </Stack>

            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Target: {managerTarget.min}-{managerTarget.max} words • Register: Professional
            </Typography>

            <Box sx={{
              p: 2,
              bgcolor: emails.length >= 2 ? 'white' : 'grey.100',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              minHeight: 150
            }}>
              <Typography
                variant="body2"
                sx={{
                  color: emails.length >= 2 ? 'text.primary' : 'text.secondary',
                  fontStyle: emails.length >= 2 ? 'normal' : 'italic',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {managerEmail || 'No manager email provided'}
              </Typography>
            </Box>

            {emails.length >= 2 && (
              <Typography variant="caption" sx={{
                color: isManagerGoodLength ? 'success.main' : 'warning.main',
                fontWeight: 'bold',
                mt: 1,
                display: 'block'
              }}>
                {isManagerGoodLength ? '✓ Good word count' :
                  managerWordCount < managerTarget.min ? '⚠ Too short' : '⚠ Too long'}
              </Typography>
            )}
          </Paper>
        </Grid>


      </Grid>

      {/* Raw Response (if parsing failed) */}
      {emails.length < 3 && userAnswer && (
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'warning.50' }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'warning.dark' }}>
            Complete Response Text
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            Your full response (system may have had trouble separating the emails):
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
        <Paper sx={{ mt: 3, borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
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
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'orange.50', border: '1px solid #fff3e0' }}>
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
                      {(suggestion.email_section || suggestion.section) && (
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                          📧 {suggestion.email_section || suggestion.section}
                        </Typography>
                      )}
                      {(suggestion.context || suggestion.original_text || suggestion.original_sentence || suggestion.original) && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Original:</strong> "{suggestion.context || suggestion.original_text || suggestion.original_sentence || suggestion.original}"
                        </Typography>
                      )}
                      {(suggestion.corrected || suggestion.corrected_text || suggestion.corrected_sentence || suggestion.correction) && (
                        <Typography variant="body2" sx={{ mb: 1, color: 'success.main' }}>
                          <strong>✓ Corrected:</strong> "{suggestion.corrected || suggestion.corrected_text || suggestion.corrected_sentence || suggestion.correction}"
                        </Typography>
                      )}
                      {suggestion.explanation && (
                        <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
                          <strong>Why:</strong> {suggestion.explanation}
                        </Typography>
                      )}
                      {(suggestion.rationale || suggestion.improvement_area) && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          <strong>Impact:</strong> {suggestion.rationale || suggestion.improvement_area}
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