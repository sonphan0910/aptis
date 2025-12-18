'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Remove,
  School,
  Assignment,
  Timer,
  Star,
  Visibility
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function StudentProgress({ 
  students = [],
  onStudentClick,
  sortBy = 'overall',
  showTrends = true 
}) {
  const router = useRouter();
  const [sortedStudents, setSortedStudents] = useState([]);

  useEffect(() => {
    const sorted = [...students].sort((a, b) => {
      const aValue = a.progress?.[sortBy] || 0;
      const bValue = b.progress?.[sortBy] || 0;
      return bValue - aValue;
    });
    setSortedStudents(sorted);
  }, [students, sortBy]);

  const getProgressColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 65) return 'primary';
    if (score >= 50) return 'warning';
    return 'error';
  };

  const getTrend = (student) => {
    if (!student.progress?.trend) return null;
    const { direction, value } = student.progress.trend;
    return { direction, value: Math.abs(value) };
  };

  const getSkillLevel = (score) => {
    if (score >= 90) return 'C2';
    if (score >= 75) return 'C1';
    if (score >= 60) return 'B2';
    if (score >= 45) return 'B1';
    if (score >= 30) return 'A2';
    return 'A1';
  };

  const handleStudentClick = (student) => {
    if (onStudentClick) {
      onStudentClick(student);
    } else {
      router.push(`/teacher/reports/student/${student.id}`);
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {sortedStudents.map((student, index) => {
          const progress = student.progress || {};
          const overall = progress.overall || 0;
          const trend = getTrend(student);
          const level = getSkillLevel(overall);
          
          return (
            <Grid item xs={12} sm={6} lg={4} key={student.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => handleStudentClick(student)}
              >
                <CardContent>
                  {/* Student Info Header */}
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar 
                      sx={{ 
                        bgcolor: getProgressColor(overall) + '.main',
                        width: 48,
                        height: 48
                      }}
                    >
                      {student.name?.charAt(0) || '#'}{index + 1}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" noWrap>
                        {student.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {student.email}
                      </Typography>
                    </Box>
                    <Tooltip title="Xem chi tiết">
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Overall Progress */}
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">
                        Tổng điểm
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6" color={getProgressColor(overall)}>
                          {overall.toFixed(1)}%
                        </Typography>
                        <Chip 
                          label={level}
                          color={getProgressColor(overall)}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={overall} 
                      color={getProgressColor(overall)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Skills Breakdown */}
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Kỹ năng chi tiết:
                    </Typography>
                    <Grid container spacing={1}>
                      {['listening', 'reading', 'writing', 'speaking'].map(skill => {
                        const score = progress[skill] || 0;
                        return (
                          <Grid item xs={6} key={skill}>
                            <Box>
                              <Typography variant="caption" display="block">
                                {skill.charAt(0).toUpperCase() + skill.slice(1)}
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={score} 
                                size="small"
                                color={getProgressColor(score)}
                                sx={{ height: 4, mb: 0.5 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {score.toFixed(0)}%
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>

                  {/* Stats */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" gap={2}>
                      <Chip
                        icon={<Assignment />}
                        label={`${student.exam_count || 0} bài`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<Timer />}
                        label={`${student.total_time || 0}h`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    
                    {showTrends && trend && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {trend.direction === 'up' && (
                          <TrendingUp color="success" fontSize="small" />
                        )}
                        {trend.direction === 'down' && (
                          <TrendingDown color="error" fontSize="small" />
                        )}
                        {trend.direction === 'stable' && (
                          <Remove color="info" fontSize="small" />
                        )}
                        <Typography 
                          variant="caption" 
                          color={
                            trend.direction === 'up' ? 'success.main' : 
                            trend.direction === 'down' ? 'error.main' : 
                            'text.secondary'
                          }
                        >
                          {trend.direction === 'stable' ? 'Ổn định' : `${trend.value}%`}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {sortedStudents.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <School sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">
            Không có dữ liệu học sinh
          </Typography>
        </Paper>
      )}
    </Box>
  );
}