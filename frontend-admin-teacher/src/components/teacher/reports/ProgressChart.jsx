'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  School, 
  Assignment,
  CheckCircle,
  Schedule
} from '@mui/icons-material';

const COLORS = ['#4caf50', '#ff9800', '#f44336', '#2196f3'];

const skillLabels = {
  listening: 'Listening',
  reading: 'Reading', 
  writing: 'Writing',
  speaking: 'Speaking'
};

export default function ProgressChart({ 
  studentData,
  timeRange = '3m',
  showComparison = false
}) {
  const [progressData, setProgressData] = useState([]);
  const [skillBreakdown, setSkillBreakdown] = useState([]);
  const [currentLevel, setCurrentLevel] = useState('A2');

  useEffect(() => {
    if (studentData) {
      processStudentData();
    }
  }, [studentData, timeRange]);

  const processStudentData = () => {
    // Process exam attempts over time
    const attempts = studentData?.exam_attempts || [];
    const progressByTime = attempts
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((attempt, index) => ({
        attempt: index + 1,
        date: new Date(attempt.created_at).toLocaleDateString('vi-VN'),
        overall: calculateOverallScore(attempt.scores),
        listening: attempt.scores?.listening || 0,
        reading: attempt.scores?.reading || 0, 
        writing: attempt.scores?.writing || 0,
        speaking: attempt.scores?.speaking || 0
      }));

    setProgressData(progressByTime);

    // Process skill breakdown for current level
    const latestAttempt = attempts[attempts.length - 1];
    if (latestAttempt) {
      const breakdown = Object.entries(latestAttempt.scores || {}).map(([skill, score]) => ({
        skill: skillLabels[skill] || skill,
        score,
        level: getSkillLevel(score),
        color: getScoreColor(score)
      }));
      setSkillBreakdown(breakdown);
      setCurrentLevel(determineOverallLevel(latestAttempt.scores));
    }
  };

  const calculateOverallScore = (scores) => {
    if (!scores) return 0;
    const skillScores = Object.values(scores);
    return skillScores.length ? skillScores.reduce((sum, score) => sum + score, 0) / skillScores.length : 0;
  };

  const getSkillLevel = (score) => {
    if (score >= 90) return 'C2';
    if (score >= 75) return 'C1';
    if (score >= 60) return 'B2';
    if (score >= 45) return 'B1';
    if (score >= 30) return 'A2';
    return 'A1';
  };

  const determineOverallLevel = (scores) => {
    const avgScore = calculateOverallScore(scores);
    return getSkillLevel(avgScore);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 65) return '#ff9800';
    if (score >= 50) return '#2196f3';
    return '#f44336';
  };

  const getTrendDirection = () => {
    if (progressData.length < 2) return null;
    const first = progressData[0]?.overall || 0;
    const last = progressData[progressData.length - 1]?.overall || 0;
    return last > first ? 'up' : last < first ? 'down' : 'stable';
  };

  const getProgressPercentage = () => {
    const currentScore = progressData[progressData.length - 1]?.overall || 0;
    return Math.round((currentScore / 100) * 100);
  };

  const getStrengthsAndWeaknesses = () => {
    if (!skillBreakdown.length) return { strengths: [], weaknesses: [] };
    
    const sorted = [...skillBreakdown].sort((a, b) => b.score - a.score);
    return {
      strengths: sorted.slice(0, 2),
      weaknesses: sorted.slice(-2)
    };
  };

  const trend = getTrendDirection();
  const progress = getProgressPercentage();
  const { strengths, weaknesses } = getStrengthsAndWeaknesses();

  return (
    <Box>
      {/* Student Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={3} mb={3}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
              {studentData?.name?.charAt(0) || 'S'}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h5" gutterBottom>
                {studentData?.name || 'Học sinh'}
              </Typography>
              <Box display="flex" gap={2} alignItems="center">
                <Chip 
                  label={`Trình độ hiện tại: ${currentLevel}`}
                  color="primary"
                  icon={<School />}
                />
                <Chip 
                  label={`${progressData.length} lần làm bài`}
                  color="secondary"
                  icon={<Assignment />}
                />
              </Box>
            </Box>
            <Box textAlign="center">
              <Typography variant="h3" color="primary">
                {progressData[progressData.length - 1]?.overall?.toFixed(1) || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Điểm trung bình
              </Typography>
              {trend && (
                <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                  {trend === 'up' && <TrendingUp color="success" />}
                  {trend === 'down' && <TrendingDown color="error" />}
                  <Typography 
                    variant="caption" 
                    color={trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary'}
                    ml={0.5}
                  >
                    {trend === 'up' ? 'Đang cải thiện' : trend === 'down' ? 'Cần chú ý' : 'Ổn định'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Progress Over Time */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tiến độ theo thời gian
              </Typography>
              {progressData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value, name) => [value + '%', skillLabels[name] || name]} />
                    <Line 
                      type="monotone" 
                      dataKey="overall" 
                      stroke="#2196f3" 
                      strokeWidth={3}
                      name="Tổng điểm"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="listening" 
                      stroke="#4caf50" 
                      strokeDasharray="5 5"
                      name="Listening"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="reading" 
                      stroke="#ff9800" 
                      strokeDasharray="5 5"
                      name="Reading"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="writing" 
                      stroke="#f44336" 
                      strokeDasharray="5 5"
                      name="Writing"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="speaking" 
                      stroke="#9c27b0" 
                      strokeDasharray="5 5"
                      name="Speaking"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography color="text.secondary">
                    Chưa có dữ liệu tiến độ
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Current Skills Breakdown */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phân tích kỹ năng hiện tại
              </Typography>
              
              {skillBreakdown.map((skill) => (
                <Box key={skill.skill} mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">
                      {skill.skill}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {skill.score}%
                      </Typography>
                      <Chip 
                        label={skill.level} 
                        size="small"
                        sx={{ 
                          bgcolor: skill.color,
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 20
                        }}
                      />
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={skill.score} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: skill.color
                      }
                    }}
                  />
                </Box>
              ))}

              {skillBreakdown.length === 0 && (
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography color="text.secondary" variant="body2">
                    Chưa có dữ liệu kỹ năng
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Strengths & Weaknesses */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Điểm mạnh và điểm cần cải thiện
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="success.main" gutterBottom>
                      <CheckCircle fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Điểm mạnh
                    </Typography>
                    {strengths.map((skill) => (
                      <Box key={skill.skill} display="flex" justifyContent="space-between" py={0.5}>
                        <Typography variant="body2">
                          {skill.skill}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {skill.score}% ({skill.level})
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="warning.main" gutterBottom>
                      <Schedule fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Cần cải thiện
                    </Typography>
                    {weaknesses.map((skill) => (
                      <Box key={skill.skill} display="flex" justifyContent="space-between" py={0.5}>
                        <Typography variant="body2">
                          {skill.skill}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {skill.score}% ({skill.level})
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}