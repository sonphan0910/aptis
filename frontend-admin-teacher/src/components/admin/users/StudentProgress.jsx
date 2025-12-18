'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  School,
  Assignment,
  TrendingUp,
  TrendingDown,
  Star,
  AccessTime
} from '@mui/icons-material';
import ProgressChart from '@/components/teacher/reports/ProgressChart';

export default function StudentProgress({ 
  studentId,
  studentData = null,
  examAttempts = [],
  onTimeRangeChange 
}) {
  const [timeRange, setTimeRange] = useState('all');
  const [filteredAttempts, setFilteredAttempts] = useState(examAttempts);

  useEffect(() => {
    filterAttemptsByTimeRange();
  }, [timeRange, examAttempts]);

  const filterAttemptsByTimeRange = () => {
    if (timeRange === 'all') {
      setFilteredAttempts(examAttempts);
      return;
    }
    
    const now = new Date();
    const daysAgo = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    }[timeRange] || 0;
    
    if (daysAgo === 0) {
      setFilteredAttempts(examAttempts);
      return;
    }
    
    const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo));
    const filtered = examAttempts.filter(attempt => {
      const attemptDate = new Date(attempt.created_at);
      return attemptDate >= cutoffDate;
    });
    
    setFilteredAttempts(filtered);
    onTimeRangeChange?.(timeRange, filtered);
  };

  // Calculate statistics
  const stats = {
    totalAttempts: filteredAttempts.length,
    averageScore: filteredAttempts.length > 0 ? 
      (filteredAttempts.reduce((sum, attempt) => sum + (attempt.total_score || 0), 0) / filteredAttempts.length).toFixed(1) : 0,
    bestScore: filteredAttempts.length > 0 ? 
      Math.max(...filteredAttempts.map(attempt => attempt.total_score || 0)) : 0,
    improvement: filteredAttempts.length >= 2 ? 
      ((filteredAttempts[filteredAttempts.length - 1]?.total_score || 0) - (filteredAttempts[0]?.total_score || 0)).toFixed(1) : 0,
    completedExams: filteredAttempts.filter(attempt => attempt.status === 'completed').length,
    inProgressExams: filteredAttempts.filter(attempt => attempt.status === 'in_progress').length
  };

  // Skill analysis
  const skillStats = {
    listening: {
      scores: filteredAttempts.map(a => a.listening_score || 0).filter(s => s > 0),
      average: 0,
      trend: 'stable'
    },
    reading: {
      scores: filteredAttempts.map(a => a.reading_score || 0).filter(s => s > 0),
      average: 0,
      trend: 'stable'
    },
    writing: {
      scores: filteredAttempts.map(a => a.writing_score || 0).filter(s => s > 0),
      average: 0,
      trend: 'stable'
    },
    speaking: {
      scores: filteredAttempts.map(a => a.speaking_score || 0).filter(s => s > 0),
      average: 0,
      trend: 'stable'
    }
  };

  // Calculate averages and trends
  Object.keys(skillStats).forEach(skill => {
    const scores = skillStats[skill].scores;
    if (scores.length > 0) {
      skillStats[skill].average = (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1);
      
      if (scores.length >= 2) {
        const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
        const secondHalf = scores.slice(Math.floor(scores.length / 2));
        const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 3) skillStats[skill].trend = 'improving';
        else if (secondAvg < firstAvg - 3) skillStats[skill].trend = 'declining';
      }
    }
  });

  const getSkillColor = (skill) => {
    const average = parseFloat(skillStats[skill].average);
    if (average >= 80) return 'success';
    if (average >= 60) return 'warning';
    return 'error';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return <TrendingUp color="success" fontSize="small" />;
      case 'declining': return <TrendingDown color="error" fontSize="small" />;
      default: return null;
    }
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { label: 'Xuất sắc', color: 'success' };
    if (score >= 80) return { label: 'Giỏi', color: 'info' };
    if (score >= 70) return { label: 'Khá', color: 'warning' };
    if (score >= 60) return { label: 'Trung bình', color: 'secondary' };
    return { label: 'Cần cố gắng', color: 'error' };
  };

  return (
    <Box>
      {/* Student Header */}
      {studentData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar 
                src={studentData.avatar} 
                sx={{ width: 64, height: 64 }}
              >
                {studentData.full_name?.charAt(0) || 'S'}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h5" gutterBottom>
                  {studentData.full_name || 'Học sinh'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {studentData.email}
                </Typography>
                <Box display="flex" gap={1} mt={1}>
                  <Chip 
                    label={studentData.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                    color={studentData.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                  {stats.bestScore >= 80 && (
                    <Chip 
                      label="Học sinh giỏi" 
                      color="warning" 
                      size="small" 
                      icon={<Star />} 
                    />
                  )}
                </Box>
              </Box>
              <Box textAlign="right">
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Thời gian</InputLabel>
                  <Select
                    value={timeRange}
                    label="Thời gian"
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="7d">7 ngày qua</MenuItem>
                    <MenuItem value="30d">30 ngày qua</MenuItem>
                    <MenuItem value="90d">90 ngày qua</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Statistics Overview */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {stats.totalAttempts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng lượt thi
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Star color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {stats.bestScore}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Điểm cao nhất
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <School color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {stats.averageScore}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Điểm trung bình
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              {parseFloat(stats.improvement) >= 0 ? (
                <TrendingUp color="success" sx={{ fontSize: 40, mb: 1 }} />
              ) : (
                <TrendingDown color="error" sx={{ fontSize: 40, mb: 1 }} />
              )}
              <Typography 
                variant="h4" 
                color={parseFloat(stats.improvement) >= 0 ? 'success.main' : 'error.main'}
              >
                {stats.improvement > 0 ? '+' : ''}{stats.improvement}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cải thiện
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Skills Analysis */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <ProgressChart
            data={filteredAttempts}
            studentInfo={studentData}
            title="Tiến độ học tập"
            showSkillBreakdown={true}
            targetScore={80}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phân tích kỹ năng
              </Typography>
              
              {Object.entries(skillStats).map(([skill, data]) => {
                const skillName = {
                  listening: 'Listening',
                  reading: 'Reading', 
                  writing: 'Writing',
                  speaking: 'Speaking'
                }[skill];
                
                const performance = getPerformanceLevel(parseFloat(data.average));
                
                return (
                  <Box key={skill} mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {skillName}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="body2" color="primary">
                          {data.average}
                        </Typography>
                        {getTrendIcon(data.trend)}
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(parseFloat(data.average), 100)}
                        color={getSkillColor(skill)}
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      />
                      <Chip 
                        label={performance.label}
                        color={performance.color}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Attempts */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Lịch sử thi gần đây
          </Typography>
          
          {filteredAttempts.length > 0 ? (
            <List>
              {filteredAttempts.slice(-10).reverse().map((attempt, index) => {
                const performance = getPerformanceLevel(attempt.total_score || 0);
                
                return (
                  <div key={attempt.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: `${performance.color}.light` }}>
                          <Assignment />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1">
                              {attempt.exam_title || `Bài thi #${attempt.exam_id}`}
                            </Typography>
                            <Chip
                              label={performance.label}
                              color={performance.color}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Điểm: {attempt.total_score || 0} - {attempt.attempt_type === 'full_exam' ? 'Bài đầy đủ' : 'Luyện tập'}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                              <AccessTime fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(attempt.created_at).toLocaleString('vi-VN')}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < filteredAttempts.slice(-10).length - 1 && <Divider />}
                  </div>
                );
              })}
            </List>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                Chưa có lịch sử thi trong khoảng thời gian này
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}