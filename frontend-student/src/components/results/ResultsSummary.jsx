'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Star,
  TrendingUp,
} from '@mui/icons-material';

export default function ResultsSummary({ attempt, exam, skillScores, overallStats }) {
  // Validate input data - use overallStats first, then fallback to calculations
  const totalScore = overallStats?.totalScore ?? attempt?.total_score ?? 0;
  const maxScore = overallStats?.maxScore ?? exam?.total_score ?? 100;
  const timeSpent = attempt?.time_spent ?? 0;

  // Safe calculations - percentage should be exact, not capped
  const progressPercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const displayPercentage = Math.round(progressPercentage);

  return (
    <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
      <CardContent sx={{ p: 4 }}>
        <Grid container spacing={3} alignItems="center">
          {/* Overall Score */}
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Box position="relative" display="inline-flex" mb={2}>
                <CircularProgress
                  variant="determinate"
                  value={Math.min(progressPercentage, 100)}
                  size={120}
                  thickness={6}
                  sx={{
                    color: 'white',
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <Typography variant="h4" component="div" color="white" fontWeight="bold">
                    {attempt.total_score}
                  </Typography>
                  <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                    / {exam.total_score || 100}
                  </Typography>
                </Box>
              </Box>

            </Box>
          </Grid>

          {/* Stats */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box display="flex" alignItems="center" mb={1}>
                  <CheckCircle sx={{ mr: 1, opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Độ chính xác
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  {overallStats?.accuracy_percentage ?? displayPercentage}%
                </Typography>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Schedule sx={{ mr: 1, opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Thời gian
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  {Math.round((attempt?.time_spent || 0) / 60) || 0}'
                </Typography>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Star sx={{ mr: 1, opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Xếp hạng
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  {overallStats?.rank || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box display="flex" alignItems="center" mb={1}>
                  <TrendingUp sx={{ mr: 1, opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Cải thiện
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  {overallStats?.improvement ? `+${overallStats.improvement}%` : '0%'}
                </Typography>
              </Grid>
            </Grid>
            
            {/* Progress by skill */}
            <Box mt={3}>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                Tiến độ từng kỹ năng:
              </Typography>
              {skillScores.map((skill) => {
              const skillMaxScore = skill.max_score ?? skill.maxScore ?? 1;
              const skillScore = skill.score ?? 0;
              const skillPercentage = skillMaxScore > 0 ? (skillScore / skillMaxScore) * 100 : 0;
              return (
                <Box key={skill.skillName || skill.skill_type || 'unknown'} mb={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {skill.skillName || skill.skill_type || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {skillScore}/{skillMaxScore}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(skillPercentage, 100)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white',
                      },
                    }}
                  />
                </Box>
              );
            })}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}