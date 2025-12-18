'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import ExamForm from '@/components/teacher/exams/ExamForm';
import ExamBuilder from '@/components/teacher/exams/ExamBuilder';
import ExamPreview from '@/components/teacher/exams/ExamPreview';
import { createExam } from '@/store/slices/examSlice';
import { showNotification } from '@/store/slices/uiSlice';

const steps = ['Thông tin cơ bản', 'Xây dựng bài thi', 'Xem trước'];

export default function NewExamPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [activeStep, setActiveStep] = useState(0);
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    aptis_type: 'general',
    primary_skill: '',
    duration_minutes: 60,
    instructions: '',
    sections: []
  });
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFormSubmit = (data) => {
    setExamData(prev => ({ ...prev, ...data }));
    handleNext();
  };

  const handleBuilderSubmit = (sections) => {
    setExamData(prev => ({ ...prev, sections }));
    handleNext();
  };

  const handleSave = async (shouldPublish = false) => {
    setLoading(true);
    try {
      const result = await dispatch(createExam({
        ...examData,
        is_published: shouldPublish
      }));
      
      if (createExam.fulfilled.match(result)) {
        dispatch(showNotification({
          message: `${shouldPublish ? 'Tạo và công khai' : 'Lưu'} bài thi thành công!`,
          type: 'success'
        }));
        router.push('/teacher/exams');
      }
    } catch (error) {
      dispatch(showNotification({
        message: 'Có lỗi xảy ra khi tạo bài thi',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <ExamForm
            initialData={examData}
            onSubmit={handleFormSubmit}
          />
        );
      case 1:
        return (
          <ExamBuilder
            examData={examData}
            onSubmit={handleBuilderSubmit}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <Box>
            <ExamPreview exam={examData} />
            <Box mt={3} display="flex" gap={2}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={loading}
              >
                Quay lại chỉnh sửa
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleSave(false)}
                disabled={loading}
              >
                Lưu bản nháp
              </Button>
              <Button
                variant="contained"
                onClick={() => handleSave(true)}
                disabled={loading}
                startIcon={<Save />}
              >
                Lưu & Công khai
              </Button>
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/teacher/exams')}
          sx={{ mr: 2 }}
        >
          Quay lại
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Tạo bài thi mới
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {getStepContent(activeStep)}
        </CardContent>
      </Card>
    </Box>
  );
}