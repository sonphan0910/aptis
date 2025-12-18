'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Divider,
  Alert,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Add,
  Delete,
  ExpandMore,
  Save,
  Close,
  Assignment,
  Star,
  Rule
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  name: yup.string().required('Tên tiêu chí không được để trống'),
  description: yup.string().required('Mô tả không được để trống'),
  question_type: yup.string().required('Loại câu hỏi không được để trống'),
  aptis_type: yup.string().required('Loại APTIS không được để trống'),
  skill: yup.string().required('Kỹ năng không được để trống'),
  max_score: yup.number().required('Điểm tối đa không được để trống').min(1, 'Điểm tối đa phải lớn hơn 0')
});

const questionTypes = [
  'grammar_mcq', 'grammar_gap_filling', 'grammar_ordering', 
  'vocabulary_mcq', 'vocabulary_matching', 
  'reading_comprehension', 'reading_matching',
  'listening_mcq', 'listening_comprehension',
  'writing_prompt', 'writing_essay',
  'speaking_task', 'speaking_presentation'
];

const aptisTypes = ['General', 'Academic', 'Business'];
const skills = ['listening', 'reading', 'writing', 'speaking'];

export default function CriteriaForm({ 
  open, 
  onClose, 
  onSave,
  criteria = null,
  loading = false 
}) {
  const isEdit = !!criteria;
  const [rubricLevels, setRubricLevels] = useState([]);
  const [examples, setExamples] = useState([]);

  const formik = useFormik({
    initialValues: {
      name: criteria?.name || '',
      description: criteria?.description || '',
      question_type: criteria?.question_type || '',
      aptis_type: criteria?.aptis_type || '',
      skill: criteria?.skill || '',
      max_score: criteria?.max_score || 5,
      guidelines: criteria?.guidelines || ''
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const submitData = {
        ...values,
        rubric_levels: rubricLevels,
        examples: examples
      };
      onSave(submitData);
    }
  });

  useEffect(() => {
    if (criteria) {
      setRubricLevels(criteria.rubric_levels || []);
      setExamples(criteria.examples || []);
    } else {
      // Initialize with default rubric levels based on max_score
      initializeDefaultRubricLevels(formik.values.max_score);
    }
  }, [criteria, formik.values.max_score]);

  const initializeDefaultRubricLevels = (maxScore) => {
    const defaultLevels = [];
    for (let i = 0; i <= maxScore; i++) {
      defaultLevels.push({
        id: Date.now() + i,
        level_number: i,
        name: i === 0 ? 'Không đạt' : i === maxScore ? 'Xuất sắc' : `Mức ${i}`,
        description: '',
        indicators: []
      });
    }
    setRubricLevels(defaultLevels);
  };

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

  const handleClose = () => {
    formik.resetForm();
    setRubricLevels([]);
    setExamples([]);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { minHeight: '80vh' } }}
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Assignment color="primary" />
              <Typography variant="h5">
                {isEdit ? 'Chỉnh sửa tiêu chí' : 'Tạo tiêu chí mới'}
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {/* Basic Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Thông tin cơ bản
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Tên tiêu chí"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="description"
                    label="Mô tả tiêu chí"
                    multiline
                    rows={3}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth required>
                    <InputLabel>Loại câu hỏi</InputLabel>
                    <Select
                      name="question_type"
                      value={formik.values.question_type}
                      label="Loại câu hỏi"
                      onChange={formik.handleChange}
                      error={formik.touched.question_type && Boolean(formik.errors.question_type)}
                    >
                      {questionTypes.map(type => (
                        <MenuItem key={type} value={type}>
                          {type.replace(/_/g, ' ').toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth required>
                    <InputLabel>Loại APTIS</InputLabel>
                    <Select
                      name="aptis_type"
                      value={formik.values.aptis_type}
                      label="Loại APTIS"
                      onChange={formik.handleChange}
                      error={formik.touched.aptis_type && Boolean(formik.errors.aptis_type)}
                    >
                      {aptisTypes.map(type => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth required>
                    <InputLabel>Kỹ năng</InputLabel>
                    <Select
                      name="skill"
                      value={formik.values.skill}
                      label="Kỹ năng"
                      onChange={formik.handleChange}
                      error={formik.touched.skill && Boolean(formik.errors.skill)}
                    >
                      {skills.map(skill => (
                        <MenuItem key={skill} value={skill}>
                          {skill.charAt(0).toUpperCase() + skill.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    name="max_score"
                    label="Điểm tối đa"
                    type="number"
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
                    name="guidelines"
                    label="Hướng dẫn chấm điểm"
                    multiline
                    rows={4}
                    value={formik.values.guidelines}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Nhập hướng dẫn chi tiết về cách áp dụng tiêu chí này..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Rubric Levels */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                <Rule sx={{ mr: 1, verticalAlign: 'middle' }} />
                Thang điểm chi tiết
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Định nghĩa từng mức điểm và các chỉ báo đánh giá tương ứng
              </Alert>

              {rubricLevels
                .sort((a, b) => b.level_number - a.level_number)
                .map((level, index) => (
                  <Accordion key={level.id} defaultExpanded={index < 2}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Chip 
                          label={`${level.level_number}/${formik.values.max_score}`}
                          color="primary"
                          icon={<Star />}
                        />
                        <Typography variant="subtitle1">
                          {level.name}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Tên mức"
                            value={level.name}
                            onChange={(e) => updateRubricLevel(index, 'name', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Mô tả mức điểm"
                            multiline
                            rows={2}
                            value={level.description}
                            onChange={(e) => updateRubricLevel(index, 'description', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
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
                            label="Thêm chỉ báo mới"
                            size="small"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
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
                      <TableRow>
                        <TableCell>Điểm</TableCell>
                        <TableCell>Ví dụ câu trả lời</TableCell>
                        <TableCell>Giải thích</TableCell>
                        <TableCell width={50}>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {examples.map((example, index) => (
                        <TableRow key={example.id}>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={example.score}
                              onChange={(e) => updateExample(index, 'score', parseInt(e.target.value))}
                              inputProps={{ min: 0, max: formik.values.max_score }}
                              sx={{ width: 80 }}
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
                              placeholder="Nhập ví dụ câu trả lời..."
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
                              placeholder="Giải thích tại sao đạt điểm này..."
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => removeExample(index)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography color="text.secondary">
                    Chưa có ví dụ mẫu. Nhấn "Thêm ví dụ" để tạo ví dụ đầu tiên.
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save />}
            disabled={loading || !formik.isValid}
          >
            {loading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}