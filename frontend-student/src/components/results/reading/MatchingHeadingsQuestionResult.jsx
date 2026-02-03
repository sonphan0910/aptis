'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

export default function MatchingHeadingsQuestionResult({ answer, question, showCorrectAnswer = true }) {
  const matches = answer.answer_json ? JSON.parse(answer.answer_json)?.matches || {} : {};
  const items = question.items || [];
  const options = question.options || [];
  const contentText = question.content || '';

  // Helper to get option text by ID or return the value if it's already text
  const getOptionDisplayText = (value) => {
    if (!value) return 'Not answered';

    // If value is a number, find the option by ID
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const option = options.find(opt => opt.id === numValue || opt.id === value);
      if (option) return option.option_text;
    }

    // If value is already text (old format), return it directly
    return String(value);
  };

  // Helper to get correct answer - supports both correct_option_id and answer_text
  const getCorrectAnswerText = (item) => {
    // If correct_option_id exists, find the option text
    if (item.correct_option_id) {
      const option = options.find(opt => opt.id === item.correct_option_id);
      if (option) return option.option_text;
    }
    // Fallback to answer_text (which is already text)
    return item.answer_text || item.correct_option_text || item.correct_answer || null;
  };

  // Check if user answer matches correct answer
  // Handles both old format (text values) and new format (option IDs)
  const checkIsCorrect = (userValue, item) => {
    if (!userValue) return false;

    const correctOptionId = item.correct_option_id;
    const correctText = getCorrectAnswerText(item);

    // Try to parse userValue as a number (new format - option ID)
    const userNumValue = parseInt(userValue);

    if (!isNaN(userNumValue) && correctOptionId) {
      // New format: compare option IDs
      return userNumValue === correctOptionId;
    }

    // Old format: compare text values directly
    if (correctText) {
      return String(userValue).trim().toLowerCase() === String(correctText).trim().toLowerCase();
    }

    return false;
  };

  // Sort items by item_order
  const sortedItems = useMemo(() =>
    [...items].sort((a, b) => (a.item_order || 0) - (b.item_order || 0)),
    [items]
  );

  // Parse content to extract paragraph sections
  const paragraphSections = useMemo(() => {
    let sections = [];

    // Try to parse JSON content first
    try {
      if (contentText && contentText.trim().startsWith('{')) {
        const parsed = JSON.parse(contentText);
        const rawParagraphs = parsed.paragraphs || parsed.passages;
        if (rawParagraphs && Array.isArray(rawParagraphs)) {
          sections = rawParagraphs.map((p, index) => ({
            title: `PARAGRAPH ${index + 1}`,
            content: p.text || p.content || ''
          }));
          return sections;
        }
      }
    } catch (e) {
      // Not JSON, continue with text parsing
    }

    // Fallback to text parsing
    const contentLines = contentText.split('\n').filter(line => line && line.trim());
    let currentParagraph = null;
    const paragraphStartIndex = contentLines.findIndex(line => line && line.includes('PARAGRAPH'));
    const startIdx = paragraphStartIndex >= 0 ? paragraphStartIndex : 0;

    for (let i = startIdx; i < contentLines.length; i++) {
      const line = contentLines[i];
      if (!line) continue;

      if (line.startsWith('PARAGRAPH')) {
        if (currentParagraph) {
          sections.push(currentParagraph);
        }
        currentParagraph = {
          title: line,
          content: ''
        };
      } else if (currentParagraph) {
        currentParagraph.content += line + '\n';
      }
    }

    if (currentParagraph) {
      sections.push(currentParagraph);
    }

    return sections;
  }, [contentText]);

  // Get instruction text
  const instructionText = useMemo(() => {
    try {
      if (contentText && contentText.trim().startsWith('{')) {
        const parsed = JSON.parse(contentText);
        return parsed.instructions || parsed.instruction || 'Match each paragraph with the correct heading.';
      }
    } catch (e) { }

    const contentLines = contentText.split('\n');
    const instructionEndIndex = contentLines.findIndex(line => line && line.includes('Available Headings:'));
    if (instructionEndIndex > 0) {
      return contentLines.slice(0, instructionEndIndex).join('\n');
    }
    return 'Match each paragraph with the correct heading.';
  }, [contentText]);

  // Calculate results
  const results = useMemo(() => {
    return paragraphSections.map((paragraph, index) => {
      const correspondingItem = sortedItems[index];
      if (!correspondingItem) return null;

      const userValue = matches[correspondingItem.id];
      const isCorrect = checkIsCorrect(userValue, correspondingItem);
      const userDisplayText = getOptionDisplayText(userValue);
      const correctDisplayText = getCorrectAnswerText(correspondingItem);

      return {
        itemId: correspondingItem.id,
        itemNumber: correspondingItem.item_number || (index + 1),
        paragraphTitle: paragraph.title,
        paragraphContent: paragraph.content.trim(),
        userValue,
        userDisplayText,
        correctDisplayText,
        isCorrect
      };
    }).filter(Boolean);
  }, [paragraphSections, sortedItems, matches, options]);

  const correctCount = results.filter(r => r.isCorrect).length;
  const totalCount = results.length;
  const availableHeadings = options.map(option => option.option_text);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Box sx={{ maxWidth: '900px', width: '100%' }}>
        {/* Instructions */}
        <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
          {instructionText}
        </Typography>

        {/* Available Headings List */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
          <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem', fontWeight: 600 }}>
            Available Headings:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {availableHeadings.map((heading, index) => (
              <Typography key={index} component="li" variant="body2" sx={{ mb: 0.5 }}>
                {heading}
              </Typography>
            ))}
          </Box>
        </Paper>

        {/* Score summary */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={`Score: ${correctCount}/${totalCount}`}
              color={correctCount === totalCount ? 'success' : correctCount > 0 ? 'warning' : 'error'}
              size="large"
            />
            <Chip
              label={`${totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0}% correct`}
              variant="outlined"
            />
          </Stack>
        </Box>

        {/* Paragraphs with Results */}
        {results.map((result) => (
          <Box key={result.itemId} sx={{ mb: 3 }}>
            <Paper sx={{
              p: 3,
              bgcolor: result.isCorrect ? 'success.50' : (result.userValue ? 'error.50' : 'grey.50'),
              border: '1px solid',
              borderColor: result.isCorrect ? 'success.main' : (result.userValue ? 'error.main' : 'grey.300')
            }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#1976d2' }}>
                {result.paragraphTitle}
              </Typography>

              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7, textAlign: 'justify' }}>
                {result.paragraphContent}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                  Selected Heading:
                </Typography>
                <Typography variant="body2" sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'white',
                  border: '1px solid #ddd',
                  flex: 1
                }}>
                  {result.userDisplayText}
                </Typography>
                {result.isCorrect ? (
                  <CheckCircle color="success" />
                ) : (
                  <Cancel color="error" />
                )}
              </Box>

              {showCorrectAnswer && !result.isCorrect && result.correctDisplayText && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px', color: 'success.dark' }}>
                    Correct Heading:
                  </Typography>
                  <Typography variant="body2" sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: 'success.100',
                    border: '1px solid',
                    borderColor: 'success.main',
                    flex: 1,
                    color: 'success.dark',
                    fontWeight: 600
                  }}>
                    {result.correctDisplayText}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        ))}

        {/* Progress indicator */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Hoàn thành {correctCount}/{totalCount} paragraphs
        </Typography>
      </Box>
    </Box>
  );
}