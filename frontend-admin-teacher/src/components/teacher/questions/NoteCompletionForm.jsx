'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Grid
} from '@mui/material';
import { Add, Delete, AudioFile } from '@mui/icons-material';

export default function NoteCompletionForm({ content, onChange }) {
  const [noteTemplate, setNoteTemplate] = useState(() => {
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content || '{}') : content;
      return parsed.noteTemplate || '';
    } catch {
      return '';
    }
  });

  const [gaps, setGaps] = useState(() => {
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content || '{}') : content;
      return parsed.gaps || [{ position: 1, answer: '' }];
    } catch {
      return [{ position: 1, answer: '' }];
    }
  });

  const [instructions, setInstructions] = useState(() => {
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content || '{}') : content;
      return parsed.instructions || '';
    } catch {
      return '';
    }
  });

  const updateContent = (newTemplate, newGaps, newInstructions) => {
    const questionData = {
      noteTemplate: newTemplate,
      gaps: newGaps,
      instructions: newInstructions
    };
    onChange(JSON.stringify(questionData));
  };

  const handleTemplateChange = (value) => {
    setNoteTemplate(value);
    updateContent(value, gaps, instructions);
  };

  const handleInstructionsChange = (value) => {
    setInstructions(value);
    updateContent(noteTemplate, gaps, value);
  };

  const handleGapChange = (index, field, value) => {
    const newGaps = [...gaps];
    newGaps[index][field] = value;
    setGaps(newGaps);
    updateContent(noteTemplate, newGaps, instructions);
  };

  const addGap = () => {
    const newGaps = [...gaps, { position: gaps.length + 1, answer: '' }];
    setGaps(newGaps);
    updateContent(noteTemplate, newGaps, instructions);
  };

  const removeGap = (index) => {
    if (gaps.length > 1) {
      const newGaps = gaps.filter((_, i) => i !== index);
      // Re-number positions
      newGaps.forEach((gap, i) => {
        gap.position = i + 1;
      });
      setGaps(newGaps);
      updateContent(noteTemplate, newGaps, instructions);
    }
  };

  return (
    <Box>
      {/* Instructions */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Hướng dẫn làm bài
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Hướng dẫn"
          value={instructions}
          onChange={(e) => handleInstructionsChange(e.target.value)}
          placeholder="Ví dụ: Nghe đoạn ghi âm và điền thông tin vào chỗ trống trong ghi chú..."
        />
      </Box>

      {/* Note Template */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Mẫu ghi chú
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Sử dụng [1], [2], [3]... để đánh dấu vị trí chỗ trống
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={8}
          label="Mẫu ghi chú"
          value={noteTemplate}
          onChange={(e) => handleTemplateChange(e.target.value)}
          placeholder={`Meeting Notes
Date: [1]
Attendees: [2] and [3]
Topic: [4]
Key Points:
- Budget for next quarter: $[5]
- Deadline: [6]
Action Items:
- [7] will prepare the report
- Meeting follow-up: [8]`}
        />
      </Box>

      {/* Gap Answers */}
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Đáp án cho chỗ trống ({gaps.length} chỗ trống)
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addGap}
            size="small"
          >
            Thêm chỗ trống
          </Button>
        </Box>

        <Grid container spacing={2}>
          {gaps.map((gap, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Chỗ trống [{gap.position}]
                  </Typography>
                  {gaps.length > 1 && (
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => removeGap(index)}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>

                <TextField
                  fullWidth
                  label={`Đáp án cho [${gap.position}]`}
                  value={gap.answer}
                  onChange={(e) => handleGapChange(index, 'answer', e.target.value)}
                  placeholder="Nhập đáp án..."
                  size="small"
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Audio Note */}
      <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <AudioFile />
          <Typography variant="body2">
            <strong>Lưu ý:</strong> Bạn cần cung cấp file audio trong phần "URL Media" ở trên
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}