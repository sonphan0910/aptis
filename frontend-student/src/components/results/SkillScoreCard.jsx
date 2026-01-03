'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from '@mui/icons-material';

export default function SkillScoreCard({ skill }) {
  // Safe calculation to avoid NaN
  const maxScore = Number(skill.maxScore ?? skill.max_score ?? 1); // Fallback to 1 to avoid division by zero
  const score = Number(skill.score ?? 0);
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  
  const getPerformanceColor = () => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };
  
  const getPerformanceLabel = () => {
    if (percentage >= 90) return 'Xuất sắc';
    if (percentage >= 80) return 'Giỏi';
    if (percentage >= 70) return 'Khá';
    if (percentage >= 60) return 'Trung bình';
    return 'Cần cải thiện';
  };
  
  const getTrendIcon = () => {
    if (!skill.improvement) return <TrendingFlat color="action" />;
    if (skill.improvement > 0) return <TrendingUp color="success" />;
    if (skill.improvement < 0) return <TrendingDown color="error" />;
    return <TrendingFlat color="action" />;
  };
  
  const getTrendColor = () => {
    if (!skill.improvement) return 'default';
    if (skill.improvement > 0) return 'success';
    if (skill.improvement < 0) return 'error';
    return 'default';
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h3">
            {skill.skillName || skill.skill_type || 'Unknown'}
          </Typography>
          <Chip
            label={getPerformanceLabel()}
            color={getPerformanceColor()}
            size="small"
            variant="outlined"
          />
        </Box>
        
        <Box display="flex" alignItems="baseline" mb={2}>
          <Typography variant="h4" component="div" fontWeight="bold">
            {score}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ ml: 1 }}>
            / {maxScore}
          </Typography>
          <Typography variant="h6" color="primary" sx={{ ml: 'auto' }}>
            {percentage.toFixed(1)}%
          </Typography>
        </Box>
        
        <LinearProgress
          variant="determinate"
          value={percentage}
          color={getPerformanceColor()}
          sx={{
            height: 8,
            borderRadius: 4,
            mb: 2
          }}
        />
        
        {/* Performance details */}
        <Box>
          {skill.breakdown && (
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Chi tiết:
              </Typography>
              {Object.entries(skill.breakdown).map(([criterion, score]) => (
                <Box key={criterion} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">
                    {criterion}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {score}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          
          {/* Improvement indicator */}
          {skill.improvement !== undefined && (
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" color="textSecondary">
                So với lần trước:
              </Typography>
              <Box display="flex" alignItems="center">
                {getTrendIcon()}
                <Chip
                  label={skill.improvement > 0 ? `+${skill.improvement}%` : `${skill.improvement}%`}
                  color={getTrendColor()}
                  size="small"
                  variant="outlined"
                  sx={{ ml: 0.5 }}
                />
              </Box>
            </Box>
          )}
          
          {/* Feedback summary */}
          {skill.feedback_summary && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {skill.feedback_summary}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}