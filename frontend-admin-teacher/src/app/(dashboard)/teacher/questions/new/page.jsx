'use client';

import { useState, useEffect } from 'react';
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
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Save, Preview, ArrowBack } from '@mui/icons-material';
import QuestionForm from '@/components/teacher/questions/QuestionForm';
import QuestionPreview from '@/components/teacher/questions/QuestionPreview';
import { createQuestion } from '@/store/slices/questionSlice';
import { showNotification } from '@/store/slices/uiSlice';

const steps = ['Chọn loại câu hỏi', 'Nhập thông tin', 'Xem trước'];

const questionTypes = [
  { value: 'mcq', label: 'Trắc nghiệm (MCQ)', skills: ['listening', 'reading'] },
  { value: 'matching', label: 'Ghép đôi (Matching)', skills: ['listening', 'reading'] },
  { value: 'gap_filling', label: 'Điền từ vào chỗ trống', skills: ['listening', 'reading'] },
  { value: 'ordering', label: 'Sắp xếp thứ tự', skills: ['listening', 'reading'] },
  { value: 'writing', label: 'Viết (Writing)', skills: ['writing'] },
  { value: 'speaking', label: 'Nói (Speaking)', skills: ['speaking'] }
];

export default function NewQuestionPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [activeStep, setActiveStep] = useState(0);
  const [questionType, setQuestionType] = useState('');
  const [questionData, setQuestionData] = useState({
    title: '',
    description: '',
    aptis_type: 'general',
    skill: '',
    difficulty: 'medium',
    question_type: '',
    content: {}
  });
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleQuestionTypeSelect = (type) => {
    setQuestionType(type);
    setQuestionData(prev => ({ 
      ...prev, 
      question_type: type,
      skill: questionTypes.find(qt => qt.value === type)?.skills[0] || ''
    }));
    handleNext();
  };

  const handleFormSubmit = (data) => {
    setQuestionData(prev => ({ ...prev, ...data }));
    handleNext();
  };

  const handleSave = async (shouldContinue = false) => {
    setLoading(true);
    try {
      const result = await dispatch(createQuestion(questionData));
      
      if (createQuestion.fulfilled.match(result)) {
        dispatch(showNotification({
          message: 'Tạo câu hỏi thành công!',
          type: 'success'
        }));
        
        if (shouldContinue) {
          // Reset form để tạo câu hỏi mới
          setActiveStep(0);
          setQuestionType('');
          setQuestionData({
            title: '',
            description: '',
            aptis_type: 'general',
            skill: '',
            difficulty: 'medium',
            question_type: '',
            content: {}
          });
        } else {
          router.push('/teacher/questions');
        }
      }
    } catch (error) {
      dispatch(showNotification({
        message: 'Có lỗi xảy ra khi tạo câu hỏi',
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
          <Box>
            <Typography variant="h6" gutterBottom>
              Chọn loại câu hỏi
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={2}>
              {questionTypes.map((type) => (
                <Card
                  key={type.value}
                  sx={{
                    cursor: 'pointer',
                    border: questionType === type.value ? 2 : 1,
                    borderColor: questionType === type.value ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.light' }
                  }}
                  onClick={() => handleQuestionTypeSelect(type.value)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {type.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Kỹ năng: {type.skills.join(', ')}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        );
      case 1:
        return (
          <QuestionForm
            questionType={questionType}
            initialData={questionData}
            onSubmit={handleFormSubmit}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Xem trước câu hỏi
            </Typography>
            <QuestionPreview
              question={questionData}
              showActions={false}
            />
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
                onClick={() => handleSave(true)}
                disabled={loading}
              >
                Lưu & Tiếp tục
              </Button>
              <Button
                variant="contained"
                onClick={() => handleSave(false)}
                disabled={loading}
                startIcon={<Save />}
              >
                Lưu & Hoàn thành
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
          onClick={() => router.push('/teacher/questions')}
          sx={{ mr: 2 }}
        >
          Quay lại
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Tạo câu hỏi mới
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