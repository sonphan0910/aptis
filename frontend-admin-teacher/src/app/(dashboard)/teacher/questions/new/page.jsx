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
  MenuItem,
  Chip,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import { Save, Preview, ArrowBack, School, Psychology, AutoAwesome } from '@mui/icons-material';
import QuestionForm from '@/components/teacher/questions/QuestionForm';
import QuestionPreview from '@/components/teacher/questions/QuestionPreview';
import { createQuestion } from '@/store/slices/questionSlice';
import { showNotification } from '@/store/slices/uiSlice';
import { 
  APTIS_TYPES, 
  SKILL_TYPES, 
  getQuestionTypesBySkill,
  SCORING_METHODS,
  getDifficultyConfig 
} from '@/constants/questionTypes';

const steps = ['Chọn APTIS & Kỹ năng', 'Chọn loại câu hỏi', 'Nhập thông tin', 'Xem trước'];

export default function NewQuestionPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAptis, setSelectedAptis] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedQuestionType, setSelectedQuestionType] = useState('');
  const [questionData, setQuestionData] = useState({
    aptis_type_id: '',
    skill_type_code: '',
    question_type_code: '',
    difficulty: 'medium',
    content: '',
    media_url: '',
    duration_seconds: null,
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAptisSkillSelect = (aptis, skill) => {
    setSelectedAptis(aptis);
    setSelectedSkill(skill);
    setQuestionData(prev => ({
      ...prev,
      aptis_type_id: aptis,
      skill_type_code: skill
    }));
    handleNext();
  };

  const handleQuestionTypeSelect = (questionType) => {
    setSelectedQuestionType(questionType);
    setQuestionData(prev => ({
      ...prev,
      question_type_code: questionType.code
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
          setSelectedAptis('');
          setSelectedSkill('');
          setSelectedQuestionType('');
          setQuestionData({
            aptis_type_id: '',
            skill_type_code: '',
            question_type_code: '',
            difficulty: 'medium',
            content: '',
            media_url: '',
            duration_seconds: null,
            status: 'draft'
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
              Chọn loại APTIS và kỹ năng
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Chọn loại bài thi APTIS và kỹ năng bạn muốn tạo câu hỏi
            </Typography>
            
            {APTIS_TYPES.map((aptis) => (
              <Paper key={aptis.code} elevation={1} sx={{ mb: 3, p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <School color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{aptis.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {aptis.description}
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  {SKILL_TYPES.map((skill) => (
                    <Grid item xs={12} md={6} lg={4} key={skill.code}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: selectedAptis === aptis.code && selectedSkill === skill.code ? 2 : 1,
                          borderColor: selectedAptis === aptis.code && selectedSkill === skill.code 
                            ? 'primary.main' : 'divider',
                          '&:hover': { borderColor: 'primary.light', bgcolor: 'action.hover' }
                        }}
                        onClick={() => handleAptisSkillSelect(aptis.code, skill.code)}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            {skill.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {skill.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            ))}
          </Box>
        );
        
      case 1:
        const questionTypes = getQuestionTypesBySkill(selectedSkill);
        const selectedSkillData = SKILL_TYPES.find(s => s.code === selectedSkill);
        
        return (
          <Box>
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Chọn loại câu hỏi cho {selectedSkillData?.name}
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <Chip 
                  label={APTIS_TYPES.find(a => a.code === selectedAptis)?.name} 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  label={selectedSkillData?.name} 
                  color="secondary" 
                  variant="outlined" 
                />
              </Box>
            </Box>

            <Grid container spacing={3}>
              {questionTypes.map((type) => {
                const scoringMethod = SCORING_METHODS.find(s => s.value === type.scoring);
                return (
                  <Grid item xs={12} md={6} key={type.code}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: selectedQuestionType?.code === type.code ? 2 : 1,
                        borderColor: selectedQuestionType?.code === type.code 
                          ? 'primary.main' : 'divider',
                        '&:hover': { borderColor: 'primary.light' },
                        height: '100%'
                      }}
                      onClick={() => handleQuestionTypeSelect(type)}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          {type.scoring === 'ai' ? (
                            <Psychology color="secondary" sx={{ mr: 2 }} />
                          ) : (
                            <AutoAwesome color="primary" sx={{ mr: 2 }} />
                          )}
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              {type.name}
                            </Typography>
                            <Chip 
                              label={scoringMethod?.label} 
                              size="small" 
                              color={type.scoring === 'ai' ? 'secondary' : 'primary'}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {scoringMethod?.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            
            <Box mt={3}>
              <Button variant="outlined" onClick={handleBack}>
                Quay lại
              </Button>
            </Box>
          </Box>
        );
        
      case 2:
        return (
          <QuestionForm
            aptisType={selectedAptis}
            skillType={selectedSkill}
            questionType={selectedQuestionType}
            initialData={questionData}
            onSubmit={handleFormSubmit}
            onBack={handleBack}
          />
        );
        
      case 3:
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