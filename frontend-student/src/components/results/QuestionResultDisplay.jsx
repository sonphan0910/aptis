'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, Alert } from '@mui/material';

// Import specialized result components
import MCQQuestionResult from './reading/MCQQuestionResult';
import GapFillingQuestionResult from './reading/GapFillingQuestionResult';
import MatchingQuestionResult from './reading/MatchingQuestionResult';
import MatchingHeadingsQuestionResult from './reading/MatchingHeadingsQuestionResult';
import OrderingQuestionResult from './reading/OrderingQuestionResult';

// Import Writing result components
import WordLevelWritingResult from './writing/WordLevelWritingResult';
import ShortTextWritingResult from './writing/ShortTextWritingResult';
import ChatResponsesWritingResult from './writing/ChatResponsesWritingResult';
import EmailWritingResult from './writing/EmailWritingResult';

// Import Listening result components
import ListeningMCQQuestionResult from './listening/ListeningMCQQuestionResult';
import ListeningMultiMCQQuestionResult from './listening/ListeningMultiMCQQuestionResult';
import ListeningMatchingQuestionResult from './listening/ListeningMatchingQuestionResult';
import ListeningStatementMatchingQuestionResult from './listening/ListeningStatementMatchingQuestionResult';

// Import Speaking result components
import SpeakingQuestionResult from './speaking/SpeakingQuestionResult';

/**
 * Component to display result for a single question based on its type.
 */
export default function QuestionResultDisplayNew({ answer, question, calculatedScore, showCorrectAnswer = true, feedback = null }) {
  // Use provided calculatedScore or fallback to answer score from API
  const questionScore = calculatedScore || {
    score: answer.final_score !== null ? answer.final_score : (answer.score || 0),
    percentage: (() => {
      const actualScore = answer.final_score !== null ? answer.final_score : (answer.score || 0);
      const maxScore = answer.max_score || question.max_score || 1;
      return maxScore > 0 ? (actualScore / maxScore) * 100 : 0;
    })()
  };

  const questionType = question?.question_type?.question_type_name || question?.questionType?.question_type_name || "Unknown";
  const questionCode = (question?.question_type?.code || question?.questionType?.code || "").trim().toUpperCase();

  // Get feedback for this specific question
  const questionFeedback = feedback?.find?.(f => f.question_id === question.id) || feedback;

  useEffect(() => {
    console.log(`[QuestionResultDisplay] Rendering question ${question.id} with code: "${questionCode}"`);
  }, [question.id, questionCode]);

  // Render different question types using specialized components
  const renderQuestionByType = () => {
    const commonProps = {
      answer,
      question,
      showCorrectAnswer,
      feedback: questionFeedback
    };

    // Special case: check if it's a multi-question structure even if code doesn't say so
    const isMultiStructure = (() => {
      if (question?.items && question.items.length > 1) return true;
      try {
        const parsed = typeof question.content === 'string' ? JSON.parse(question.content) : question.content;
        if (parsed && (parsed.questions || parsed.items)) return true;
      } catch (e) { }
      return false;
    })();

    switch (questionCode) {
      // --- Reading ---
      case 'READING_MCQ':
      case 'READING_TRUE_FALSE':
        return <MCQQuestionResult {...commonProps} />;

      case 'READING_GAP_FILLING':
      case 'READING_GAP_FILL':
        return <GapFillingQuestionResult {...commonProps} />;

      case 'READING_MATCHING':
        return <MatchingQuestionResult {...commonProps} />;

      case 'READING_MATCHING_HEADINGS':
        return <MatchingHeadingsQuestionResult {...commonProps} />;

      case 'READING_ORDERING':
        return <OrderingQuestionResult {...commonProps} />;

      // --- Listening ---
      case 'LISTENING_MCQ':
      case 'LISTENING_MCQ_MULTI':
      case 'LISTENING_MULTI_MCQ':
        if (isMultiStructure) {
          return <ListeningMultiMCQQuestionResult {...commonProps} />;
        }
        return <ListeningMCQQuestionResult {...commonProps} />;

      case 'LISTENING_MATCHING':
        return <ListeningMatchingQuestionResult {...commonProps} />;

      case 'LISTENING_STATEMENT_MATCHING':
        return <ListeningStatementMatchingQuestionResult {...commonProps} />;

      // --- Writing ---
      case 'WRITING_SHORT':
        return <WordLevelWritingResult {...commonProps} />;

      case 'WRITING_FORM':
        return <ShortTextWritingResult {...commonProps} />;

      case 'WRITING_LONG':
        return <ChatResponsesWritingResult {...commonProps} />;

      case 'WRITING_EMAIL':
        return <EmailWritingResult {...commonProps} />;

      // --- Speaking ---
      case 'SPEAKING_INTRO':
      case 'SPEAKING_DESCRIPTION':
      case 'SPEAKING_COMPARISON':
      case 'SPEAKING_DISCUSSION':
        return <SpeakingQuestionResult {...commonProps} />;

      default:
        // Try to guess by skill or structure if code is unrecognized
        if (isMultiStructure && questionCode.startsWith('LISTENING')) {
          return <ListeningMultiMCQQuestionResult {...commonProps} />;
        }

        return (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Question type "{questionCode}" not yet supported in results display.
            <br />
            <Typography variant="caption" component="div" sx={{ mt: 1, color: 'text.secondary' }}>
              Skill: {question?.questionType?.skillType?.skill_type_name || 'N/A'} | ID: {question.id}
            </Typography>
            <Box sx={{ mt: 1, maxHeight: '100px', overflow: 'auto', bgcolor: 'rgba(0,0,0,0.05)', p: 1, borderRadius: 1 }}>
              <code>Content: {typeof question.content === 'object' ? JSON.stringify(question.content) : question.content}</code>
            </Box>
          </Alert>
        );
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        {/* Question Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#002E5C' }}>
              Question: {question.code || questionType}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={questionType} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
              <Chip
                label={`${Number(questionScore.score || 0).toFixed(2)}/${answer.max_score || question.max_score || 1}`}
                size="small"
                color="primary"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label={`${Math.round(questionScore.percentage)}%`}
                size="small"
                color={questionScore.percentage >= 80 ? 'success' : questionScore.percentage >= 50 ? 'warning' : 'error'}
                sx={{ fontWeight: 700 }}
              />
            </Box>
          </Box>
        </Box>

        {/* Question Content */}
        {renderQuestionByType()}

        {/* Score Details/Feedback */}
        {questionScore.details && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid #eee' }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>Score Details:</Typography>
            <Typography variant="body2" color="text.secondary">
              {typeof questionScore.details === 'string' ? questionScore.details : JSON.stringify(questionScore.details)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}