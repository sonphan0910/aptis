/**
 * Question Format Components
 * Components để format hiển thị các loại câu hỏi khác nhau
 */

import React from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  List, 
  ListItem, 
  ListItemText,
  Paper,
  Divider 
} from '@mui/material';

// Format Reading Gap Fill Questions
export const ReadingGapFillDisplay = ({ questionContent }) => {
  let content;
  try {
    content = typeof questionContent === 'string' ? JSON.parse(questionContent) : questionContent;
  } catch {
    content = { passage: questionContent || 'Invalid content', options: [] };
  }

  return (
    <Box>
      <Typography variant="subtitle2" color="primary" gutterBottom>
        Reading - Gap Filling
      </Typography>
      {content.prompt && (
        <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
          {content.prompt}
        </Typography>
      )}
      <Paper variant="outlined" sx={{ p: 2, mb: 1, bgcolor: 'grey.50' }}>
        <Typography variant="body2" style={{ lineHeight: 1.6 }}>
          {content.passage?.substring(0, 200)}
          {content.passage?.length > 200 && '...'}
        </Typography>
      </Paper>
      {content.options && content.options.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Options: {content.options.join(', ')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// Format Reading Ordering Questions  
export const ReadingOrderingDisplay = ({ questionContent }) => {
  let content;
  try {
    content = typeof questionContent === 'string' ? JSON.parse(questionContent) : questionContent;
  } catch {
    content = { title: 'Invalid content', sentences: [] };
  }

  return (
    <Box>
      <Typography variant="subtitle2" color="primary" gutterBottom>
        Reading - Ordering
      </Typography>
      <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
        {content.title}
      </Typography>
      {content.passage && (
        <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
          {content.passage}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary">
        {content.sentences?.length || 0} sentences to order
      </Typography>
    </Box>
  );
};

// Format Reading Matching Questions
export const ReadingMatchingDisplay = ({ questionContent }) => {
  const content = typeof questionContent === 'string' ? questionContent : JSON.stringify(questionContent);
  
  return (
    <Box>
      <Typography variant="subtitle2" color="primary" gutterBottom>
        Reading - Matching
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 1, bgcolor: 'grey.50' }}>
        <Typography variant="body2" style={{ lineHeight: 1.6 }}>
          {content.substring(0, 150)}
          {content.length > 150 && '...'}
        </Typography>
      </Paper>
      <Typography variant="caption" color="text.secondary">
        Person-based matching question
      </Typography>
    </Box>
  );
};

// Format Reading Matching Headings Questions
export const ReadingMatchingHeadingsDisplay = ({ questionContent }) => {
  let content;
  try {
    content = typeof questionContent === 'string' ? JSON.parse(questionContent) : questionContent;
  } catch {
    content = { title: 'Invalid content', instructions: questionContent || 'No content' };
  }

  return (
    <Box>
      <Typography variant="subtitle2" color="primary" gutterBottom>
        Reading - Matching Headings
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {content.title || content.instructions?.substring(0, 100) || 'Heading matching question'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Match paragraphs with appropriate headings
      </Typography>
    </Box>
  );
};

// Format Listening MCQ Questions
export const ListeningMCQDisplay = ({ questionContent }) => {
  let content;
  try {
    content = typeof questionContent === 'string' ? JSON.parse(questionContent) : questionContent;
  } catch {
    content = { title: 'Invalid content', question: questionContent || 'No content' };
  }

  return (
    <Box>
      <Typography variant="subtitle2" color="primary" gutterBottom>
        Listening - MCQ
      </Typography>
      <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
        {content.title || content.summary || 'Listening MCQ Question'}
      </Typography>
      {content.question && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {content.question.substring(0, 100)}
          {content.question.length > 100 && '...'}
        </Typography>
      )}
      {content.options && (
        <Typography variant="caption" color="text.secondary">
          {content.options.length} options available
        </Typography>
      )}
    </Box>
  );
};

// Format Listening Matching Questions
export const ListeningMatchingDisplay = ({ questionContent }) => {
  let content;
  try {
    content = typeof questionContent === 'string' ? JSON.parse(questionContent) : questionContent;
  } catch {
    content = { title: 'Invalid content', type: 'listening_matching' };
  }

  return (
    <Box>
      <Typography variant="subtitle2" color="primary" gutterBottom>
        Listening - Speaker Matching
      </Typography>
      <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
        {content.title || 'Speaker Matching Exercise'}
      </Typography>
      {content.speakers && (
        <Typography variant="caption" color="text.secondary">
          {content.speakers.length} speakers, {content.statements?.length || 0} statements
        </Typography>
      )}
    </Box>
  );
};

// Format Writing Questions
export const WritingTaskDisplay = ({ questionContent }) => {
  let content;
  try {
    content = typeof questionContent === 'string' ? JSON.parse(questionContent) : questionContent;
  } catch {
    content = { title: 'Writing Task', task: questionContent || 'Invalid content' };
  }

  return (
    <Box>
      <Typography variant="subtitle2" color="primary" gutterBottom>
        Writing Task
      </Typography>
      <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
        {content.title || content.task_type || 'Writing Exercise'}
      </Typography>
      {content.prompt && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {content.prompt.substring(0, 100)}
          {content.prompt.length > 100 && '...'}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary">
        {content.word_limit ? `${content.word_limit} words` : 'Word limit varies'}
      </Typography>
    </Box>
  );
};

// Format Speaking Questions  
export const SpeakingTaskDisplay = ({ questionContent }) => {
  let content;
  try {
    content = typeof questionContent === 'string' ? JSON.parse(questionContent) : questionContent;
  } catch {
    content = { title: 'Speaking Task', task: questionContent || 'Invalid content' };
  }

  return (
    <Box>
      <Typography variant="subtitle2" color="primary" gutterBottom>
        Speaking Task
      </Typography>
      <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
        {content.title || content.task_type || 'Speaking Exercise'}
      </Typography>
      {content.prompt && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {content.prompt.substring(0, 100)}
          {content.prompt.length > 100 && '...'}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary">
        Duration: {content.time_limit || 'Variable'} | Level: {content.cefr_level || 'Mixed'}
      </Typography>
    </Box>
  );
};

// Main Question Display Component
export const QuestionDisplayFormatter = ({ question, questionType }) => {
  if (!question) {
    return (
      <Typography variant="body2" color="error">
        Question data not available
      </Typography>
    );
  }

  // Determine question type from various sources
  const getQuestionType = () => {
    if (questionType) return questionType;
    if (question.questionType?.code) return question.questionType.code;
    if (question.Question?.questionType?.code) return question.Question.questionType.code;
    
    // Try to parse content to determine type
    try {
      const content = typeof question.content === 'string' ? JSON.parse(question.content) : question.content;
      if (content.type) return content.type;
    } catch {}
    
    return 'unknown';
  };

  const type = getQuestionType().toLowerCase();
  const content = question.content || question.Question?.content;

  // Route to appropriate display component
  if (type.includes('gap_fill') || type.includes('gap-fill')) {
    return <ReadingGapFillDisplay questionContent={content} />;
  }
  if (type.includes('ordering')) {
    return <ReadingOrderingDisplay questionContent={content} />;
  }
  if (type.includes('matching_headings')) {
    return <ReadingMatchingHeadingsDisplay questionContent={content} />;
  }
  if (type.includes('matching') && type.includes('reading')) {
    return <ReadingMatchingDisplay questionContent={content} />;
  }
  if (type.includes('listening') && type.includes('mcq')) {
    return <ListeningMCQDisplay questionContent={content} />;
  }
  if (type.includes('listening') && type.includes('matching')) {
    return <ListeningMatchingDisplay questionContent={content} />;
  }
  if (type.includes('writing')) {
    return <WritingTaskDisplay questionContent={content} />;
  }
  if (type.includes('speaking')) {
    return <SpeakingTaskDisplay questionContent={content} />;
  }

  // Fallback for unknown types
  return (
    <Box>
      <Typography variant="subtitle2" color="primary" gutterBottom>
        {type.toUpperCase()} Question
      </Typography>
      <Typography variant="body2">
        {typeof content === 'string' ? content.substring(0, 150) : JSON.stringify(content).substring(0, 150)}
        {(typeof content === 'string' ? content.length : JSON.stringify(content).length) > 150 && '...'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Question type: {type}
      </Typography>
    </Box>
  );
};