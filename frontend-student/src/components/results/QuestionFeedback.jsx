'use client';

import { useState } from 'react';
import { getAssetUrl } from '@/services/api';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Cancel,
  HelpOutline,
  FeedbackOutlined,
} from '@mui/icons-material';

export default function QuestionFeedback({ questionResults }) {
  const [expandedPanel, setExpandedPanel] = useState(false);

  const handlePanelChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const groupQuestionsBySection = () => {
    const grouped = {};
    (questionResults || []).forEach((answer) => {
      const question = answer.question;
      if (question) {
        const sectionName = answer.attemptSection?.examSection?.skillType?.skill_type_name || 'Other';
        if (!grouped[sectionName]) {
          grouped[sectionName] = [];
        }
        grouped[sectionName].push(answer);
      }
    });
    return grouped;
  };

  const groupedQuestions = groupQuestionsBySection();

  // Check if questionResults is empty
  if (!questionResults || questionResults.length === 0) {
    return (
      <Box>
        <Alert severity="info">
          Dữ liệu chi tiết câu hỏi sẽ được cập nhật sau. Hiện tại bạn có thể xem điểm tổng quan ở tab "Tổng quan".
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {Object.entries(groupedQuestions).map(([section, answers]) => (
        <Accordion
          key={section}
          expanded={expandedPanel === section}
          onChange={handlePanelChange(section)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls={`${section}-content`}
            id={`${section}-header`}
          >
            <Typography variant="subtitle1">
              {section}
            </Typography>
          </AccordionSummary>
          
          <AccordionDetails>
            <Grid container spacing={2}>
              {answers.map((answer, index) => {
                const question = answer.question || {};
                const hasAiFeedback = answer.aiFeedbacks && answer.aiFeedbacks.length > 0;
                const score = answer.final_score !== null ? answer.final_score : answer.score || 0;
                const maxScore = answer.max_score || 1; // Use answer.max_score, not question.max_score
                const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

                return (
                  <Grid item xs={12} key={answer.id}>
                    <Card variant="outlined">
                      <CardContent>
                        {/* Question Header */}
                        <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Câu {index + 1}: {question.code || question.question_type?.question_type_name || 'Câu hỏi'}
                              </Typography>
                              <Chip
                                label={`${score}/${maxScore}`}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                              <Chip
                                label={`${percentage}%`}
                                size="small"
                                variant="filled"
                                color={percentage >= 70 ? 'success' : percentage >= 50 ? 'warning' : 'error'}
                              />
                            </Box>
                            
                            <Typography variant="body2" paragraph sx={{ mt: 1, mb: 0 }}>
                              {question.content}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Student Answer */}
                        {answer.text_answer && (
                          <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              <strong>Câu trả lời của bạn:</strong>
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {answer.text_answer}
                            </Typography>
                          </Box>
                        )}

                        {answer.audio_url && (
                          <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              <strong>Câu trả lời (âm thanh):</strong>
                            </Typography>
                            {answer.transcribed_text && (
                              <>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                  {answer.transcribed_text}
                                </Typography>
                              </>
                            )}
                            <audio controls style={{ width: '100%', marginTop: '8px' }}>
                              <source src={getAssetUrl(answer.audio_url)} />
                            </audio>
                          </Box>
                        )}

                        {/* AI Feedback */}
                        {hasAiFeedback && (
                          <Box>
                            <Divider sx={{ my: 2 }} />
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                              <FeedbackOutlined color="info" fontSize="small" />
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Nhận xét của AI
                              </Typography>
                            </Box>

                            {/* Overall Comment */}
                            {answer.ai_feedback && (
                              <Box sx={{ mb: 2, backgroundColor: 'info.50', p: 2, borderRadius: 1 }}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                  <strong>Đánh giá chung:</strong>
                                </Typography>
                                <Typography variant="body2">
                                  {answer.ai_feedback}
                                </Typography>
                              </Box>
                            )}

                            {/* Criteria-based feedback */}
                            <Grid container spacing={1}>
                              {answer.aiFeedbacks.map((feedback, idx) => (
                                <Grid item xs={12} key={feedback.id}>
                                  <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                                    {/* Criterion name and score */}
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {feedback.criteria?.criteria_name || `Tiêu chí ${idx + 1}`}
                                      </Typography>
                                      <Chip
                                        label={`${feedback.score}/${feedback.max_score}`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    </Box>

                                    {/* Criterion description */}
                                    {feedback.criteria?.description && (
                                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                        {feedback.criteria.description}
                                      </Typography>
                                    )}

                                    {/* Strengths */}
                                    {feedback.strengths && feedback.strengths !== 'N/A' && (
                                      <Box sx={{ mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
                                          ✓ Điểm mạnh:
                                        </Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', ml: 1 }}>
                                          {feedback.strengths}
                                        </Typography>
                                      </Box>
                                    )}

                                    {/* Weaknesses */}
                                    {feedback.weaknesses && feedback.weaknesses !== 'N/A' && (
                                      <Box sx={{ mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'warning.main' }}>
                                          ✗ Cần cải thiện:
                                        </Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', ml: 1 }}>
                                          {feedback.weaknesses}
                                        </Typography>
                                      </Box>
                                    )}

                                    {/* Suggestions */}
                                    {feedback.suggestions && feedback.suggestions !== 'N/A' && (
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'info.main' }}>
                                          💡 Gợi ý:
                                        </Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', ml: 1 }}>
                                          {feedback.suggestions}
                                        </Typography>
                                      </Box>
                                    )}

                                    {/* General comment */}
                                    {feedback.comment && (
                                      <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #ddd' }}>
                                        <Typography variant="body2" color="textSecondary">
                                          {feedback.comment}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}