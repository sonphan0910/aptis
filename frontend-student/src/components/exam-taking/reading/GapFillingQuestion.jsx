'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';

export default function ReadingGapFillingQuestion({ question, onAnswerChange }) {
  const [gaps, setGaps] = useState({});

  // Parse content and handle JSON data if necessary
  const { displayContent, displayItems, displayOptions } = useMemo(() => {
    let content = question.content || '';
    let items = question.items || [];
    let options = question.options || [];

    // Try to parse content if it's JSON
    try {
      if (content && (content.trim().startsWith('{') || content.trim().startsWith('['))) {
        const parsed = JSON.parse(content);
        if (parsed.passage) {
          content = parsed.passage;

          // If items are missing from the question object but present in JSON (via correctAnswers)
          if (items.length === 0 && (parsed.correctAnswers || parsed.options)) {
            const count = parsed.correctAnswers ? parsed.correctAnswers.length :
              (content.match(/\[GAP\d+\]/g) || []).length;

            items = Array.from({ length: count }, (_, i) => ({
              id: `gap-${i + 1}`,
              item_number: i + 1,
              item_order: i + 1
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
      console.log('[ReadingGapFillingQuestion] Content is not JSON or missing passage field');
    }

    return { displayContent: content, displayItems: items, displayOptions: options };
  }, [question.content, question.items, question.options]);

  // Initialize from existing answer or create empty gaps
  useEffect(() => {
    const initialGaps = {};

    // Initialize empty gaps for all items
    if (displayItems && displayItems.length > 0) {
      displayItems.forEach(item => {
        initialGaps[item.id] = '';
      });
    }

    // Overlay existing answer if available
    if (question.answer_data?.answer_json) {
      try {
        const parsedData = JSON.parse(question.answer_data.answer_json);
        if (parsedData.gaps) {
          setGaps({ ...initialGaps, ...parsedData.gaps });
          return;
        }
      } catch (error) {
        console.error('[ReadingGapFillingQuestion] Error parsing answer_json:', error);
      }
    }

    setGaps(initialGaps);
  }, [question.id, question.answer_data?.answer_json, displayItems]);

  const handleGapChange = (itemId, optionId) => {
    const newGaps = { ...gaps, [itemId]: optionId };
    setGaps(newGaps);

    onAnswerChange({
      answer_type: 'json',
      answer_json: JSON.stringify({ gaps: newGaps })
    });
  };

  if (!displayContent) {
    return (
      <Typography color="error">
        Dữ liệu câu hỏi không đầy đủ.
      </Typography>
    );
  }

  // Parse content and replace [GAP1], [GAP2], etc. with dropdowns
  const renderContent = () => {
    let content = displayContent;
    const parts = [];
    let lastIndex = 0;

    if (!displayItems || displayItems.length === 0) {
      console.warn('[ReadingGapFillingQuestion] No items found');
      return content;
    }

    // Sort items by item_number if available, otherwise by item_order
    const sortedItems = [...displayItems].sort((a, b) => {
      const aNum = a.item_number || a.item_order || 0;
      const bNum = b.item_number || b.item_order || 0;
      return aNum - bNum;
    });

    sortedItems.forEach((item, index) => {
      // Try both item_number and index-based gap patterns
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

        // Add dropdown for gap
        parts.push(
          <FormControl
            key={`gap-${item.id}-${index}`}
            size="small"
            sx={{
              mx: 0.5,
              minWidth: 120,
              display: 'inline-flex',
              verticalAlign: 'middle'
            }}
          >
            <Select
              value={gaps[item.id] || ''}
              onChange={(e) => handleGapChange(item.id, e.target.value)}
              displayEmpty
              sx={{
                minWidth: 140,
                fontSize: '0.95rem',
                backgroundColor: gaps[item.id] ? '#e3f2fd' : 'white',
                '& .MuiSelect-select': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: gaps[item.id] ? 600 : 400
                }
              }}
            >
              <MenuItem value="">
                <em>-- Chọn từ --</em>
              </MenuItem>
              {displayOptions && displayOptions.length > 0 ? (
                displayOptions.map((option) => (
                  <MenuItem key={`opt-${option.id}`} value={option.option_text}>
                    {option.option_text}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="no-options" disabled>
                  <em>Không có từ nào</em>
                </MenuItem>
              )}
            </Select>
          </FormControl>
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

    // If no parts were generated, return the original content
    if (parts.length === 0) {
      return content;
    }

    return parts;
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 2 }}>
      <Box sx={{ maxWidth: '850px', width: '100%' }}>
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
          {renderContent()}
        </Typography>
      </Box>
    </Box>
  );
}

