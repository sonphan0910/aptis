'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Assessment,
  TrendingUp,
  People,
  Timer,
  Star,
  Assignment
} from '@mui/icons-material';

const COLORS = ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0'];

export default function ExamStatistics({ 
  examData,
  showComparison = false,
  timeRange = '30d' 
}) {
  const [stats, setStats] = useState({});
  const [difficultyBreakdown, setDifficultyBreakdown] = useState([]);
  const [scoreDistribution, setScoreDistribution] = useState([]);
  const [questionAnalysis, setQuestionAnalysis] = useState([]);

  useEffect(() => {
    if (examData) {
      processExamData();
    }
  }, [examData]);

  const processExamData = () => {
    const attempts = examData.attempts || [];
    const questions = examData.questions || [];
    
    // Calculate basic statistics
    const scores = attempts.map(a => a.total_score || 0).filter(s => s > 0);
    const durations = attempts.map(a => a.duration || 0).filter(d => d > 0);
    
    setStats({
      totalAttempts: attempts.length,
      averageScore: scores.length ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0,
      maxScore: scores.length ? Math.max(...scores) : 0,
      minScore: scores.length ? Math.min(...scores) : 0,
      averageDuration: durations.length ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
      passRate: scores.length ? (scores.filter(s => s >= 60).length / scores.length * 100) : 0,
      completionRate: attempts.length ? (attempts.filter(a => a.status === 'completed').length / attempts.length * 100) : 0
    });

    // Score distribution
    const distribution = [
      { range: '0-20', count: scores.filter(s => s <= 20).length, color: '#f44336' },
      { range: '21-40', count: scores.filter(s => s > 20 && s <= 40).length, color: '#ff9800' },
      { range: '41-60', count: scores.filter(s => s > 40 && s <= 60).length, color: '#2196f3' },
      { range: '61-80', count: scores.filter(s => s > 60 && s <= 80).length, color: '#4caf50' },
      { range: '81-100', count: scores.filter(s => s > 80).length, color: '#1b5e20' }
    ];
    setScoreDistribution(distribution);

    // Difficulty breakdown
    const difficulties = questions.reduce((acc, q) => {
      const diff = q.difficulty || 'medium';
      acc[diff] = (acc[diff] || 0) + 1;
      return acc;
    }, {});
    
    const diffData = Object.entries(difficulties).map(([level, count], index) => ({
      difficulty: level,
      count,
      percentage: (count / questions.length * 100).toFixed(1),
      color: COLORS[index % COLORS.length]
    }));
    setDifficultyBreakdown(diffData);

    // Question analysis
    const questionStats = questions.map(question => {
      const questionAttempts = attempts.filter(a => 
        a.answers && a.answers.some(ans => ans.question_id === question.id)
      );
      
      const correctAnswers = questionAttempts.filter(a => 
        a.answers.find(ans => ans.question_id === question.id && ans.is_correct)
      ).length;
      
      return {
        id: question.id,
        type: question.question_type,
        difficulty: question.difficulty,
        correctRate: questionAttempts.length ? (correctAnswers / questionAttempts.length * 100) : 0,
        attemptCount: questionAttempts.length
      };
    });
    setQuestionAnalysis(questionStats);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'error';
  };

  return (
    <Box>
      {/* Overview Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <People color="primary" />
                <Box>
                  <Typography variant="h4">{stats.totalAttempts}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lượt làm bài
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Assessment color="primary" />
                <Box>
                  <Typography variant="h4" color={getScoreColor(stats.averageScore)}>
                    {stats.averageScore?.toFixed(1) || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Điểm trung bình
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUp color="success" />
                <Box>
                  <Typography variant="h4" color="success">
                    {stats.passRate?.toFixed(1) || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tỉ lệ đạt (≥60%)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Timer color="info" />
                <Box>
                  <Typography variant="h4" color="info">
                    {Math.round(stats.averageDuration || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phút TB/bài
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Score Distribution */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phân bố điểm số
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Difficulty Breakdown */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Độ khó câu hỏi
              </Typography>
              {difficultyBreakdown.map((item) => (
                <Box key={item.difficulty} mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" textTransform="capitalize">
                      {item.difficulty}
                    </Typography>
                    <Typography variant="body2">
                      {item.count} ({item.percentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={parseFloat(item.percentage)} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: item.color
                      }
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Question Analysis */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phân tích câu hỏi
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Loại</TableCell>
                      <TableCell>Độ khó</TableCell>
                      <TableCell>Lượt làm</TableCell>
                      <TableCell>Tỉ lệ đúng</TableCell>
                      <TableCell>Độ khó thực tế</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questionAnalysis
                      .sort((a, b) => a.correctRate - b.correctRate)
                      .slice(0, 10)
                      .map((question) => (
                        <TableRow key={question.id}>
                          <TableCell>#{question.id}</TableCell>
                          <TableCell>
                            <Chip 
                              label={question.type} 
                              size="small" 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={question.difficulty} 
                              size="small"
                              color={
                                question.difficulty === 'easy' ? 'success' :
                                question.difficulty === 'medium' ? 'warning' : 'error'
                              }
                            />
                          </TableCell>
                          <TableCell>{question.attemptCount}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2">
                                {question.correctRate.toFixed(1)}%
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={question.correctRate} 
                                sx={{ width: 60, height: 4 }}
                                color={
                                  question.correctRate >= 70 ? 'success' :
                                  question.correctRate >= 50 ? 'warning' : 'error'
                                }
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={
                                question.correctRate >= 70 ? 'Dễ' :
                                question.correctRate >= 30 ? 'TB' : 'Khó'
                              }
                              size="small"
                              color={
                                question.correctRate >= 70 ? 'success' :
                                question.correctRate >= 30 ? 'warning' : 'error'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}