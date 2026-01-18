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
  Grid,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Search,
  Clear,
  FilterList
} from '@mui/icons-material';

export default function SubmissionFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  availableExams = []
}) {
  const handleFilterChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.skill_type) count++;
    if (filters.grading_status) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box mb={2}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterList />
          Lọc bài cần chấm
          {activeFiltersCount > 0 && (
            <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
              ({activeFiltersCount} điều kiện)
            </Typography>
          )}
        </Typography>

        <Grid container spacing={2} alignItems="center">
          {/* Kỹ năng - chỉ giữ Writing/Speaking */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="medium">
              <InputLabel>Kỹ năng</InputLabel>
              <Select
                value={filters.skill_type || ''}
                label="Kỹ năng"
                onChange={(e) => handleFilterChange('skill_type', e.target.value)}
              >
                <MenuItem value="">Tất cả kỹ năng</MenuItem>
                <MenuItem value="WRITING">Writing (Viết)</MenuItem>
                <MenuItem value="SPEAKING">Speaking (Nói)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Trạng thái chấm điểm - rõ ràng hơn */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="medium">
              <InputLabel>Trạng thái chấm</InputLabel>
              <Select
                value={filters.grading_status || ''}
                label="Trạng thái chấm"
                onChange={(e) => handleFilterChange('grading_status', e.target.value)}
              >
                <MenuItem value="">Tất cả trạng thái</MenuItem>
                <MenuItem value="ungraded">❌ Chưa chấm</MenuItem>
                <MenuItem value="ai_graded">🤖 AI đã chấm (cần kiểm tra)</MenuItem>
                <MenuItem value="manually_graded">✅ Giáo viên đã chấm</MenuItem>
                <MenuItem value="needs_review">⚠️ Cần xem xét lại</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Clear Filters Button */}
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={2}>
              <Button
                size="large"
                startIcon={<Clear />}
                onClick={onClearFilters}
                disabled={activeFiltersCount === 0}
                variant="outlined"
                color="secondary"
              >
                Xóa bộ lọc
              </Button>
              {activeFiltersCount > 0 && (
                <Chip 
                  label={`${activeFiltersCount} bộ lọc đang áp dụng`}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}