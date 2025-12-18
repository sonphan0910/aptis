'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent
} from '@mui/material';

const ExamForm = ({ initialData, onSubmit, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    aptis_type: '',
    time_limit: 60,
    status: 'draft'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        aptis_type: initialData.aptis_type || '',
        time_limit: initialData.time_limit || 60,
        status: initialData.status || 'draft'
      });
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onSubmit(newData);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Thông tin cơ bản
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tên bài thi *"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Mô tả"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Loại APTIS</InputLabel>
              <Select
                value={formData.aptis_type}
                onChange={(e) => handleInputChange('aptis_type', e.target.value)}
                label="Loại APTIS"
              >
                <MenuItem value="general">APTIS General</MenuItem>
                <MenuItem value="advanced">APTIS Advanced</MenuItem>
                <MenuItem value="for_teachers">APTIS for Teachers</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Thời gian (phút)"
              value={formData.time_limit}
              onChange={(e) => handleInputChange('time_limit', parseInt(e.target.value))}
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Thống kê bài thi:
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Typography variant="body2">
              Số phần: {initialData?.sections?.length || 0}
            </Typography>
            <Typography variant="body2">
              Tổng câu hỏi: {initialData?.sections?.reduce((total, section) => 
                total + (section.questions?.length || 0), 0) || 0}
            </Typography>
            <Typography variant="body2">
              Thời gian: {formData.time_limit} phút
            </Typography>
            <Typography variant="body2">
              Trạng thái: {formData.status === 'published' ? 'Đã công khai' : 'Bản nháp'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ExamForm;