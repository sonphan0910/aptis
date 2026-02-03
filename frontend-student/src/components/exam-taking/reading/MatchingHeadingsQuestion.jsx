'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Paper,
  Divider
} from '@mui/material';

export default function ReadingMatchingHeadingsQuestion({ question, onAnswerChange }) {
  const [matches, setMatches] = useState({});

  // Initialize from existing answer or create empty matches
  useEffect(() => {
    if (question.answer_data?.answer_json) {
      try {
        const parsedData = JSON.parse(question.answer_data.answer_json);
        if (parsedData.matches) {
          setMatches(parsedData.matches);
          return;
        }
      } catch (error) {
        console.error('[ReadingMatchingHeadingsQuestion] Error parsing answer_json:', error);
      }
    }

    // Initialize empty matches
    if (question.items) {
      const initialMatches = {};
      question.items.forEach(item => {
        initialMatches[item.id] = '';
      });
      setMatches(initialMatches);
    }
  }, [question.id, question.answer_data?.answer_json, question.items]);

  const handleMatchChange = (itemId, optionId) => {
    const newMatches = { ...matches, [itemId]: optionId };
    setMatches(newMatches);

    onAnswerChange({
      answer_type: 'json',
      answer_json: JSON.stringify({ matches: newMatches })
    });
  };

  // Helper to get display text for a selected option ID
  const getOptionDisplayText = (optionId) => {
    if (!optionId) return '';
    const option = question.options.find(opt => opt.id === optionId || opt.id === parseInt(optionId));
    return option ? option.option_text : '';
  };

  if (!question.content || !question.items || !question.options) {
    return (
      <Typography color="error">
        Dữ liệu câu hỏi không đầy đủ.
      </Typography>
    );
  }

  console.log('[ReadingMatchingHeadingsQuestion] Debug data:', {
    items: question.items,
    options: question.options,
    content: question.content
  });

  // Parse content to extract main content and paragraph sections
  let instructionText = '';
  // eslint-disable-next-line no-unused-vars
  let availableHeadingsList = []; // Used for debugging or extra display if needed
  let paragraphSections = [];

  // STRATEGY 1: Parse JSON content (New format)
  let isJsonParsed = false;
  try {
    if (question.content && (question.content.trim().startsWith('{') || question.content.trim().startsWith('['))) {
      const parsedContent = JSON.parse(question.content);

      // Support both 'paragraphs' and 'passages' keys for flexibility
      const rawParagraphs = parsedContent.paragraphs || parsedContent.passages;

      if (rawParagraphs && Array.isArray(rawParagraphs)) {
        console.log('[ReadingMatchingHeadingsQuestion] JSON content detected');
        instructionText = parsedContent.instructions || parsedContent.instruction || 'Read the passage quickly. Choose a heading for each numbered paragraph from the drop-down box.';

        paragraphSections = rawParagraphs.map((p, index) => ({
          number: p.title ? p.title.replace(/PARAGRAPH\s*/i, '') : (index + 1).toString(),
          content: [p.text || '']
        }));

        isJsonParsed = true;
      }
    }
  } catch (error) {
    console.log('[ReadingMatchingHeadingsQuestion] JSON parse failed, fallback to text:', error);
  }

  // STRATEGY 2: Legacy Text Parsing
  // STRATEGY 2: Legacy Text Parsing
  if (!isJsonParsed) {
    console.log('[ReadingMatchingHeadingsQuestion] Using legacy text parsing');
    const contentLines = question.content ? question.content.split('\n') : [];

    // 2.1 Determine Instruction & Heading Boundaries
    const instructionEndIndex = contentLines.findIndex(line => line && line.includes('Available Headings:'));

    // 2.2 Find where paragraphs likely start (look for explicit markers or patterns)
    // Markers: "PARAGRAPH", "Paragraph 1:", "1.", or digit-only lines
    const paragraphStartIndex = contentLines.findIndex((line, idx) => {
      if (!line) return false;
      if (instructionEndIndex !== -1 && idx <= instructionEndIndex) return false; // Must be after instructions
      const trimmed = line.trim();
      return trimmed.startsWith('PARAGRAPH') || trimmed.match(/^Paragraph\s+\d+[:.]?$/i);
    });

    // Set Instruction Text
    if (instructionEndIndex !== -1) {
      instructionText = contentLines.slice(0, instructionEndIndex).join('\n');
    } else {
      // If no explicit header, assume first few lines are instruction
      instructionText = 'Read the passage and match headings.';
    }

    // 2.3 Extract paragraph content
    let currentParagraph = null;
    let foundExplicitMarker = false;

    // Start scanning from where we think paragraphs start, or after instructions
    const scanStartIdx = paragraphStartIndex !== -1 ? paragraphStartIndex : (instructionEndIndex !== -1 ? instructionEndIndex + 1 : 0);

    for (let i = scanStartIdx; i < contentLines.length; i++) {
      const line = contentLines[i];
      if (!line) continue;

      const trimmedLine = line.trim();

      // Check for markers
      // Regex: Starts with "PARAGRAPH X", "Paragraph X:", or just number like "1." (if confident)
      const markerMatch = trimmedLine.match(/^(?:PARAGRAPH|Paragraph)\s+(\d+)(?:\.|:)?$/i);

      if (markerMatch) {
        if (currentParagraph) {
          paragraphSections.push(currentParagraph);
        }
        currentParagraph = {
          number: markerMatch[1],
          content: []
        };
        foundExplicitMarker = true;
      } else if (currentParagraph) {
        currentParagraph.content.push(line);
      } else if (!paragraphStartIndex && !foundExplicitMarker) {
        // If we haven't found ANY marker yet, and we are ignoring the instruction block, 
        // we might be in "orphan text" mode.
        // Let's verify later.
      }
    }

    if (currentParagraph) {
      paragraphSections.push(currentParagraph);
    }

    // STRATEGY 3: Ultimate Fallback (If no sections found but we have items)
    if (paragraphSections.length === 0 && question.items && question.items.length > 0) {
      console.log('[ReadingMatchingHeadingsQuestion] Fallback: No markers found. assigning text to items.');

      // Gather all remaining text after instruction/headings
      let bodyLines = [];
      if (instructionEndIndex !== -1) {
        // Skip headings list (heuristic: usually ~5-10 lines after "Available Headings")
        // Here we just skip untill we see non-list item or end of file
        // Simple hack: Skip 10 lines max after header
        const skipCount = (question.options ? question.options.length : 0) + 2;
        bodyLines = contentLines.slice(Math.min(contentLines.length, instructionEndIndex + skipCount));
      } else {
        bodyLines = contentLines;
      }

      const fullBodyText = bodyLines.join('\n').trim() || '(No text content found)';

      // Assign full text to Paragraph 1, and make others "See above"
      // This ensures the user sees SOMETHING and has dropdowns
      question.items.forEach((item, idx) => {
        paragraphSections.push({
          number: (idx + 1).toString(),
          content: idx === 0 ? [fullBodyText] : ['(See text above)']
        });
      });
    }
  }

  const availableHeadings = question.options ? question.options.map(option => option.option_text) : [];

  // Sort items by item_order to match paragraph order
  const sortedItems = [...question.items].sort((a, b) => a.item_order - b.item_order);

  return (
    <Box>
      {/* Instructions */}
      <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
        {instructionText}
      </Typography>

      {/* Paragraphs with Dropdown Selections */}
      {paragraphSections.map((paragraph, index) => {
        const correspondingItem = sortedItems[index];
        if (!correspondingItem) return null;

        return (
          <Paper key={`paragraph-${paragraph.number}`} elevation={1} sx={{ p: 2, mb: 2 }}>
            {/* Paragraph Header with Dropdown */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ mr: 2, minWidth: 100 }}>
                Paragraph {paragraph.number}:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 300 }}>
                <Select
                  value={matches[correspondingItem.id] || ''}
                  onChange={(e) => handleMatchChange(correspondingItem.id, e.target.value)}
                  displayEmpty
                  renderValue={(selected) => selected ? getOptionDisplayText(selected) : <em>-- Chọn heading --</em>}
                  sx={{
                    backgroundColor: matches[correspondingItem.id] ? '#e3f2fd' : 'white',
                    '& .MuiSelect-select': {
                      fontWeight: matches[correspondingItem.id] ? 600 : 400
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>-- Chọn heading --</em>
                  </MenuItem>
                  {question.options.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.option_text}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Paragraph Content */}
            <Typography variant="body1" sx={{ lineHeight: 1.8, textAlign: 'justify' }}>
              {paragraph.content.join(' ')}
            </Typography>
          </Paper>
        );
      })}

      {/* Available Headings List (moved below paragraphs) */}
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

      {/* Summary */}
      <Divider sx={{ my: 2 }} />
      <Typography variant="body2" color="text.secondary">
        Hoàn thành {Object.values(matches).filter(Boolean).length}/{sortedItems.length} paragraphs
      </Typography>
    </Box>
  );
}
