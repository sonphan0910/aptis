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

  // Calculate normalized score on 50-point scale
  const normalizedScore = maxScore > 0 ? (score / maxScore) * 50 : 0;

  const getPerformanceColor = () => {
    if (percentage >= 80) return '#4caf50'; // Success Green
    if (percentage >= 60) return '#ff9800'; // Warning Orange
    return '#f44336'; // Error Red
  };

  const getPerformanceLabel = () => {
    if (percentage >= 90) return 'Xuất sắc';
    if (percentage >= 80) return 'Giỏi';
    if (percentage >= 70) return 'Khá';
    if (percentage >= 60) return 'Trung bình';
    return 'Cần cải thiện';
  };

  const performanceColor = getPerformanceColor();

  return (
    <Card sx={{
      borderRadius: 3,
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      border: '1px solid #eee'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 700, color: '#002E5C' }}>
            {skill.skillName || skill.skill_type || 'Unknown'}
          </Typography>
          <Chip
            label={getPerformanceLabel()}
            sx={{
              bgcolor: `${performanceColor}15`,
              color: performanceColor,
              borderColor: `${performanceColor}30`,
              fontWeight: 700,
              fontSize: '0.75rem'
            }}
            size="small"
            variant="outlined"
          />
        </Box>

        <Box display="flex" alignItems="baseline" mb={1}>
          <Typography variant="h3" component="div" sx={{ fontWeight: 800, color: '#002E5C' }}>
            {Math.round(normalizedScore)}
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ ml: 1, fontWeight: 500 }}>
            / 50
          </Typography>
          <Box sx={{ ml: 'auto', textAlign: 'right' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: performanceColor }}>
              {percentage.toFixed(0)}%
            </Typography>
          </Box>
        </Box>

        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: '#f0f0f0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: performanceColor,
                borderRadius: 5,
                backgroundImage: `linear-gradient(90deg, ${performanceColor} 0%, ${performanceColor}aa 100%)`
              }
            }}
          />
        </Box>


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