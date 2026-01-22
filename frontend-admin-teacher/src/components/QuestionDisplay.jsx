'use client';

import { Box, Typography, Paper } from '@mui/material';
import WritingQuestionDisplay from './WritingQuestionDisplay';
import ReadingQuestionDisplay from './ReadingQuestionDisplay';
import ListeningQuestionDisplay from './ListeningQuestionDisplay';
import SpeakingQuestionDisplay from './SpeakingQuestionDisplay';
import DetailedQuestionRenderer from './DetailedQuestionRenderer';

/**
 * Component hiển thị câu hỏi theo từng loại
 */
export default function QuestionDisplay({ question, answer }) {
  if (!question) {
    return (
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body1" color="text.secondary">
          Không có nội dung câu hỏi
        </Typography>
      </Box>
    );
  }

  // Sử dụng DetailedQuestionRenderer để hiển thị chính xác từng loại câu hỏi
  return <DetailedQuestionRenderer question={question} answer={answer} />;
}