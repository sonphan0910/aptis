'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

export default function MatchingQuestionResult({ answer, question, showCorrectAnswer = true }) {
  const matches = answer.answer_json ? JSON.parse(answer.answer_json)?.matches || {} : {};
  const options = question.options || [];
  const items = question.items || [];
  const contentText = question.content || '';

  // DEBUG: Log all data to understand the structure
  console.log('[MatchingQuestionResult] DEBUG:', {
    matches,
    options: options.map(o => ({ id: o.id, text: o.option_text })),
    items: items.map(i => ({ id: i.id, item_text: i.item_text?.substring(0, 30), answer_text: i.answer_text, correct_option_id: i.correct_option_id }))
  });

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

    // If answer_text is just a letter like "A", find matching option "Person A"
    const answerText = item.answer_text || item.correct_option_text || item.correct_answer;
    if (answerText && answerText.length === 1) {
      // It's just a letter, find the matching option
      const matchingOption = options.find(opt => {
        const letterMatch = opt.option_text.match(/Person\s+([A-Z])/i);
        return letterMatch && letterMatch[1].toUpperCase() === answerText.toUpperCase();
      });
      if (matchingOption) return matchingOption.option_text;
    }

    return answerText || null;
  };

  // Check if user answer matches correct answer
  // Handles multiple formats:
  // 1. Option ID comparison (if correct_option_id is set)
  // 2. Direct text comparison
  // 3. Letter extraction: answer_text="A" should match selected option "Person A"
  const checkIsCorrect = (userValue, item) => {
    if (!userValue) return false;

    const correctOptionId = item.correct_option_id;
    const answerText = item.answer_text; // Could be "A", "B", "Person A", etc.

    // Try to parse userValue as a number (option ID)
    const userNumValue = parseInt(userValue);

    // Case 1: If correct_option_id is set, compare option IDs
    if (!isNaN(userNumValue) && correctOptionId) {
      return userNumValue === correctOptionId;
    }

    // Case 2: User selected an option (ID), need to find its text and compare with answer_text
    if (!isNaN(userNumValue) && answerText) {
      const selectedOption = options.find(opt => opt.id === userNumValue);
      if (selectedOption) {
        const selectedText = selectedOption.option_text; // e.g., "Person A"

        // Direct match
        if (selectedText.toLowerCase() === answerText.toLowerCase()) {
          return true;
        }

        // Extract letter from "Person A" -> "A" and compare with answer_text
        const letterMatch = selectedText.match(/Person\s+([A-Z])/i);
        if (letterMatch && letterMatch[1].toUpperCase() === answerText.toUpperCase()) {
          return true;
        }

        // If answer_text is like "Person A" and option is "A", also handle
        const answerLetterMatch = answerText.match(/Person\s+([A-Z])/i);
        if (answerLetterMatch) {
          const extractedLetter = answerLetterMatch[1].toUpperCase();
          if (selectedText.toUpperCase() === extractedLetter || selectedText.toLowerCase().includes(`person ${extractedLetter.toLowerCase()}`)) {
            return true;
          }
        }
      }
    }

    // Case 3: Old format - direct text comparison (for legacy)
    if (answerText) {
      const userText = String(userValue).trim().toLowerCase();
      const correctText = String(answerText).trim().toLowerCase();
      return userText === correctText;
    }

    return false;
  };

  // Sort items by item_order
  const sortedItems = useMemo(() =>
    [...items].sort((a, b) => (a.item_order || 0) - (b.item_order || 0)),
    [items]
  );

  // Parse content and detect matching type
  const { matchingType, instruction, personDescriptions } = useMemo(() => {
    let type = 'person';
    let instr = '';
    let persons = [];

    // Try to parse JSON content first
    try {
      if (contentText && contentText.trim().startsWith('{')) {
        const parsed = JSON.parse(contentText);
        if (parsed.persons) {
          type = 'person';
          instr = parsed.instruction || parsed.instructions || '';
          persons = parsed.persons.map(p => ({
            letter: p.letter || p.name,
            description: p.description || p.text || ''
          }));
          return { matchingType: type, instruction: instr, personDescriptions: persons };
        }
        if (parsed.shortTexts || parsed.texts) {
          type = 'text';
          instr = parsed.instruction || parsed.instructions || 'Match each short text with the correct description.';
          return { matchingType: type, instruction: instr, personDescriptions: persons };
        }
      }
    } catch (e) {
      // Not JSON, continue with text parsing
    }

    // Detect matching type based on content (fallback to text parsing)
    const isTextMatching = contentText.includes('Short Texts:');
    type = isTextMatching ? 'text' : 'person';

    if (type === 'text') {
      // Extract instruction from text content
      const contentLines = contentText.split('\n').filter(line => line && line.trim() !== '');
      for (let i = 0; i < contentLines.length; i++) {
        if (contentLines[i] && contentLines[i].includes('Short Texts:')) {
          instr = contentLines.slice(0, i).join(' ').trim();
          break;
        }
      }
      if (!instr) {
        instr = 'Match each short text with the correct description.';
      }
    } else {
      // Extract person descriptions from text content
      const contentLines = contentText.split('\n').filter(line => line && line.trim() !== '');
      let currentPerson = null;
      let collectingInstruction = true;

      for (const line of contentLines) {
        if (!line) continue;
        const personMatch = line.match(/^Person ([A-Z]):/);
        if (personMatch) {
          collectingInstruction = false;
          if (currentPerson) {
            persons.push(currentPerson);
          }
          currentPerson = {
            letter: personMatch[1],
            description: line.replace(/^Person [A-Z]: /, '')
          };
        } else if (currentPerson && !collectingInstruction) {
          currentPerson.description += ' ' + line.trim();
        } else if (collectingInstruction && line.trim()) {
          instr += line + ' ';
        }
      }

      if (currentPerson) {
        persons.push(currentPerson);
      }

      if (!instr.trim()) {
        instr = 'Four people share their thoughts. Read and match each question with the correct person.';
      }
    }

    return { matchingType: type, instruction: instr.trim(), personDescriptions: persons };
  }, [contentText]);

  // Render Text Matching
  if (matchingType === 'text') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box sx={{ maxWidth: '900px', width: '100%' }}>
          {/* Instructions */}
          <Paper sx={{ p: 3, mb: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
              {instruction}
            </Typography>
          </Paper>

          {/* Text Matching Results */}
          {sortedItems.map((item, index) => {
            const userValue = matches[item.id];
            const isCorrect = checkIsCorrect(userValue, item);
            const userDisplayText = getOptionDisplayText(userValue);
            const correctDisplayText = getCorrectAnswerText(item);

            return (
              <Box key={`text-item-${item.id}`} sx={{ mb: 2 }}>
                <Paper sx={{
                  p: 2,
                  bgcolor: isCorrect ? 'success.50' : (userValue ? 'error.50' : 'grey.50'),
                  border: '1px solid',
                  borderColor: isCorrect ? 'success.main' : (userValue ? 'error.main' : 'grey.300')
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Typography variant="body1" sx={{ flex: 1, minWidth: 300 }}>
                      <strong>Text {index + 1}:</strong> {item.item_text}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: 'white',
                        border: '1px solid #ddd'
                      }}>
                        {userDisplayText}
                      </Typography>
                      {isCorrect ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Cancel color="error" />
                      )}
                    </Box>
                  </Box>

                  {showCorrectAnswer && !isCorrect && correctDisplayText && (
                    <Typography variant="body2" color="success.dark">
                      <strong>Correct answer:</strong> {correctDisplayText}
                    </Typography>
                  )}
                </Paper>
              </Box>
            );
          })}

          {/* Available descriptions */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Available descriptions:
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={1}>
                {options.map((option, index) => (
                  <Grid item xs={12} sm={6} key={option.id}>
                    <Typography variant="body2">
                      {String.fromCharCode(65 + index)}. {option.option_text}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        </Box>
      </Box>
    );
  }

  // Render Person Matching
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Box sx={{ maxWidth: '900px', width: '100%' }}>
        {/* Instructions */}
        <Paper sx={{ p: 3, mb: 2, bgcolor: 'grey.50' }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
            {instruction}
          </Typography>
        </Paper>

        {/* Person Descriptions */}
        {personDescriptions.length > 0 ? (
          personDescriptions.map((person) => (
            <Paper key={`person-${person.letter}`} elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#1976d2' }}>
                Person {person.letter}
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'justify' }}>
                {person.description}
              </Typography>
            </Paper>
          ))
        ) : (
          <Typography color="error" sx={{ mb: 2 }}>
            Không tìm thấy thông tin của các người (Person A, B, C, D).
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Question Matching Results */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Match each question with the correct person:
        </Typography>

        {sortedItems.map((item, index) => {
          const userValue = matches[item.id];
          const isCorrect = checkIsCorrect(userValue, item);
          const userDisplayText = getOptionDisplayText(userValue);
          const correctDisplayText = getCorrectAnswerText(item);

          return (
            <Box key={`question-${item.id}`} sx={{ mb: 2 }}>
              <Paper sx={{
                p: 2,
                bgcolor: isCorrect ? 'success.50' : (userValue ? 'error.50' : 'grey.50'),
                border: '1px solid',
                borderColor: isCorrect ? 'success.main' : (userValue ? 'error.main' : 'grey.300')
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body1" sx={{ flex: 1, minWidth: 300 }}>
                    <strong>{index + 1}.</strong> {item.item_text}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
                    <Typography variant="body2" sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 'white',
                      border: '1px solid #ddd',
                      fontWeight: 600
                    }}>
                      {userDisplayText}
                    </Typography>
                    {isCorrect ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="error" />
                    )}
                  </Box>
                </Box>

                {showCorrectAnswer && !isCorrect && correctDisplayText && (
                  <Typography variant="body2" color="success.dark" sx={{ mt: 1 }}>
                    <strong>Correct answer:</strong> {correctDisplayText}
                  </Typography>
                )}
              </Paper>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}