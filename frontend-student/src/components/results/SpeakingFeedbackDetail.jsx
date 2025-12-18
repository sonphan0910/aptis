'use client';

import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
  Grid,
  Paper,
  IconButton,
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  TrendingUp,
  Lightbulb,
  Warning as WarningIcon,
  PlayArrow,
  Pause,
  VolumeUp,
} from '@mui/icons-material';
import { useState, useRef } from 'react';

export default function SpeakingFeedbackDetail({ answer }) {
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  if (!answer) return null;

  const {
    audio_url,
    transcribed_text,
    score,
    max_score,
    ai_feedback,
    ai_graded_at,
    needs_review,
    final_score,
    manual_feedback,
    reviewed_at,
    reviewed_by,
    aiFeedbacks = [],
  } = answer;

  // Calculate percentage
  const displayScore = final_score !== null ? final_score : score;
  const percentage = max_score > 0 ? Math.round((displayScore / max_score) * 100) : 0;

  // Get score color
  const getScoreColor = () => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'primary';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <Box>
      {/* Overall Score Card */}
      <Card sx={{ mb: 3, background: `linear-gradient(135deg, ${getScoreColor()}.light 0%, ${getScoreColor()}.main 100%)` }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h2" fontWeight="bold" color="white">
                  {displayScore}
                </Typography>
                <Typography variant="h6" color="white" sx={{ opacity: 0.9 }}>
                  / {max_score} điểm
                </Typography>
                <Chip 
                  label={`${percentage}%`}
                  sx={{ 
                    mt: 1,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Typography variant="body1" color="white" sx={{ mb: 1 }}>
                <strong>Chuyển đổi văn bản:</strong> {transcribed_text ? 'Hoàn tất' : 'Đang xử lý...'}
              </Typography>
              <Typography variant="body1" color="white" sx={{ mb: 1 }}>
                <strong>Chấm bởi AI:</strong> {ai_graded_at ? new Date(ai_graded_at).toLocaleString('vi-VN') : 'Đang chờ'}
              </Typography>
              {reviewed_at && (
                <Typography variant="body1" color="white">
                  <strong>Xem xét bởi giáo viên:</strong> {new Date(reviewed_at).toLocaleString('vi-VN')}
                </Typography>
              )}
              {needs_review && (
                <Chip 
                  icon={<WarningIcon />}
                  label="Đang chờ xem xét giáo viên"
                  color="warning"
                  sx={{ mt: 1 }}
                />
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Audio Player */}
      {audio_url && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎤 Ghi âm của bạn
            </Typography>
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              sx={{ 
                p: 3, 
                backgroundColor: 'grey.50',
                borderRadius: 2
              }}
            >
              <IconButton
                onClick={isPlaying ? pauseAudio : playAudio}
                color="primary"
                size="large"
                sx={{ mr: 2 }}
              >
                {isPlaying ? <Pause sx={{ fontSize: 48 }} /> : <PlayArrow sx={{ fontSize: 48 }} />}
              </IconButton>
              <Box flex={1}>
                <audio
                  ref={audioRef}
                  src={audio_url}
                  onEnded={() => setIsPlaying(false)}
                  style={{ width: '100%' }}
                  controls
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Transcription */}
      {transcribed_text && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📝 Phiên âm (Speech-to-Text)
            </Typography>
            <Paper 
              sx={{ 
                p: 2, 
                backgroundColor: 'info.50',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap'
              }}
            >
              {transcribed_text === '[Transcription failed]' ? (
                <Alert severity="error">
                  Không thể chuyển đổi giọng nói thành văn bản. Vui lòng liên hệ giáo viên để chấm thủ công.
                </Alert>
              ) : (
                transcribed_text
              )}
            </Paper>
          </CardContent>
        </Card>
      )}

      {/* AI Feedback by Criteria */}
      {aiFeedbacks && aiFeedbacks.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🤖 Phản hồi chi tiết từ AI
            </Typography>
            
            {aiFeedbacks.map((feedback, index) => (
              <Accordion 
                key={feedback.id || index}
                expanded={expanded === `panel${index}`}
                onChange={() => setExpanded(expanded === `panel${index}` ? false : `panel${index}`)}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {feedback.criteria?.criteria_name || 'Tiêu chí'}
                    </Typography>
                    <Box display="flex" gap={1} mr={2}>
                      <Chip 
                        label={`${feedback.score}/${feedback.max_score}`}
                        color={feedback.score / feedback.max_score >= 0.8 ? 'success' : 'warning'}
                        size="small"
                      />
                      <Chip 
                        label={`${Math.round((feedback.score / feedback.max_score) * 100)}%`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  {/* Progress Bar */}
                  <LinearProgress 
                    variant="determinate"
                    value={(feedback.score / feedback.max_score) * 100}
                    color={feedback.score / feedback.max_score >= 0.8 ? 'success' : 'warning'}
                    sx={{ mb: 2, height: 8, borderRadius: 4 }}
                  />

                  {/* Comment */}
                  {feedback.comment && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        💬 Nhận xét:
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {feedback.comment}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    {/* Strengths */}
                    {feedback.strengths && feedback.strengths !== 'None identified' && (
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <CheckCircle color="success" fontSize="small" />
                            <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                              Điểm mạnh
                            </Typography>
                          </Box>
                          <Paper sx={{ p: 1.5, backgroundColor: 'success.50' }}>
                            <Typography 
                              variant="body2" 
                              component="div"
                              sx={{ whiteSpace: 'pre-line' }}
                            >
                              {feedback.strengths}
                            </Typography>
                          </Paper>
                        </Box>
                      </Grid>
                    )}

                    {/* Weaknesses */}
                    {feedback.weaknesses && feedback.weaknesses !== 'None identified' && (
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <WarningIcon color="warning" fontSize="small" />
                            <Typography variant="subtitle2" fontWeight="bold" color="warning.main">
                              Cần cải thiện
                            </Typography>
                          </Box>
                          <Paper sx={{ p: 1.5, backgroundColor: 'warning.50' }}>
                            <Typography 
                              variant="body2"
                              component="div"
                              sx={{ whiteSpace: 'pre-line' }}
                            >
                              {feedback.weaknesses}
                            </Typography>
                          </Paper>
                        </Box>
                      </Grid>
                    )}

                    {/* Suggestions */}
                    {feedback.suggestions && feedback.suggestions !== 'No suggestions' && (
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Lightbulb color="primary" fontSize="small" />
                            <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                              Gợi ý
                            </Typography>
                          </Box>
                          <Paper sx={{ p: 1.5, backgroundColor: 'primary.50' }}>
                            <Typography 
                              variant="body2"
                              component="div"
                              sx={{ whiteSpace: 'pre-line' }}
                            >
                              {feedback.suggestions}
                            </Typography>
                          </Paper>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Overall AI Feedback */}
      {ai_feedback && (
        <Alert severity="info" icon={<TrendingUp />} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Tổng quan:
          </Typography>
          <Typography variant="body2">
            {ai_feedback}
          </Typography>
        </Alert>
      )}

      {/* Teacher Feedback (if reviewed) */}
      {reviewed_at && manual_feedback && (
        <Card sx={{ mb: 3, border: 2, borderColor: 'primary.main' }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CheckCircle color="primary" />
              <Typography variant="h6" color="primary">
                👨‍🏫 Phản hồi từ giáo viên
              </Typography>
            </Box>
            
            {final_score !== null && final_score !== score && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Điểm được điều chỉnh:</strong> {final_score}/{max_score} 
                  {` (${final_score > score ? '+' : ''}${(final_score - score).toFixed(2)} điểm)`}
                </Typography>
              </Alert>
            )}

            <Typography variant="body1" paragraph>
              {manual_feedback}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Xem xét lúc: {new Date(reviewed_at).toLocaleString('vi-VN')}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Pending Review Notice */}
      {needs_review && !reviewed_at && (
        <Alert severity="warning" icon={<WarningIcon />}>
          <Typography variant="body2">
            Bài nói này đang chờ giáo viên xem xét. Điểm số và phản hồi có thể được cập nhật sau.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
