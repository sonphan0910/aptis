'use client';

import { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Slider
} from '@mui/material';
import {
  FilterList,
  ExpandMore,
  Clear,
  Search,
  DateRange
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export default function SubmissionFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  availableExams = [],
  availableStudents = [] 
}) {
  const [expanded, setExpanded] = useState(false);

  const handleFilterChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const handleDateRangeChange = (field, value) => {
    onFiltersChange({
      ...filters,
      date_range: {
        ...filters.date_range,
        [field]: value
      }
    });
  };

  const handleScoreRangeChange = (event, newValue) => {
    onFiltersChange({
      ...filters,
      score_range: {
        min: newValue[0],
        max: newValue[1]
      }
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.skill_type) count++;
    if (filters.exam_id) count++;
    if (filters.grading_status) count++;
    if (filters.has_ai_feedback) count++;
    if (filters.student_id) count++;
    if (filters.date_range?.start || filters.date_range?.end) count++;
    if (filters.score_range?.min !== 0 || filters.score_range?.max !== 100) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Accordion 
        expanded={expanded} 
        onChange={(e, isExpanded) => setExpanded(isExpanded)}
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={2}>
            <FilterList />
            <Typography variant="h6">
              Bộ lọc tìm kiếm
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip 
                label={`${activeFiltersCount} bộ lọc đang áp dụng`}
                size="small"
                color="primary"
              />
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Skill Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Kỹ năng</InputLabel>
                <Select
                  value={filters.skill || ''}
                  label="Kỹ năng"
                  onChange={(e) => handleFilterChange('skill', e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="listening">Listening</MenuItem>
                  <MenuItem value="reading">Reading</MenuItem>
                  <MenuItem value="writing">Writing</MenuItem>
                  <MenuItem value="speaking">Speaking</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Exam Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Bài kiểm tra</InputLabel>
                <Select
                  value={filters.exam_id || ''}
                  label="Bài kiểm tra"
                  onChange={(e) => handleFilterChange('exam_id', e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {availableExams.map((exam) => (
                    <MenuItem key={exam.id} value={exam.id}>
                      {exam.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái chấm điểm</InputLabel>
                <Select
                  value={filters.grading_status || ''}
                  label="Trạng thái chấm điểm"
                  onChange={(e) => handleFilterChange('grading_status', e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="ungraded">Chưa chấm điểm</MenuItem>
                  <MenuItem value="ai_graded">AI đã chấm</MenuItem>
                  <MenuItem value="manually_graded">Giáo viên đã chấm</MenuItem>
                  <MenuItem value="needs_review">Cần xem xét lại</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* AI Feedback Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>AI Feedback</InputLabel>
                <Select
                  value={filters.has_ai_feedback || ''}
                  label="AI Feedback"
                  onChange={(e) => handleFilterChange('has_ai_feedback', e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="true">Có AI feedback</MenuItem>
                  <MenuItem value="false">Không có AI feedback</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Skill Type Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Kỹ năng</InputLabel>
                <Select
                  value={filters.skill_type || ''}
                  label="Kỹ năng"
                  onChange={(e) => handleFilterChange('skill_type', e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="WRITING">Writing</MenuItem>
                  <MenuItem value="SPEAKING">Speaking</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Student Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Học sinh</InputLabel>
                <Select
                  value={filters.student_id || ''}
                  label="Học sinh"
                  onChange={(e) => handleFilterChange('student_id', e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {availableStudents.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Date Range Filter */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Khoảng thời gian nộp bài
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box display="flex" gap={2}>
                  <DatePicker
                    label="Từ ngày"
                    value={filters.date_range?.start || null}
                    onChange={(value) => handleDateRangeChange('start', value)}
                    renderInput={(params) => <TextField {...params} size="small" />}
                  />
                  <DatePicker
                    label="Đến ngày"
                    value={filters.date_range?.end || null}
                    onChange={(value) => handleDateRangeChange('end', value)}
                    renderInput={(params) => <TextField {...params} size="small" />}
                  />
                </Box>
              </LocalizationProvider>
            </Grid>

            {/* Score Range Filter */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Khoảng điểm: {filters.score_range?.min || 0} - {filters.score_range?.max || 100}
              </Typography>
              <Box px={2}>
                <Slider
                  value={[filters.score_range?.min || 0, filters.score_range?.max || 100]}
                  onChange={handleScoreRangeChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 25, label: '25' },
                    { value: 50, label: '50' },
                    { value: 75, label: '75' },
                    { value: 100, label: '100' }
                  ]}
                />
              </Box>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  startIcon={<Clear />}
                  onClick={onClearFilters}
                  disabled={activeFiltersCount === 0}
                >
                  Xóa bộ lọc
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={() => setExpanded(false)}
                >
                  Áp dụng lọc
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}