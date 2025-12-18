'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
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
  Cell
} from 'recharts';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { useState } from 'react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export default function PerformanceChart2({ 
  data = [],
  type = 'line',
  title = 'Biểu đồ hiệu suất',
  xAxisKey = 'date',
  yAxisKey = 'score',
  showControls = true
}) {
  const [chartType, setChartType] = useState(type);
  const [timeRange, setTimeRange] = useState('all');

  // Process data based on time range
  const filteredData = useMemo(() => {
    if (timeRange === 'all' || !data.length) return data;
    
    const now = new Date();
    const daysAgo = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    }[timeRange] || 0;
    
    if (daysAgo === 0) return data;
    
    const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo));
    return data.filter(item => {
      const itemDate = new Date(item[xAxisKey]);
      return itemDate >= cutoffDate;
    });
  }, [data, timeRange, xAxisKey]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!filteredData.length) return { avg: 0, min: 0, max: 0, trend: 0 };
    
    const scores = filteredData.map(item => item[yAxisKey] || 0);
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    
    // Calculate trend (last vs first)
    const trend = scores.length > 1 ? 
      ((scores[scores.length - 1] - scores[0]) / scores[0]) * 100 : 0;
    
    return { avg: avg.toFixed(1), min, max, trend: trend.toFixed(1) };
  }, [filteredData, yAxisKey]);

  const renderChart = () => {
    if (!filteredData.length) {
      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height={300}
        >
          <Typography color="text.secondary">Không có dữ liệu</Typography>
        </Box>
      );
    }

    const commonProps = {
      width: '100%',
      height: 300,
      data: filteredData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={yAxisKey} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        // Group data by score ranges for pie chart
        const scoreRanges = {
          'Xuất sắc (90-100)': 0,
          'Giỏi (80-89)': 0,
          'Khá (70-79)': 0,
          'Trung bình (60-69)': 0,
          'Dưới TB (<60)': 0
        };
        
        filteredData.forEach(item => {
          const score = item[yAxisKey] || 0;
          if (score >= 90) scoreRanges['Xuất sắc (90-100)']++;
          else if (score >= 80) scoreRanges['Giỏi (80-89)']++;
          else if (score >= 70) scoreRanges['Khá (70-79)']++;
          else if (score >= 60) scoreRanges['Trung bình (60-69)']++;
          else scoreRanges['Dưới TB (<60)']++;
        });
        
        const pieData = Object.entries(scoreRanges)
          .filter(([_, value]) => value > 0)
          .map(([name, value]) => ({ name, value }));
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'line':
      default:
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={yAxisKey} 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">{title}</Typography>
        
        {showControls && (
          <Box display="flex" gap={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Loại biểu đồ</InputLabel>
              <Select
                value={chartType}
                label="Loại biểu đồ"
                onChange={(e) => setChartType(e.target.value)}
              >
                <MenuItem value="line">Biểu đồ đường</MenuItem>
                <MenuItem value="bar">Biểu đồ cột</MenuItem>
                <MenuItem value="pie">Biểu đồ tròn</MenuItem>
              </Select>
            </FormControl>
            
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
        )}
      </Box>

      {/* Statistics */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h6" color="primary">
                {stats.avg}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Điểm TB
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h6" color="success.main">
                {stats.max}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cao nhất
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h6" color="error.main">
                {stats.min}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Thấp nhất
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 1 }}>
              <Typography 
                variant="h6" 
                color={stats.trend >= 0 ? 'success.main' : 'error.main'}
              >
                {stats.trend > 0 ? '+' : ''}{stats.trend}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Xu hướng
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart */}
      <Box>{renderChart()}</Box>
    </Paper>
  );
}