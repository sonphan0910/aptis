'use client';

import { useState, useMemo, useCallback } from 'react';
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
  Paper,
  Chip,
  FormControlLabel,
  Checkbox,
  Slider
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Reading components
import {
  ReadingGapFillingForm,
  ReadingOrderingForm,
  ReadingMatchingForm,
  ReadingMatchingHeadingsForm,
  ReadingShortTextForm
} from './reading';

// Listening components
import {
  ListeningMCQSingleForm,
  ListeningMCQMultiForm,
  ListeningMatchingForm,
  ListeningStatementMatchingForm
} from './listening';

// Speaking components
import {
  SpeakingSimpleForm,
  SpeakingDescriptionForm,
  SpeakingComparisonForm
} from './speaking';

// Writing components
import {
  WritingShortResponseForm,
  WritingFormFillingForm,
  WritingChatResponsesForm,
  WritingEmailForm
} from './writing';

// Common components
import { QuestionStructureGuide } from './common';

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Dễ', color: '#4caf50' },
  { value: 'medium', label: 'Trung bình', color: '#ff9800' },
  { value: 'hard', label: 'Khó', color: '#f44336' }
];

const questionSchema = Yup.object().shape({
  difficulty: Yup.string().required('Độ khó là bắt buộc'),
  // Remove content validation from Formik - we handle it separately with questionContent state
});

// Validation function for question content (moved outside component to prevent recreation)
const validateQuestionContent = (content) => {
  if (!content) {
    return { isValid: false, error: 'Nội dung câu hỏi không được để trống' };
  }

  try {
    // If it's a JSON string, parse and check if it has meaningful content
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;

    // Check if it's empty object or has some content
    if (typeof parsed === 'object' && parsed !== null) {
      // For objects, check if it has any meaningful properties
      const keys = Object.keys(parsed);
      if (keys.length === 0) {
        return { isValid: false, error: 'Câu hỏi chưa có nội dung' };
      }

      // Check if any property has meaningful content
      for (const key of keys) {
        const value = parsed[key];
        if (typeof value === 'string' && value.trim()) {
          return { isValid: true, error: null };
        }
        if (Array.isArray(value) && value.length > 0) {
          return { isValid: true, error: null };
        }
        if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
          return { isValid: true, error: null };
        }
      }
      return { isValid: false, error: 'Câu hỏi chưa có nội dung hợp lệ' };
    }

    // For string content, check if it's not empty
    const isValid = typeof parsed === 'string' && parsed.trim().length > 0;
    return {
      isValid,
      error: isValid ? null : 'Nội dung câu hỏi không được để trống'
    };
  } catch (error) {
    // If it's not JSON, treat as plain string
    const isValid = typeof content === 'string' && content.trim().length > 0;
    return {
      isValid,
      error: isValid ? null : 'Nội dung câu hỏi không hợp lệ'
    };
  }
};

