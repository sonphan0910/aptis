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
  CardContent,
  FormHelperText,
  Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

// Validation schema
const validationSchema = yup.object({
  title: yup.string().required('Tên bài thi là bắt buộc').min(3, 'Tên bài thi phải có ít nhất 3 ký tự'),
  description: yup.string(),
  aptis_type_id: yup.number().required('Loại APTIS là bắt buộc'),
  duration_minutes: yup.number().min(1, 'Thời gian phải lớn hơn 0').max(600, 'Thời gian không được quá 10 giờ').required('Thời gian là bắt buộc'),
});

const ExamForm = ({ examData, onSubmit, loading = false, isEditing = false }) => {
  const [aptisTypes, setAptisTypes] = useState([
    { id: 1, code: 'GENERAL', aptis_type_name: 'APTIS General' },
    { id: 2, code: 'ADVANCED', aptis_type_name: 'APTIS Advanced' },
    { id: 3, code: 'FOR_TEACHERS', aptis_type_name: 'APTIS for Teachers' },
    { id: 4, code: 'FOR_TEENS', aptis_type_name: 'APTIS for Teens' }
  ]);

  const formik = useFormik({
    initialValues: {
      title: examData?.title || '',
      description: examData?.description || '',
      aptis_type_id: examData?.aptis_type_id || '',
      duration_minutes: examData?.duration_minutes || 60,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const submitData = {
          ...values,
          aptis_type_id: parseInt(values.aptis_type_id),
          duration_minutes: parseInt(values.duration_minutes),
        };
        
        await onSubmit(submitData);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
  });

  const handleFieldChange = (fieldName, value) => {
    formik.setFieldValue(fieldName, value);
    
    // Auto-save functionality (optional)
    if (isEditing) {
      const updatedData = {
        ...formik.values,
        [fieldName]: value
      };
      // Could implement debounced auto-save here
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {isEditing ? 'Chỉnh sửa thông tin bài thi' : 'Thông tin cơ bản'}
        </Typography>
        
        {isEditing && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Thay đổi sẽ được lưu khi bạn nhấn nút "Lưu" ở header.
          </Alert>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="title"
                label="Tên bài thi *"
                value={formik.values.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                disabled={loading}
                placeholder="Nhập tên bài thi..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="description"
                label="Mô tả bài thi"
                value={formik.values.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                disabled={loading}
                placeholder="Mô tả ngắn gọn về bài thi..."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.aptis_type_id && Boolean(formik.errors.aptis_type_id)}
                disabled={loading}
              >
                <InputLabel>Loại APTIS *</InputLabel>
                <Select
                  name="aptis_type_id"
                  value={formik.values.aptis_type_id}
                  onChange={(e) => handleFieldChange('aptis_type_id', e.target.value)}
                  onBlur={formik.handleBlur}
                  label="Loại APTIS *"
                >
                  {aptisTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.aptis_type_name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.aptis_type_id && formik.errors.aptis_type_id && (
                  <FormHelperText>{formik.errors.aptis_type_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                name="duration_minutes"
                label="Thời gian (phút) *"
                value={formik.values.duration_minutes}
                onChange={(e) => handleFieldChange('duration_minutes', e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.duration_minutes && Boolean(formik.errors.duration_minutes)}
                helperText={formik.touched.duration_minutes && formik.errors.duration_minutes}
                disabled={loading}
                inputProps={{ min: 1, max: 600 }}
              />
            </Grid>

            {/* Additional information for editing mode */}
            {isEditing && examData && (
              <>
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Thông tin bổ sung
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Trạng thái
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {examData.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Số phần thi
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {examData.sections?.length || 0}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Tổng câu hỏi
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {examData.sections?.reduce((total, section) => 
                            total + (section.questions?.length || 0), 0) || 0}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Điểm tối đa
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {examData.total_score || 0}
                        </Typography>
                      </Grid>
                      
                      {examData.created_at && (
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            Ngày tạo
                          </Typography>
                          <Typography variant="body1">
                            {new Date(examData.created_at).toLocaleDateString('vi-VN')}
                          </Typography>
                        </Grid>
                      )}
                      
                      {examData.published_at && (
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            Ngày xuất bản
                          </Typography>
                          <Typography variant="body1">
                            {new Date(examData.published_at).toLocaleDateString('vi-VN')}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>

          {!isEditing && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !formik.isValid}
              >
                {loading ? 'Đang lưu...' : 'Tiếp tục'}
              </Button>
            </Box>
          )}
        </form>

        {/* Form debugging info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" display="block">
              Debug: Form dirty: {formik.dirty.toString()}, Valid: {formik.isValid.toString()}
            </Typography>
            <Typography variant="caption" display="block">
              Values: {JSON.stringify(formik.values)}
            </Typography>
            {Object.keys(formik.errors).length > 0 && (
              <Typography variant="caption" display="block" color="error">
                Errors: {JSON.stringify(formik.errors)}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ExamForm;