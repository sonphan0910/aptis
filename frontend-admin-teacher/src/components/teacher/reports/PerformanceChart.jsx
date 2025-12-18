'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function PerformanceChart({ 
  data = [], 
  type = 'line', 
  title = 'Biểu đồ hiệu suất',
  timeRange = '30d',
  skills = ['listening', 'reading', 'writing', 'speaking']
}) {
  const [chartType, setChartType] = useState(type);
  const [selectedSkills, setSelectedSkills] = useState(skills);
  const [processedData, setProcessedData] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setProcessedData(data);
    }
  }, [data]);

  const getTrendIndicator = (data, skill) => {
    if (!data || data.length < 2) return null;
    
    const recent = data.slice(-5); // Last 5 data points
    const first = recent[0]?.[skill] || 0;
    const last = recent[recent.length - 1]?.[skill] || 0;
    
    if (last > first) return { trend: 'up', value: ((last - first) / first * 100).toFixed(1) };
    if (last < first) return { trend: 'down', value: ((first - last) / first * 100).toFixed(1) };
    return { trend: 'stable', value: 0 };
  };

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
        />
        <YAxis domain={[0, 100]} />
        <Tooltip 
          labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
          formatter={(value, name) => [value + '%', name]}
        />
        <Legend />
        {selectedSkills.map((skill, index) => (
          <Line
            key={skill}
            type="monotone"
            dataKey={skill}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            name={skill.charAt(0).toUpperCase() + skill.slice(1)}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
        />
        <YAxis domain={[0, 100]} />
        <Tooltip 
          labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
          formatter={(value, name) => [value + '%', name]}
        />
        <Legend />
        {selectedSkills.map((skill, index) => (
          <Area
            key={skill}
            type="monotone"
            dataKey={skill}
            stackId="1"
            stroke={COLORS[index % COLORS.length]}
            fill={COLORS[index % COLORS.length]}
            fillOpacity={0.6}
            name={skill.charAt(0).toUpperCase() + skill.slice(1)}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
        />
        <YAxis domain={[0, 100]} />
        <Tooltip 
          labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
          formatter={(value, name) => [value + '%', name]}
        />
        <Legend />
        {selectedSkills.map((skill, index) => (
          <Bar
            key={skill}
            dataKey={skill}
            fill={COLORS[index % COLORS.length]}
            name={skill.charAt(0).toUpperCase() + skill.slice(1)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    switch (chartType) {
      case 'area':
        return renderAreaChart();
      case 'bar':
        return renderBarChart();
      default:
        return renderLineChart();
    }
  };

  const getSkillStats = () => {
    if (!processedData || processedData.length === 0) return {};
    
    const stats = {};
    selectedSkills.forEach(skill => {
      const values = processedData.map(d => d[skill] || 0).filter(v => v > 0);
      if (values.length > 0) {
        stats[skill] = {
          avg: (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1),
          max: Math.max(...values),
          min: Math.min(...values),
          trend: getTrendIndicator(processedData, skill)
        };
      }
    });
    return stats;
  };

  const skillStats = getSkillStats();

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">{title}</Typography>
            <Box display="flex" gap={2}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Loại biểu đồ</InputLabel>
                <Select
                  value={chartType}
                  label="Loại biểu đồ"
                  onChange={(e) => setChartType(e.target.value)}
                >
                  <MenuItem value="line">Đường</MenuItem>
                  <MenuItem value="area">Vùng</MenuItem>
                  <MenuItem value="bar">Cột</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Skill Statistics */}
          <Grid container spacing={2} mb={3}>
            {selectedSkills.map((skill) => {
              const stats = skillStats[skill];
              if (!stats) return null;
              
              return (
                <Grid item xs={12} sm={6} md={3} key={skill}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {skill.charAt(0).toUpperCase() + skill.slice(1)}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {stats.avg}%
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      {stats.trend?.trend === 'up' && (
                        <>
                          <TrendingUp color="success" fontSize="small" />
                          <Typography variant="caption" color="success.main">
                            +{stats.trend.value}%
                          </Typography>
                        </>
                      )}
                      {stats.trend?.trend === 'down' && (
                        <>
                          <TrendingDown color="error" fontSize="small" />
                          <Typography variant="caption" color="error.main">
                            -{stats.trend.value}%
                          </Typography>
                        </>
                      )}
                      {stats.trend?.trend === 'stable' && (
                        <>
                          <Remove color="info" fontSize="small" />
                          <Typography variant="caption" color="text.secondary">
                            Ổn định
                          </Typography>
                        </>
                      )}
                    </Box>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {stats.min}% - {stats.max}%
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {/* Chart */}
          {processedData.length > 0 ? (
            renderChart()
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography color="text.secondary">
                Không có dữ liệu để hiển thị biểu đồ
              </Typography>
            </Paper>
          )}

          {/* Legend for skills */}
          <Box mt={2} display="flex" justifyContent="center" flexWrap="wrap" gap={1}>
            {selectedSkills.map((skill, index) => (
              <Chip
                key={skill}
                label={skill.charAt(0).toUpperCase() + skill.slice(1)}
                size="small"
                sx={{
                  backgroundColor: COLORS[index % COLORS.length],
                  color: 'white'
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}