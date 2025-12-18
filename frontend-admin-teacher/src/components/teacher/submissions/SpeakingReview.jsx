'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Rating,
  Divider,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Slider
} from '@mui/material';
import {
  Save,
  PlayArrow,
  Pause,
  Stop,
  VolumeUp,
  VolumeOff,
  Replay,
  SkipNext,
  SkipPrevious,
  Comment,
  Timer
} from '@mui/icons-material';
import AudioPlayer from './AudioPlayer';

const speakingCriteria = [
  {
    aspect: 'Phát âm và ngữ điệu',
    description: 'Độ rõ ràng, stress, intonation',
    maxScore: 5
  },
  {
    aspect: 'Từ vựng và cách diễn đạt',
    description: 'Phong phú từ vựng, chính xác nghĩa',
    maxScore: 5
  },
  {
    aspect: 'Ngữ pháp',
    description: 'Độ chính xác và đa dạng cấu trúc',
    maxScore: 5
  },
  {
    aspect: 'Tính lưu loát',
    description: 'Tốc độ nói, hesitation, flow',
    maxScore: 5
  },
  {
    aspect: 'Nội dung và ý tưởng',
    description: 'Relevance, development, coherence',
    maxScore: 5
  }
];

const timeMarkers = [];

export default function SpeakingReview({ 
  submission,
  onScoreChange,
  onFeedbackChange,
  onSave,
  readonly = false 
}) {
  const [scores, setScores] = useState(submission?.scores || {});
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [timeComments, setTimeComments] = useState(submission?.time_comments || []);
  const [currentTime, setCurrentTime] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const handleScoreChange = (aspect, score) => {
    const newScores = { ...scores, [aspect]: score };
    setScores(newScores);
    onScoreChange?.(newScores);
  };

  const handleFeedbackChange = (event) => {
    const newFeedback = event.target.value;
    setFeedback(newFeedback);
    onFeedbackChange?.(newFeedback);
  };

  const addTimeComment = () => {
    if (!newComment.trim() || readonly) return;
    
    const comment = {
      id: Date.now(),
      time: currentTime,
      text: newComment.trim(),
      timestamp: new Date().toISOString()
    };
    
    setTimeComments([...timeComments, comment]);
    setNewComment('');
  };

  const removeTimeComment = (commentId) => {
    setTimeComments(timeComments.filter(c => c.id !== commentId));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTotalScore = () => {
    const scoreValues = Object.values(scores);
    if (scoreValues.length === 0) return 0;
    return scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'success';
    if (score >= 3.5) return 'primary';
    if (score >= 2.5) return 'info';
    if (score >= 1.5) return 'warning';
    return 'error';
  };

  const totalScore = calculateTotalScore();
  const progress = (totalScore / 5) * 100;

  return (
    <Box>
      {/* Header with overall score */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">
            Chấm điểm bài Speaking
          </Typography>
          <Box textAlign="center">
            <Typography variant="h4" color={getScoreColor(totalScore)}>
              {totalScore.toFixed(1)}/5.0
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              color={getScoreColor(totalScore)}
              sx={{ width: 100, height: 8, borderRadius: 4 }}
            />
          </Box>
        </Box>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          Nghe kỹ bài nói của học sinh và đánh giá theo từng tiêu chí. Bạn có thể thêm nhận xét tại các thời điểm cụ thể.
        </Alert>
      </Paper>

      <Box display="flex" gap={3}>
        {/* Audio Player and Comments */}
        <Paper sx={{ flex: 1, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Bài nói của học sinh
          </Typography>
          
          {/* Audio Player */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <AudioPlayer
                src={submission?.audio_url}
                onTimeUpdate={setCurrentTime}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
              
              <Box mt={2} display="flex" alignItems="center" gap={2}>
                <Timer fontSize="small" />
                <Typography variant="body2">
                  Thời gian hiện tại: {formatTime(currentTime)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng thời gian: {formatTime(submission?.duration || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Add Time Comment */}
          {!readonly && (
            <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Thêm nhận xét tại thời điểm {formatTime(currentTime)}
                </Typography>
                <Box display="flex" gap={2}>
                  <TextField
                    fullWidth
                    size="small"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Nhập nhận xét cho thời điểm này..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTimeComment();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Comment />}
                    onClick={addTimeComment}
                    disabled={!newComment.trim()}
                  >
                    Thêm
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Time Comments List */}
          {timeComments.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Nhận xét theo thời gian
              </Typography>
              {timeComments
                .sort((a, b) => a.time - b.time)
                .map((comment) => (
                  <Card key={comment.id} sx={{ mb: 1 }}>
                    <CardContent sx={{ py: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Chip 
                            label={formatTime(comment.time)} 
                            size="small" 
                            color="primary" 
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="body2">
                            {comment.text}
                          </Typography>
                        </Box>
                        {!readonly && (
                          <IconButton 
                            size="small"
                            onClick={() => removeTimeComment(comment.id)}
                          >
                            ×
                          </IconButton>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
            </Box>
          )}
        </Paper>

        {/* Scoring Panel */}
        <Paper sx={{ width: 400, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Bảng điểm chi tiết
          </Typography>

          <Box mb={3}>
            {speakingCriteria.map((criterion) => (
              <Box key={criterion.aspect} mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  {criterion.aspect}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  {criterion.description}
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Rating
                    value={scores[criterion.aspect] || 0}
                    onChange={(e, value) => handleScoreChange(criterion.aspect, value)}
                    max={criterion.maxScore}
                    precision={0.5}
                    readOnly={readonly}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {scores[criterion.aspect] || 0}/{criterion.maxScore}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Phản hồi tổng quát
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={6}
            value={feedback}
            onChange={handleFeedbackChange}
            placeholder="Nhập phản hồi tổng quát về bài nói của học sinh..."
            variant="outlined"
            InputProps={{
              readOnly: readonly
            }}
          />

          {!readonly && (
            <Box mt={3} display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => onSave?.({ scores, feedback, timeComments })}
                fullWidth
              >
                Lưu điểm và phản hồi
              </Button>
            </Box>
          )}

          {/* Task Info */}
          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="caption" color="text.secondary">
              <strong>Thông tin bài thi:</strong><br />
              Nhiệm vụ: {submission?.task_description}<br />
              Thời gian chuẩn bị: {submission?.preparation_time || 'N/A'}s<br />
              Thời gian nói: {submission?.speaking_time || 'N/A'}s<br />
              Tổng thời gian: {formatTime(submission?.duration || 0)}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}