export default function QuestionForm({
  aptisType,
  skillType,
  questionType,
  aptisData = null,
  skillData = null,
  questionTypeData = null,
  initialData = {},
  onSubmit,
  onBack,
  isEdit = false
}) {
  const [questionContent, setQuestionContent] = useState(initialData.content || '');
  const [mediaUrl, setMediaUrl] = useState(initialData.media_url || '');
  const [hasDuration, setHasDuration] = useState(!!initialData.duration_seconds);
  const [duration, setDuration] = useState(initialData.duration_seconds ? Math.floor(initialData.duration_seconds / 60) : 5);

  // State for handling audio/media files from Listening forms
  const [audioFiles, setAudioFiles] = useState(null);

  // Use provided data instead of constants
  const selectedAptis = aptisData;
  const selectedSkill = skillData;

  const handleAudioFilesChange = useCallback((files) => {
    console.log('📥 [QuestionForm] Received audioFiles from child:', files);
    setAudioFiles(files);
  }, []);
  const selectedQuestionType = questionTypeData;

  const formik = useFormik({
    initialValues: {
      content: initialData.content || '',
      difficulty: initialData.difficulty || 'medium',
      media_url: initialData.media_url || '',
      duration_seconds: initialData.duration_seconds || null,
      status: initialData.status || 'draft'
    },
    validationSchema: questionSchema,
    enableReinitialize: false, // Disable to prevent infinite loops
    onSubmit: async (values) => {
      // For Writing and Speaking, always set duration_seconds to null
      const questionCode = selectedQuestionType?.code;
      const isSpeakingOrWriting = [
        'SPEAKING_INTRO', 'SPEAKING_DISCUSSION', 'SPEAKING_DESCRIPTION', 'SPEAKING_COMPARISON',
        'WRITING_SHORT', 'WRITING_FORM', 'WRITING_LONG', 'WRITING_EMAIL'
      ].includes(questionCode);

      const submissionData = {
        ...values,
        content: questionContent,
        media_url: mediaUrl,
        duration_seconds: isSpeakingOrWriting ? null : (hasDuration ? duration * 60 : null),
        // Include audio files if provided by Listening forms
        audioFiles: audioFiles
      };

      console.log('🔍 [QuestionForm] Submitting with audioFiles:', audioFiles);

      try {
        await onSubmit(submissionData);
      } catch (error) {
        console.error('[QuestionForm] Error in onSubmit:', error);
        // Re-throw để parent component có thể xử lý
        throw new Error(`Lỗi submit form: ${error.message || error}`);
      }
    }
  });

  const renderSpecificForm = () => {
    // Safety check
    if (!selectedQuestionType) {
      return (
        <Box textAlign="center" py={4}>
          <Typography color="error">
            Loại câu hỏi không được chọn
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Vui lòng quay lại và chọn loại câu hỏi
          </Typography>
        </Box>
      );
    }

    const props = {
      content: questionContent,
      onChange: setQuestionContent,
      onAudioFilesChange: handleAudioFilesChange,
      skillType: selectedSkill,
      questionType: selectedQuestionType,
      aptisData,
      skillData,
      questionTypeData,
      onSubmit: (data) => {
        // Merge form data with question metadata
        const mergedData = {
          ...data,
          aptis_type_id: aptisData?.id,
          skill_type_id: skillData?.id,
          question_type_id: selectedQuestionType?.id
        };
        onSubmit(mergedData);
      },
      onBack: onBack
    };

    // Use the code from questionTypeData (from database)
    const questionCode = selectedQuestionType?.code;
    const skillCode = selectedSkill?.code || skillData?.code;

    // Use new organized components based on skill type and question type
    switch (questionCode) {
      // === READING COMPONENTS ===
      case 'READING_GAP_FILL':
        return <ReadingGapFillingForm {...props} />;
      case 'READING_ORDERING':
        return <ReadingOrderingForm {...props} />;
      case 'READING_MATCHING':
        return <ReadingMatchingForm {...props} />;
      case 'READING_MATCHING_HEADINGS':
        return <ReadingMatchingHeadingsForm {...props} />;

      // === LISTENING COMPONENTS ===
      case 'LISTENING_MCQ':
        return <ListeningMCQSingleForm {...props} />;
      case 'LISTENING_MCQ_MULTI':
        return <ListeningMCQMultiForm {...props} />;
      case 'LISTENING_STATEMENT_MATCHING':
        return <ListeningStatementMatchingForm {...props} />;
      case 'LISTENING_MATCHING':
        return <ListeningMatchingForm {...props} />;

      // === SPEAKING COMPONENTS ===
      case 'SPEAKING_INTRO':
      case 'SPEAKING_DISCUSSION':
        return <SpeakingSimpleForm {...props} />;
      case 'SPEAKING_DESCRIPTION':
        return <SpeakingDescriptionForm {...props} />;
      case 'SPEAKING_COMPARISON':
        return <SpeakingComparisonForm {...props} />;

      // === WRITING COMPONENTS ===
      case 'WRITING_SHORT':
        return <WritingShortResponseForm {...props} />;
      case 'WRITING_FORM':
        return <WritingFormFillingForm {...props} />;
      case 'WRITING_LONG':
        return <WritingChatResponsesForm {...props} />;
      case 'WRITING_EMAIL':
        return <WritingEmailForm {...props} />;

      // === UNSUPPORTED QUESTION TYPES ===
      default:
        return (
          <Box textAlign="center" py={4}>
            <Typography color="error" gutterBottom>
              Loại câu hỏi này chưa được hỗ trợ
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1} sx={{ wordBreak: 'break-all' }}>
              Question Code: {questionCode}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Skill Code: {skillCode}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={2}>
              <strong>Các loại câu hỏi được hỗ trợ:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div" sx={{ mt: 1, textAlign: 'left', display: 'inline-block' }}>
              <strong>Reading:</strong> READING_GAP_FILL, READING_ORDERING, READING_MATCHING, READING_MATCHING_HEADINGS<br />
              <strong>Listening:</strong> LISTENING_MCQ, LISTENING_GAP_FILL, LISTENING_MATCHING, LISTENING_STATEMENT_MATCHING<br />
              <strong>Speaking:</strong> SPEAKING_INTRO, SPEAKING_DESCRIPTION, SPEAKING_COMPARISON, SPEAKING_DISCUSSION<br />
              <strong>Writing:</strong> WRITING_SHORT, WRITING_FORM, WRITING_LONG, WRITING_EMAIL<br />
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={2}>
              Liên hệ admin để thêm support cho loại câu hỏi khác.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      {/* Header Info */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Thông tin câu hỏi
        </Typography>
        <Box display="flex" gap={1} mb={2}>
          <Chip label={selectedAptis?.aptis_type_name} color="primary" />
          <Chip label={selectedSkill?.skill_type_name} color="secondary" />
          <Chip label={selectedQuestionType?.question_type_name} color="info" />
        </Box>

        <Grid container spacing={3}>
          {/* Difficulty */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Độ khó</InputLabel>
              <Select
                name="difficulty"
                value={formik.values.difficulty}
                onChange={formik.handleChange}
                label="Độ khó"
                error={formik.touched.difficulty && Boolean(formik.errors.difficulty)}
              >
                {DIFFICULTY_LEVELS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: level.color
                        }}
                      />
                      {level.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>



          {/* Duration - Only show for Reading and Listening, not for Speaking and Writing */}
          {(() => {
            const questionCode = selectedQuestionType?.code;
            const isSpeakingOrWriting = [
              'SPEAKING_INTRO', 'SPEAKING_DISCUSSION', 'SPEAKING_DESCRIPTION', 'SPEAKING_COMPARISON',
              'WRITING_SHORT', 'WRITING_FORM', 'WRITING_LONG', 'WRITING_EMAIL'
            ].includes(questionCode);

            return !isSpeakingOrWriting;
          })() && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hasDuration}
                      onChange={(e) => setHasDuration(e.target.checked)}
                    />
                  }
                  label="Giới hạn thời gian làm bài"
                />

                {hasDuration && (
                  <Box sx={{ ml: 4, mt: 2 }}>
                    <Typography gutterBottom>
                      Thời gian: {duration} phút
                    </Typography>
                    <Slider
                      value={duration}
                      onChange={(e, value) => setDuration(value)}
                      min={1}
                      max={30}
                      step={1}
                      marks={[
                        { value: 1, label: '1 phút' },
                        { value: 10, label: '10 phút' },
                        { value: 20, label: '20 phút' },
                        { value: 30, label: '30 phút' }
                      ]}
                    />
                  </Box>
                )}
              </Grid>
            )}
        </Grid>
      </Paper>

      {/* Question Content Form */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Nội dung câu hỏi
        </Typography>


        {renderSpecificForm()}
      </Paper>

      {/* Actions */}
      <Box display="flex" gap={2} justifyContent="space-between">
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={onBack}
          disabled={formik.isSubmitting}
        >
          Quay lại
        </Button>

        <Box display="flex" flexDirection="column" alignItems="flex-end">
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save />}
            disabled={formik.isSubmitting || Object.keys(formik.errors).length > 0 || !(typeof questionContent === 'string' && questionContent.trim())}
            size="large"
            title={!(typeof questionContent === 'string' && questionContent.trim()) ? 'Vui lòng điền nội dung câu hỏi' : ''}
          >
            {isEdit ? 'Cập nhật câu hỏi' : 'Tiếp tục'}
          </Button>
          {!(typeof questionContent === 'string' && questionContent.trim()) && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              Vui lòng điền nội dung câu hỏi
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}