'use client';

import {
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Box,
  Typography,
  Chip,
  Collapse,
  Paper,
  Divider
} from '@mui/material';
import {
  QuestionAnswer as QuestionIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useState } from 'react';
import QuestionRenderer from './QuestionRenderer';

/**
 * Component để hiển thị câu hỏi trong section với thông tin đầy đủ
 * Có thể expand để xem nội dung chi tiết của câu hỏi
 */
export default function SectionQuestionItem({
  question,
  questionData,
  onRemove,
  removing = false
}) {
  const [expanded, setExpanded] = useState(false);

  // Determine question type for display
  const getQuestionTypeDisplay = () => {
    const type = questionData?.questionType?.code || questionData?.question_type;
    switch (type) {
      case 'READING_GAP_FILL': return 'Gap Filling';
      case 'READING_ORDERING': return 'Ordering';
      case 'READING_MATCHING': return 'Matching';
      case 'READING_MATCHING_HEADINGS': return 'Matching Headings';
      case 'LISTENING_MCQ': return 'Multiple Choice';
      case 'LISTENING_MCQ_MULTI': return 'Multiple Choice (Multi-Questions)';
      case 'LISTENING_MATCHING': return 'Speaker Matching';
      case 'LISTENING_STATEMENT_MATCHING': return 'Statement Matching';
      case 'WRITING_SHORT': return 'Short Response';
      case 'WRITING_FORM': return 'Form Filling';
      case 'WRITING_LONG': return 'Chat Responses';
      case 'WRITING_EMAIL': return 'Email Writing';
      case 'SPEAKING_INTRO': return 'Personal Introduction';
      case 'SPEAKING_DESCRIPTION': return 'Picture Description';
      case 'SPEAKING_COMPARISON': return 'Comparison';
      case 'SPEAKING_DISCUSSION': return 'Topic Discussion';
      default: return type || 'Unknown';
    }
  };

  // Get difficulty color
  const getDifficultyColor = () => {
    const difficulty = questionData?.difficulty;
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  // Get a preview of question content
  const getQuestionPreview = () => {
    let content = questionData?.content;
    if (!content) return 'No content';

    // Parse JSON if needed
    if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content);

        // Handle Multiple Choice Multi-Questions
        if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          const firstQuestion = parsed.questions[0].question;
          const count = parsed.questions.length;
          return `[${count} câu hỏi] ${firstQuestion}`;
        }

        content = parsed.prompt || parsed.passage || parsed.content || content;
      } catch (e) {
        // Keep as string
      }
    }

    // Extract first meaningful line
    const lines = String(content).split('\n').filter(line => line.trim());
    const preview = lines[0] || 'No content';

    return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
  };

  return (
    <>
      <ListItem
        dense
        sx={{
          bgcolor: 'background.paper',
          mb: 1,
          borderRadius: 1,
          border: '1px solid',
          borderColor: expanded ? 'primary.main' : 'divider',
          transition: 'all 0.3s ease'
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          <QuestionIcon
            fontSize="small"
            color={expanded ? 'primary' : 'action'}
          />
        </ListItemIcon>

        <ListItemText
          primary={
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Typography variant="body2" fontWeight={500}>
                Câu {question.question_order}
              </Typography>
              <Chip
                label={getQuestionTypeDisplay()}
                size="small"
                variant="outlined"
                color="primary"
              />
              <Chip
                label={questionData?.difficulty || 'medium'}
                size="small"
                color={getDifficultyColor()}
              />
              <Typography variant="caption" color="text.secondary">
                ID: {question.question_id}
              </Typography>
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="caption" color="primary" fontWeight={500}>
                Điểm tối đa: {question.max_score}
              </Typography>
              {!expanded && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {getQuestionPreview()}
                </Typography>
              )}
            </Box>
          }
        />

        <Box display="flex" alignItems="center" gap={0.5}>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ color: 'text.secondary' }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onRemove(question.id)}
            disabled={removing}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </ListItem>

      {/* Expanded Content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
          <Paper
            sx={{
              p: 2,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle2" color="primary" fontWeight={600}>
                Chi tiết câu hỏi
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Question ID: {question.question_id}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {questionData ? (
              <QuestionRenderer question={questionData} compact={false} />
            ) : (
              <Typography variant="body2" color="error">
                Không thể tải chi tiết câu hỏi
              </Typography>
            )}
          </Paper>
        </Box>
      </Collapse>
    </>
  );
}