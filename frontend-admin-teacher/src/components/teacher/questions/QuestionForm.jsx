'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Typography,
  Paper
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MCQForm from './MCQForm';
import MatchingForm from './MatchingForm';
import GapFillingForm from './GapFillingForm';
import OrderingForm from './OrderingForm';
import WritingPromptForm from './WritingPromptForm';
import SpeakingTaskForm from './SpeakingTaskForm';

const questionSchema = Yup.object().shape({
  title: Yup.string().required('Tên câu hỏi là bắt buộc'),
  description: Yup.string(),
  aptis_type: Yup.string().required('Loại APTIS là bắt buộc'),
  skill: Yup.string().required('Kỹ năng là bắt buộc'),
  difficulty: Yup.string().required('Độ khó là bắt buộc'),
  content: Yup.object().required('Nội dung câu hỏi là bắt buộc')
});

const skillOptions = {
  mcq: ['listening', 'reading'],
  matching: ['listening', 'reading'],
  gap_filling: ['listening', 'reading'],
  ordering: ['listening', 'reading'],
  writing: ['writing'],
  speaking: ['speaking']
};

export default function QuestionForm({
  questionType,
  initialData = {},
  onSubmit,
  onBack,
  isEditing = false
}) {
  const [content, setContent] = useState(initialData.content || {});

  const formik = useFormik({
    initialValues: {
      title: initialData.title || '',
      description: initialData.description || '',
      aptis_type: initialData.aptis_type || 'general',
      skill: initialData.skill || skillOptions[questionType]?.[0] || '',
      difficulty: initialData.difficulty || 'medium',
      question_type: questionType,
      content: initialData.content || {}
    },
    validationSchema: questionSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit({ ...values, content });
    }
  });

  useEffect(() => {
    if (questionType && !formik.values.skill) {
      formik.setFieldValue('skill', skillOptions[questionType]?.[0] || '');
    }
  }, [questionType]);

  const handleContentChange = (newContent) => {
    setContent(newContent);
    formik.setFieldValue('content', newContent);
  };

  const renderSpecificForm = () => {
    const props = {
      content,
      onChange: handleContentChange,
      skill: formik.values.skill
    };

    switch (questionType) {
      case 'mcq':
        return <MCQForm {...props} />;
      case 'matching':
        return <MatchingForm {...props} />;
      case 'gap_filling':
        return <GapFillingForm {...props} />;
      case 'ordering':
        return <OrderingForm {...props} />;
      case 'writing':
        return <WritingPromptForm {...props} />;
      case 'speaking':
        return <SpeakingTaskForm {...props} />;
      default:
        return <Typography>Chọn loại câu hỏi</Typography>;
    }
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Thông tin cơ bản
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tên câu hỏi"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && !!formik.errors.title}
              helperText={formik.touched.title && formik.errors.title}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mô tả"
              name="description"
              multiline
              rows={2}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Loại APTIS</InputLabel>
              <Select
                name="aptis_type"
                value={formik.values.aptis_type}
                label="Loại APTIS"
                onChange={formik.handleChange}
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Kỹ năng</InputLabel>
              <Select
                name="skill"
                value={formik.values.skill}
                label="Kỹ năng"
                onChange={formik.handleChange}
              >
                {skillOptions[questionType]?.map((skill) => (
                  <MenuItem key={skill} value={skill}>
                    {skill.charAt(0).toUpperCase() + skill.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Độ khó</InputLabel>
              <Select
                name="difficulty"
                value={formik.values.difficulty}
                label="Độ khó"
                onChange={formik.handleChange}
              >
                <MenuItem value="easy">Dễ</MenuItem>
                <MenuItem value="medium">Trung bình</MenuItem>
                <MenuItem value="hard">Khó</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Nội dung câu hỏi
        </Typography>
        {renderSpecificForm()}
      </Paper>

      <Box display="flex" gap={2}>
        {onBack && (
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={onBack}
          >
            Quay lại
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          startIcon={<Save />}
          disabled={!formik.isValid || !content}
        >
          {isEditing ? 'Cập nhật' : 'Tiếp tục'}
        </Button>
      </Box>
    </Box>
  );
}