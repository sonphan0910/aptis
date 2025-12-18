'use client';

import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import MCQQuestion from './MCQQuestion';
import MatchingQuestion from './MatchingQuestion';
import GapFillingQuestion from './GapFillingQuestion';
import OrderingQuestion from './OrderingQuestion';
import WritingQuestion from './WritingQuestion';
import SpeakingQuestion from './SpeakingQuestion';

export default function QuestionDisplay({ 
  question, 
  answer, 
  onAnswerChange, 
  questionNumber, 
  totalQuestions,
  attemptId
}) {
  console.log('[QuestionDisplay] Rendering question:', {
    id: question?.id,
    content: question?.content?.substring(0, 50),
    questionType: question?.questionType?.code,
    optionsCount: question?.options?.length
  });

  if (!question) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Không tìm thấy câu hỏi</Typography>
      </Box>
    );
  }

  const getQuestionTypeLabel = (code) => {
    const typeNameMap = {
      'GV_MCQ': 'Multiple Choice',
      'GV_GAP_FILL': 'Gap Filling',
      'GV_MATCHING': 'Matching',
      'READING_MCQ': 'Multiple Choice',
      'READING_TRUE_FALSE': 'True/False',
      'READING_MATCHING': 'Matching Headings',
      'READING_SHORT_ANSWER': 'Short Answer',
      'LISTENING_MCQ': 'Multiple Choice',
      'LISTENING_GAP_FILL': 'Gap Filling',
      'LISTENING_MATCHING': 'Matching',
      'LISTENING_NOTE_COMPLETION': 'Note Completion',
      'WRITING_SHORT': 'Short Writing',
      'WRITING_LONG': 'Long Writing',
      'WRITING_EMAIL': 'Email Writing',
      'WRITING_ESSAY': 'Essay Writing',
      'SPEAKING_INTRO': 'Personal Introduction',
      'SPEAKING_DESCRIPTION': 'Picture Description',
      'SPEAKING_COMPARISON': 'Comparison',
      'SPEAKING_DISCUSSION': 'Topic Discussion',
    };
    return typeNameMap[code] || code;
  };

  const renderQuestionContent = () => {
    // Merge answer data into question for component consumption
    const questionData = {
      ...question,
      answer_data: answer?.answer_data || null
    };

    console.log('[QuestionDisplay] Rendering with answer data:', {
      questionId: question.id,
      hasAnswer: !!answer,
      answerData: answer?.answer_data,
      mergedQuestionData: questionData.answer_data
    });

    const questionTypeCode = question.questionType?.code || 'MCQ';
    
    console.log('[QuestionDisplay] Question type:', questionTypeCode);
    console.log('[QuestionDisplay] Full question data:', question);

    // Map database codes to component types
    const getQuestionType = (code) => {
      const typeMap = {
        // Grammar & Vocabulary
        'GV_MCQ': 'mcq',
        'GV_GAP_FILL': 'gap_filling',
        'GV_MATCHING': 'matching',
        
        // Reading
        'READING_MCQ': 'mcq',
        'READING_TRUE_FALSE': 'mcq', // use MCQ component for true/false
        'READING_MATCHING': 'matching',
        'READING_SHORT_ANSWER': 'writing', // use writing component for short answers
        
        // Listening
        'LISTENING_MCQ': 'mcq',
        'LISTENING_GAP_FILL': 'gap_filling',
        'LISTENING_MATCHING': 'matching',
        'LISTENING_NOTE_COMPLETION': 'gap_filling', // use gap filling for note completion
        
        // Writing
        'WRITING_SHORT': 'writing',
        'WRITING_LONG': 'writing',
        'WRITING_EMAIL': 'writing',
        'WRITING_ESSAY': 'writing',
        
        // Speaking
        'SPEAKING_INTRO': 'speaking',
        'SPEAKING_DESCRIPTION': 'speaking',
        'SPEAKING_COMPARISON': 'speaking',
        'SPEAKING_DISCUSSION': 'speaking',
        
        // Legacy/fallback mappings
        'MCQ': 'mcq',
        'MATCHING': 'matching',
        'GAP_FILLING': 'gap_filling',
        'ORDERING': 'ordering',
        'WRITING': 'writing',
        'SPEAKING': 'speaking'
      };
      return typeMap[code] || 'mcq'; // default to mcq
    };

    const mappedType = getQuestionType(questionTypeCode);
    console.log('[QuestionDisplay] Mapped type:', mappedType);

    switch (mappedType) {
      case 'mcq':
        return (
          <MCQQuestion
            question={questionData}
            onAnswerChange={onAnswerChange}
          />
        );
      case 'matching':
        return (
          <MatchingQuestion
            question={questionData}
            onAnswerChange={onAnswerChange}
          />
        );
      case 'gap_filling':
        return (
          <GapFillingQuestion
            question={questionData}
            onAnswerChange={onAnswerChange}
          />
        );
      case 'ordering':
        return (
          <OrderingQuestion
            question={questionData}
            onAnswerChange={onAnswerChange}
          />
        );
      case 'writing':
        return (
          <WritingQuestion
            question={questionData}
            onAnswerChange={onAnswerChange}
          />
        );
      case 'speaking':
        return (
          <SpeakingQuestion
            question={{...questionData, attemptId}}
            onAnswerChange={onAnswerChange}
          />
        );
      default:
        return (
          <Typography color="error">
            Loại câu hỏi không được hỗ trợ: {questionTypeCode} (mapped to: {mappedType})
          </Typography>
        );
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Question Header */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Câu {questionNumber}
        </Typography>
        <Box display="flex" gap={1}>
          <Chip 
            label={getQuestionTypeLabel(question.questionType?.code || 'UNKNOWN')} 
            size="small" 
            variant="outlined"
            color="primary"
          />
          <Chip 
            label={`${question.max_score || 1} điểm`} 
            size="small" 
            color="success"
            variant="filled"
          />
        </Box>
      </Box>

      {/* Question Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Instructions */}
        {question.questionType?.instruction_template && (
          <Card variant="outlined" sx={{ mb: 2, backgroundColor: 'info.light', color: 'info.contrastText' }}>
            <CardContent sx={{ py: 1 }}>
              <Typography variant="body2">
                <strong>Hướng dẫn:</strong> {question.questionType.instruction_template}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Question Text */}
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
          {question.content}
        </Typography>

        {/* Question Content based on type */}
        {renderQuestionContent()}
      </Box>
    </Box>
  );
}