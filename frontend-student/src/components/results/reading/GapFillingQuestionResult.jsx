'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
} from '@mui/material';

export default function GapFillingQuestionResult({ answer, question, showCorrectAnswer = true }) {
  // Parse user answers from answer_json (matches exam-taking structure)
  const gaps = answer.answer_json ? JSON.parse(answer.answer_json)?.gaps || {} : {};

  // Parse content and handle JSON data if necessary (same logic as exam-taking component)
  const { displayContent, displayItems, displayOptions, correctAnswersFromJson } = useMemo(() => {
    let content = question.content || '';
    let items = question.items || [];
    let options = question.options || [];
    let correctAnswers = [];

    // Try to parse content if it's JSON
    try {
      if (content && (content.trim().startsWith('{') || content.trim().startsWith('['))) {
        const parsed = JSON.parse(content);
        if (parsed.passage) {
          content = parsed.passage;

          // Get correct answers from JSON if available
          if (parsed.correctAnswers) {
            correctAnswers = parsed.correctAnswers;
          }

          // If items are missing from the question object but present in JSON (via correctAnswers)
          if (items.length === 0 && (parsed.correctAnswers || parsed.options)) {
            const count = parsed.correctAnswers ? parsed.correctAnswers.length :
              (content.match(/\[GAP\d+\]/g) || []).length;

            items = Array.from({ length: count }, (_, i) => ({
              id: `gap-${i + 1}`,
              item_number: i + 1,
              item_order: i + 1,
              answer_text: parsed.correctAnswers ? parsed.correctAnswers[i] : null
            }));
          }

          // If options are missing from the question object but present in JSON
          if (options.length === 0 && parsed.options) {
            options = parsed.options.map((opt, idx) => ({
              id: `opt-${idx}`,
              option_text: opt
            }));
          }
        }
      }
    } catch (e) {
      console.log('[GapFillingQuestionResult] Content is not JSON or missing passage field');
    }

    return { displayContent: content, displayItems: items, displayOptions: options, correctAnswersFromJson: correctAnswers };
  }, [question.content, question.items, question.options]);

  // Score calculation
  let correctCount = 0;
  let totalGaps = displayItems.length;

  // Render content with gaps (matches exam-taking logic exactly)
  const renderContentWithGaps = () => {
    let content = displayContent;
    const parts = [];
    let lastIndex = 0;

    if (!displayItems || displayItems.length === 0) {
      return <Typography>{content}</Typography>;
    }

    // Sort items by item_number if available, otherwise by item_order (same as exam-taking)
    const sortedItems = [...displayItems].sort((a, b) => {
      const aNum = a.item_number || a.item_order || 0;
      const bNum = b.item_number || b.item_order || 0;
      return aNum - bNum;
    });

    sortedItems.forEach((item, index) => {
      // Try both item_number and index-based gap patterns (same as exam-taking)
      const gapNumber = item.item_number || (index + 1);
      const gapPattern = `[GAP${gapNumber}]`;

      const gapIndex = content.indexOf(gapPattern, lastIndex);

      if (gapIndex !== -1) {
        // Add text before gap
        if (gapIndex > lastIndex) {
          parts.push(
            <span key={`text-${item.id}-${index}`}>
              {content.substring(lastIndex, gapIndex)}
            </span>
          );
        }

        // Get user answer (stored by item.id, value is option_text)
        const userAnswer = gaps[item.id] || '';
        // Find correct answer from item (answer_text is the definitive field from backend)
        // Also check correctAnswersFromJson for JSON-based questions
        const correctAnswer = item.answer_text || item.correct_option_text || item.correct_answer ||
          (correctAnswersFromJson[index] || null);
        const isCorrect = userAnswer && correctAnswer && userAnswer === correctAnswer;

        if (isCorrect) correctCount++;

        // Add styled gap showing result
        parts.push(
          <Box
            key={`gap-${item.id}-${index}`}
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              mx: 0.5,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: userAnswer ? (isCorrect ? 'success.100' : 'error.100') : 'grey.100',
              border: '1px solid',
              borderColor: userAnswer ? (isCorrect ? 'success.main' : 'error.main') : 'grey.300',
              minWidth: 120,
              justifyContent: 'center'
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                color: userAnswer ? (isCorrect ? 'success.dark' : 'error.dark') : 'text.secondary',
                fontSize: '0.95rem'
              }}
            >
              {userAnswer || '-- Chọn từ --'}
            </Typography>
            {showCorrectAnswer && userAnswer && !isCorrect && correctAnswer && (
              <Typography variant="caption" sx={{ ml: 1, color: 'success.dark', fontWeight: 500 }}>
                (→ {correctAnswer})
              </Typography>
            )}
          </Box>
        );

        lastIndex = gapIndex + gapPattern.length;
      }
    });

    // Add remaining text after all gaps
    if (lastIndex < content.length) {
      parts.push(
        <span key="text-end">
          {content.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : <Typography>{content}</Typography>;
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Box sx={{ maxWidth: '900px', width: '100%' }}>
        {/* Question content with gaps (matching exam-taking exactly) */}
        <Paper sx={{ p: 3, mb: 2, bgcolor: 'grey.50' }}>
          <Typography
            variant="body1"
            component="div"
            sx={{
              lineHeight: 2.2,
              fontSize: '1.05rem',
              whiteSpace: 'pre-wrap',
              textAlign: 'justify'
            }}
          >
            {renderContentWithGaps()}
          </Typography>
        </Paper>

        {/* Available options reference (same as exam-taking) */}
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Available words:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
            {displayOptions.map(option => (
              <Chip
                key={option.id}
                label={option.option_text}
                variant="outlined"
                size="small"
                sx={{
                  bgcolor: 'background.paper',
                  border: '1px solid #e0e0e0'
                }}
              />
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
