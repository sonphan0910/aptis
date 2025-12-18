'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Preview,
  Add,
  Delete,
  ExpandMore,
  Rule,
  Star
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { fetchCriteriaById, updateCriteria, fetchCriteria } from '@/store/slices/criteriaSlice';
import { showNotification } from '@/store/slices/uiSlice';
import { DEFAULT_QUESTION_TYPES, DEFAULT_APTIS_TYPES } from '@/constants/filterOptions';

const validationSchema = yup.object({
  criteria_name: yup.string().required('Tên tiêu chí không được để trống'),
  question_type_id: yup.string().required('Loại câu hỏi không được để trống'),
  aptis_type_id: yup.string().required('Loại APTIS không được để trống'),
  max_score: yup.number().required('Điểm tối đa không được để trống').min(1, 'Điểm tối đa phải lớn hơn 0').max(10, 'Điểm tối đa không vượt quá 10'),
  rubric_prompt: yup.string().required('Hướng dẫn chấm điểm không được để trống')
});

export default function EditCriteriaPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const { currentCriteria, isLoading: criteriaLoading } = useSelector(state => state.criteria);

  const [rubricLevels, setRubricLevels] = useState([]);
  const [examples, setExamples] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const criteriaId = params.id;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && criteriaId) {
      dispatch(fetchCriteriaById(criteriaId));
    }
  }, [isMounted, criteriaId, dispatch]);

  useEffect(() => {
    if (currentCriteria) {
      formik.setValues({
        criteria_name: currentCriteria.criteria_name || '',
        question_type_id: currentCriteria.question_type_id || '',
        aptis_type_id: currentCriteria.aptis_type_id || '',
        max_score: currentCriteria.max_score || 10,
        rubric_prompt: currentCriteria.rubric_prompt || ''
      });

      // Initialize rubric levels from data or create defaults
      if (currentCriteria.rubric_data?.levels) {
        setRubricLevels(currentCriteria.rubric_data.levels);
      } else {
        setRubricLevels([
          { id: 1, level_number: 0, name: 'Yếu', description: '', indicators: [] },
          { id: 2, level_number: 1, name: 'Trung bình', description: '', indicators: [] },
          { id: 3, level_number: 2, name: 'Tốt', description: '', indicators: [] }
        ]);
      }

      if (currentCriteria.rubric_data?.examples) {
        setExamples(currentCriteria.rubric_data.examples);
      }
    }
  }, [currentCriteria]);

  const formik = useFormik({
    initialValues: {
      criteria_name: '',
      question_type_id: '',
      aptis_type_id: '',
      max_score: 10,
      rubric_prompt: ''
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        const submitData = {
          ...values,
          question_type_id: parseInt(values.question_type_id),
          aptis_type_id: parseInt(values.aptis_type_id),
          max_score: parseInt(values.max_score),
          weight: currentCriteria.weight || 1,
          rubric_data: {
            levels: rubricLevels,
            examples: examples
          }
        };

        await dispatch(updateCriteria({ id: criteriaId, criteriaData: submitData }));
        dispatch(showNotification({
          type: 'success',
          message: 'Cập nhật tiêu chí thành công'
        }));

        dispatch(fetchCriteria({ page: 1, limit: 10 }));
        router.push('/teacher/criteria');
      } catch (error) {
        dispatch(showNotification({
          type: 'error',
          message: error.message || 'Cập nhật tiêu chí thất bại'
        }));
      } finally {
        setLoading(false);
      }
    }
  });

  const updateRubricLevel = (index, field, value) => {
    const updated = [...rubricLevels];
    updated[index] = { ...updated[index], [field]: value };
    setRubricLevels(updated);
  };

  const addIndicator = (levelIndex, indicator) => {
    if (!indicator.trim()) return;
    const updated = [...rubricLevels];
    updated[levelIndex].indicators = [...(updated[levelIndex].indicators || []), indicator.trim()];
    setRubricLevels(updated);
  };

  const removeIndicator = (levelIndex, indicatorIndex) => {
    const updated = [...rubricLevels];
    updated[levelIndex].indicators.splice(indicatorIndex, 1);
    setRubricLevels(updated);
  };

  const addExample = () => {
    setExamples([...examples, {
      id: Date.now(),
      score: 0,
      response: '',
      explanation: ''
    }]);
  };

  const updateExample = (index, field, value) => {
    const updated = [...examples];
    updated[index] = { ...updated[index], [field]: value };
    setExamples(updated);
  };

  const removeExample = (index) => {
    const updated = [...examples];
    updated.splice(index, 1);
    setExamples(updated);
  };

  const questionTypeOptions = DEFAULT_QUESTION_TYPES.filter(t =>
    t.label.includes('Writing') || t.label.includes('Speaking')
  );

  if (criteriaLoading && !currentCriteria) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isMounted) {
    return null;
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="text"
            startIcon={<ArrowBack />}
            onClick={() => router.push('/teacher/criteria')}
            disabled={loading}
          >
            Quay lại
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Chỉnh sửa tiêu chí chấm điểm
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Preview />}
            onClick={() => setPreviewOpen(true)}
            disabled={!formik.isValid}
          >
            Xem trước
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={formik.handleSubmit}
            disabled={loading || !formik.isValid}
          >
            {loading ? 'Đang lưu...' : 'Cập nhật'}
          </Button>
        </Box>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        {/* Basic Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rule /> Thông tin cơ bản
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên tiêu chí"
                  name="criteria_name"
                  value={formik.values.criteria_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.criteria_name && Boolean(formik.errors.criteria_name)}
                  helperText={formik.touched.criteria_name && formik.errors.criteria_name}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth required error={formik.touched.question_type_id && Boolean(formik.errors.question_type_id)}>
                  <InputLabel>Loại câu hỏi</InputLabel>
                  <Select
                    name="question_type_id"
                    value={formik.values.question_type_id}
                    label="Loại câu hỏi"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="">Chọn loại câu hỏi</MenuItem>
                    {questionTypeOptions.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth required error={formik.touched.aptis_type_id && Boolean(formik.errors.aptis_type_id)}>
                  <InputLabel>Loại APTIS</InputLabel>
                  <Select
                    name="aptis_type_id"
                    value={formik.values.aptis_type_id}
                    label="Loại APTIS"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="">Chọn loại APTIS</MenuItem>
                    {DEFAULT_APTIS_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Điểm tối đa"
                  name="max_score"
                  value={formik.values.max_score}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.max_score && Boolean(formik.errors.max_score)}
                  helperText={formik.touched.max_score && formik.errors.max_score}
                  inputProps={{ min: 1, max: 10 }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Hướng dẫn chấm điểm"
                  name="rubric_prompt"
                  value={formik.values.rubric_prompt}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.rubric_prompt && Boolean(formik.errors.rubric_prompt)}
                  helperText={formik.touched.rubric_prompt && formik.errors.rubric_prompt || 'Chi tiết cách đánh giá theo từng mức'}
                  required
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Rubric Levels */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Star /> Thang điểm chi tiết
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              Định nghĩa từng mức điểm từ {formik.values.max_score} (cao nhất) đến 0 (thấp nhất)
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {rubricLevels
                .sort((a, b) => b.level_number - a.level_number)
                .map((level, index) => (
                  <Accordion key={level.id} defaultExpanded={index < 1}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Chip
                          label={`${level.level_number} điểm`}
                          color="primary"
                          size="small"
                        />
                        <Typography variant="subtitle1" fontWeight="bold">
                          {level.name}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Tên mức đánh giá"
                            value={level.name}
                            onChange={(e) => updateRubricLevel(index, 'name', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Số điểm"
                            value={level.level_number}
                            onChange={(e) => updateRubricLevel(index, 'level_number', parseInt(e.target.value))}
                            size="small"
                            inputProps={{ min: 0, max: formik.values.max_score }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Mô tả mức điểm"
                            value={level.description}
                            onChange={(e) => updateRubricLevel(index, 'description', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                            Chỉ báo đánh giá:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                            {(level.indicators || []).map((indicator, indIndex) => (
                              <Chip
                                key={indIndex}
                                label={indicator}
                                onDelete={() => removeIndicator(index, indIndex)}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                          <TextField
                            fullWidth
                            label="Thêm chỉ báo"
                            size="small"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.target.value) {
                                addIndicator(index, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            placeholder="Nhập chỉ báo và nhấn Enter"
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
            </Box>
          </CardContent>
        </Card>

        {/* Examples */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" color="primary">
                Ví dụ mẫu (tùy chọn)
              </Typography>
              <Button
                startIcon={<Add />}
                onClick={addExample}
                variant="outlined"
                size="small"
              >
                Thêm ví dụ
              </Button>
            </Box>

            {examples.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.light' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Điểm</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ví dụ câu trả lời</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Giải thích</TableCell>
                      <TableCell width={50} align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {examples.map((example, index) => (
                      <TableRow key={example.id}>
                        <TableCell width={60}>
                          <TextField
                            type="number"
                            size="small"
                            value={example.score}
                            onChange={(e) => updateExample(index, 'score', parseInt(e.target.value))}
                            inputProps={{ min: 0, max: formik.values.max_score }}
                            sx={{ width: 70 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                            value={example.response}
                            onChange={(e) => updateExample(index, 'response', e.target.value)}
                            placeholder="Nhập ví dụ..."
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                            value={example.explanation}
                            onChange={(e) => updateExample(index, 'explanation', e.target.value)}
                            placeholder="Giải thích..."
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => removeExample(index)}
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography color="text.secondary">
                  Chưa có ví dụ mẫu. Nhấn "Thêm ví dụ" để tạo ví dụ đầu tiên.
                </Typography>
              </Paper>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/teacher/criteria')}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            type="submit"
            disabled={loading || !formik.isValid}
          >
            {loading ? 'Đang lưu...' : 'Cập nhật tiêu chí'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
