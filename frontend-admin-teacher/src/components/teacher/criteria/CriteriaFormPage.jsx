'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormHelperText,
  Card,
  CardContent,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  Save
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import useCriteriaFilters from '@/hooks/useCriteriaFilters';
import { criteriaApi } from '@/services/criteriaService';

// Simple validation schema matching backend model
const validationSchema = yup.object({
  criteria_name: yup.string().required('Tên tiêu chí là bắt buộc'),
  description: yup.string().required('Mô tả là bắt buộc').min(1, 'Mô tả không được để trống'),
  rubric_prompt: yup.string().required('Prompt rubric là bắt buộc'),
  question_type_id: yup.number().required('Loại câu hỏi là bắt buộc'),
  aptis_type_id: yup.number().required('Loại APTIS là bắt buộc'),
  max_score: yup.number().min(1, 'Điểm tối đa phải lớn hơn 0').max(100, 'Điểm tối đa không được quá 100').required('Điểm tối đa là bắt buộc'),
  weight: yup.number().min(0.1, 'Trọng số phải lớn hơn 0').max(10, 'Trọng số không được quá 10').required('Trọng số là bắt buộc')
});

export default function CriteriaFormPage({ 
  onSave,
  criteria = null,
  loading = false,
  pageTitle = 'Tạo tiêu chí mới'
}) {
  const router = useRouter();
  const isEdit = !!criteria;
  
  // Use custom hook for filter options
  const {
    aptisTypes,
    loading: filtersLoading
  } = useCriteriaFilters();
  
  const [availableQuestionTypes, setAvailableQuestionTypes] = useState([]);

  useEffect(() => {
    console.log('[CriteriaFormPage] Component mounted with criteria:', {
      hasCriteria: !!criteria,
      criteria_id: criteria?.id,
      criteria_name: criteria?.criteria_name,
      question_type_id: criteria?.question_type_id,
      aptis_type_id: criteria?.aptis_type_id,
      max_score: criteria?.max_score,
      weight: criteria?.weight
    });
  }, [criteria]);

  const formik = useFormik({
    initialValues: {
      criteria_name: criteria?.criteria_name || '',
      description: criteria?.description || '',
      rubric_prompt: criteria?.rubric_prompt || '',
      question_type_id: criteria?.question_type_id || '',
      aptis_type_id: criteria?.aptis_type_id || '',
      max_score: criteria?.max_score || 10,
      weight: criteria?.weight || 1.0
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        console.log('[CriteriaFormPage] Submitting form with values:', values);
        // Convert string values to numbers for IDs
        const submitData = {
          ...values,
          question_type_id: parseInt(values.question_type_id),
          aptis_type_id: parseInt(values.aptis_type_id),
          max_score: parseFloat(values.max_score),
          weight: parseFloat(values.weight)
        };
        
        console.log('[CriteriaFormPage] Submit data after conversion:', submitData);
        onSave(submitData);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
  });

  // Fetch question types for criteria on mount
  useEffect(() => {
    const fetchQuestionTypes = async () => {
      try {
        const response = await criteriaApi.getQuestionTypesForCriteria();
        console.log('Question types response:', response);
        
        let questionTypes = [];
        
        // Handle both response.data and response.success format
        if (response?.data && Array.isArray(response.data)) {
          questionTypes = response.data.map(type => ({
            value: type.id,
            label: type.question_type_name,
            code: type.code,
            skillTypeId: type.skill_type_id
          }));
        }
        
        console.log('Mapped question types:', questionTypes);
        
        if (questionTypes.length > 0) {
          setAvailableQuestionTypes(questionTypes);
        } else {
          // Fallback data
          setAvailableQuestionTypes([
            { value: 1, label: 'Writing Short (50-100 words)', code: 'WRITING_SHORT' },
            { value: 2, label: 'Writing Long (150-200 words)', code: 'WRITING_LONG' },
            { value: 3, label: 'Email Writing', code: 'WRITING_EMAIL' },
            { value: 4, label: 'Essay Writing', code: 'WRITING_ESSAY' },
            { value: 5, label: 'Speaking Introduction', code: 'SPEAKING_INTRO' },
            { value: 6, label: 'Speaking Description', code: 'SPEAKING_DESCRIPTION' },
            { value: 7, label: 'Speaking Comparison', code: 'SPEAKING_COMPARISON' },
            { value: 8, label: 'Speaking Discussion', code: 'SPEAKING_DISCUSSION' },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch question types:', error);
        // Fallback data on error
        setAvailableQuestionTypes([
          { value: 1, label: 'Writing Short (50-100 words)', code: 'WRITING_SHORT' },
          { value: 2, label: 'Writing Long (150-200 words)', code: 'WRITING_LONG' },
          { value: 3, label: 'Email Writing', code: 'WRITING_EMAIL' },
          { value: 4, label: 'Essay Writing', code: 'WRITING_ESSAY' },
          { value: 5, label: 'Speaking Introduction', code: 'SPEAKING_INTRO' },
          { value: 6, label: 'Speaking Description', code: 'SPEAKING_DESCRIPTION' },
          { value: 7, label: 'Speaking Comparison', code: 'SPEAKING_COMPARISON' },
          { value: 8, label: 'Speaking Discussion', code: 'SPEAKING_DISCUSSION' },
        ]);
      }
    };

    fetchQuestionTypes();
  }, []);

  const handleBack = () => {
    router.push('/teacher/criteria');
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="text"
            startIcon={<ArrowBack />}
            onClick={handleBack}
            disabled={loading || filtersLoading}
          >
            Quay lại
          </Button>
          <Typography variant="h4" fontWeight="bold">
            {pageTitle}
          </Typography>
        </Box>
      </Box>

      {/* Form Card */}
      <Card>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="criteria_name"
                  label="Tên tiêu chí *"
                  value={formik.values.criteria_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.criteria_name && Boolean(formik.errors.criteria_name)}
                  helperText={formik.touched.criteria_name && formik.errors.criteria_name}
                  placeholder="Nhập tên tiêu chí đánh giá..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Mô tả tiêu chí *"
                  multiline
                  rows={2}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                  placeholder="Mô tả ngắn gọn về tiêu chí này..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="rubric_prompt"
                  label="Prompt Rubric *"
                  multiline
                  rows={4}
                  value={formik.values.rubric_prompt}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.rubric_prompt && Boolean(formik.errors.rubric_prompt)}
                  helperText={formik.touched.rubric_prompt && formik.errors.rubric_prompt}
                  placeholder="Nhập prompt chi tiết để AI có thể đánh giá theo tiêu chí này..."
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={formik.touched.aptis_type_id && Boolean(formik.errors.aptis_type_id)}>
                  <InputLabel>Loại APTIS *</InputLabel>
                  <Select
                    name="aptis_type_id"
                    value={formik.values.aptis_type_id}
                    label="Loại APTIS *"
                    onChange={formik.handleChange}
                  >
                    {aptisTypes.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.aptis_type_id && formik.errors.aptis_type_id && (
                    <FormHelperText>{formik.errors.aptis_type_id}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={formik.touched.question_type_id && Boolean(formik.errors.question_type_id)}>
                  <InputLabel>Loại câu hỏi *</InputLabel>
                  <Select
                    name="question_type_id"
                    value={formik.values.question_type_id}
                    label="Loại câu hỏi *"
                    onChange={formik.handleChange}
                  >
                    {availableQuestionTypes.length === 0 ? (
                      <MenuItem disabled>
                        {filtersLoading ? 'Đang tải...' : 'Không có loại câu hỏi'}
                      </MenuItem>
                    ) : (
                      availableQuestionTypes.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {formik.touched.question_type_id && formik.errors.question_type_id && (
                    <FormHelperText>{formik.errors.question_type_id}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  name="max_score"
                  label="Điểm tối đa *"
                  type="number"
                  value={formik.values.max_score}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.max_score && Boolean(formik.errors.max_score)}
                  helperText={formik.touched.max_score && formik.errors.max_score}
                  inputProps={{ min: 1, max: 100, step: 1 }}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  name="weight"
                  label="Trọng số *"
                  type="number"
                  value={formik.values.weight}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.weight && Boolean(formik.errors.weight)}
                  helperText={formik.touched.weight && formik.errors.weight}
                  inputProps={{ min: 0.1, max: 10, step: 0.1 }}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2} pt={3}>
                <Button 
                  onClick={handleBack} 
                  disabled={loading || filtersLoading}
                  variant="outlined"
                  startIcon={<ArrowBack />}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading || filtersLoading || !formik.isValid}
                  color="primary"
                >
                  {loading ? 'Đang lưu...' : (isEdit ? 'Cập nhật tiêu chí' : 'Tạo tiêu chí')}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
