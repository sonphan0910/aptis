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
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save, Preview, ArrowBack, School, Psychology, AutoAwesome } from '@mui/icons-material';
import QuestionForm from '@/components/teacher/questions/QuestionForm';
import SpeakingImageBasedForm from '@/components/teacher/questions/SpeakingImageBasedForm';
import { QuestionPreview } from '@/components/teacher/questions/common';
import { createQuestion } from '@/store/slices/questionSlice';
import { showNotification } from '@/store/slices/uiSlice';
import { usePublicData } from '@/hooks/usePublicData';
import { questionApi } from '@/services/questionService';

const steps = ['Chọn APTIS & Kỹ năng', 'Chọn loại câu hỏi', 'Nhập thông tin', 'Xem trước'];

export default function NewQuestionPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { aptisTypes, skillTypes, questionTypes, loading: publicDataLoading, error: publicDataError } = usePublicData();
  const [retryCount, setRetryCount] = useState(0);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedAptis, setSelectedAptis] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedQuestionType, setSelectedQuestionType] = useState('');
  const [showListeningMCQSubTypes, setShowListeningMCQSubTypes] = useState(false);
  const [filteredQuestionTypes, setFilteredQuestionTypes] = useState([]);
  const [questionData, setQuestionData] = useState({
    aptis_type_id: '',
    skill_type_id: '',
    question_type_id: '',
    difficulty: 'medium',
    title: '',
    content: '',
    media_url: '',
    duration_seconds: null,
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);

  // Filter question types when skill changes
  useEffect(() => {
    if (selectedSkill && questionTypes.length > 0) {
      const filtered = questionTypes.filter(qt => qt.skill_type_id == selectedSkill);
      setFilteredQuestionTypes(filtered);
    }
  }, [selectedSkill, questionTypes]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAptisSkillSelect = (aptisId, skillId) => {
    setSelectedAptis(aptisId);
    setSelectedSkill(skillId);
    setQuestionData(prev => ({
      ...prev,
      aptis_type_id: aptisId,
      skill_type_id: skillId
    }));
    handleNext();
  };

  const handleQuestionTypeSelect = (questionType) => {
    setSelectedQuestionType(questionType);
    setQuestionData(prev => ({
      ...prev,
      question_type_id: questionType.id,
      content: '' // Reset content when type changes to prevent cross-type data issues
    }));
    handleNext();
  };

  const handleListeningMCQSubTypeSelect = (subType) => {
    // Map sub-type to actual question type code
    const codeMap = {
      'LISTENING_MCQ': 'LISTENING_MCQ_SINGLE',
      'LISTENING_MCQ_MULTI': 'LISTENING_MCQ_MULTI'
    };

    const modifiedQuestionType = {
      ...selectedQuestionType,
      code: codeMap[subType],
      question_type_name: subType === 'LISTENING_MCQ'
        ? 'Listening MCQ - Single Question'
        : 'Listening MCQ - Multiple Questions'
    };

    setSelectedQuestionType(modifiedQuestionType);
    setQuestionData(prev => ({
      ...prev,
      question_type_id: modifiedQuestionType.id,
      content: '' // Reset content
    }));
    setShowListeningMCQSubTypes(false);
    handleNext();
  };

  const handleFormSubmit = (data) => {
    setQuestionData(prev => ({ ...prev, ...data }));
    handleNext();
  };

  const handleSave = async (shouldContinue = false) => {
    setLoading(true);
    try {
      console.log('🔍 Current questionData:', questionData);

      const isSpeakingImageBased = selectedQuestionType?.code === 'SPEAKING_DESCRIPTION' ||
        selectedQuestionType?.code === 'SPEAKING_COMPARISON';

      if (isSpeakingImageBased && questionData.mainQuestion && questionData.childQuestions) {
        // Xử lý đặc biệt cho Speaking image-based questions
        // BƯỚC 1: Tạo câu hỏi chính TRƯỚC (không có ảnh)
        const mainQuestionData = {
          ...questionData.mainQuestion,
          aptis_type_id: selectedAptis,
          skill_type_id: selectedSkill,
          question_type_id: selectedQuestionType.id,
          aptis_type_code: aptisTypes.find(a => a.id == selectedAptis)?.aptis_type_code,
          skill_type_code: skillTypes.find(s => s.id == selectedSkill)?.skill_type_code,
          question_type_code: selectedQuestionType?.code,
          status: 'draft'
        };

        console.log('STEP 1: Creating parent question (without images):', mainQuestionData);
        const parentResult = await dispatch(createQuestion(mainQuestionData));

        if (createQuestion.fulfilled.match(parentResult)) {
          // Fix: Extract ID correctly from payload structure (usually payload.questionId or payload.data.id)
          const parentQuestionId = parentResult.payload.questionId || parentResult.payload.data?.id || parentResult.payload.id;
          console.log('✅ Parent question created with ID:', parentQuestionId);

          // BƯỚC 2: Upload ảnh và update additional_media
          console.log('🔍 Checking imageFiles:', questionData.imageFiles);
          if (questionData.imageFiles && questionData.imageFiles.length > 0) {
            console.log('STEP 2: Uploading', questionData.imageFiles.length, 'images for parent question...');
            const { questionApi } = await import('@/services/questionService');

            try {
              const uploadResult = await questionApi.uploadQuestionImages(
                parentQuestionId,
                questionData.imageFiles
              );
              console.log('✅ Images uploaded successfully:', uploadResult);
            } catch (uploadError) {
              console.error('❌ Failed to upload images:', uploadError);
              dispatch(showNotification({
                message: 'Tạo câu hỏi thành công nhưng upload ảnh thất bại. Vui lòng thêm ảnh sau.',
                type: 'warning'
              }));
            }
          } else {
            console.warn('⚠️ No imageFiles found in questionData!');
          }

          // BƯỚC 3: Tạo 2 câu hỏi con
          console.log('STEP 3: Creating child questions...');
          for (let i = 0; i < questionData.childQuestions.length; i++) {
            const childQuestionData = {
              ...questionData.childQuestions[i],
              aptis_type_id: selectedAptis,
              skill_type_id: selectedSkill,
              question_type_id: selectedQuestionType.id,
              parent_question_id: parentQuestionId,
              difficulty: mainQuestionData.difficulty,
              aptis_type_code: aptisTypes.find(a => a.id == selectedAptis)?.aptis_type_code,
              skill_type_code: skillTypes.find(s => s.id == selectedSkill)?.skill_type_code,
              question_type_code: selectedQuestionType?.code,
              status: 'draft'
            };

            console.log(`Creating child question ${i + 1}:`, childQuestionData);
            await dispatch(createQuestion(childQuestionData));
          }

          dispatch(showNotification({
            message: 'Tạo câu hỏi Speaking thành công! (1 câu chính + 2 câu phụ + ảnh)',
            type: 'success'
          }));

          if (shouldContinue) {
            // Reset form
            setActiveStep(0);
            setSelectedAptis('');
            setSelectedSkill('');
            setSelectedQuestionType('');
            setShowListeningMCQSubTypes(false);
            setFilteredQuestionTypes([]);
            setQuestionData({
              aptis_type_id: '',
              skill_type_id: '',
              question_type_id: '',
              difficulty: 'medium',
              title: '',
              content: '',
              media_url: '',
              duration_seconds: null,
              status: 'draft'
            });
          } else {
            router.push('/teacher/questions');
          }
        } else {
          throw new Error(parentResult.payload || 'Không thể tạo câu hỏi chính');
        }
      } else if ((skillTypes.find(s => s.id == selectedSkill)?.code === 'LISTENING') && questionData.content) {
        // XỬ LÝ LISTENING QUESTIONS - TẠO QUESTION TRƯỚC, UPLOAD AUDIO SAU
        const skillData = skillTypes.find(s => s.id == selectedSkill);
        console.log('🎧 Processing Listening Questions...');
        console.log('🔍 skillData:', skillData);
        console.log('🔍 selectedSkill:', selectedSkill);
        console.log('🔍 questionData.audioFiles:', questionData.audioFiles);

        // Parse content to extract audio files
        let contentData;
        try {
          contentData = JSON.parse(questionData.content);
        } catch (error) {
          throw new Error('Dữ liệu nội dung câu hỏi listening không hợp lệ');
        }

        // Prepare question data for creation (CLEAN - strictly match Joi schema)
        // Ensure we prioritize the ID from the selectedQuestionType object which represents Step 1 selection
        const qTypeId = parseInt(selectedQuestionType?.id || questionData.question_type_id);
        const aTypeId = parseInt(selectedAptis?.id || selectedAptis || questionData.aptis_type_id);

        console.log('🧪 [handleSave] ID Verification:', {
          selectedQuestionType_id: selectedQuestionType?.id,
          questionData_question_type_id: questionData.question_type_id,
          final_qTypeId: qTypeId,
          final_aTypeId: aTypeId
        });

        const questionDataForCreation = {
          question_type_id: qTypeId,
          aptis_type_id: aTypeId,
          difficulty: questionData.difficulty || 'medium',
          status: 'draft',
          content: '',
          media_url: questionData.media_url || '',
          duration_seconds: questionData.duration_seconds || null,
          parent_question_id: null,
          additional_media: null
        };

        // Safety validation
        if (isNaN(questionDataForCreation.question_type_id) || isNaN(questionDataForCreation.aptis_type_id)) {
          throw new Error(`Thông tin ID không hợp lệ: Type=${questionDataForCreation.question_type_id}, Aptis=${questionDataForCreation.aptis_type_id}`);
        }

        // Clean content without file objects for database storage
        const cleanedContent = {
          ...contentData,
          audioFile: undefined,
          audioUrl: contentData.audioUrl || '',
          speakers: contentData.speakers?.map(speaker => ({
            name: speaker.name,
            id: speaker.id,
            audioUrl: speaker.audioUrl || '',
            description: speaker.description || ''
          }))
        };

        questionDataForCreation.content = JSON.stringify(cleanedContent);
        console.log('📝 [handleSave] Payload to thunk:', questionDataForCreation);

        // Extract audio files for upload from submission data
        const audioFiles = questionData.audioFiles || {
          mainAudio: null,
          speakerAudios: []
        };

        // Fallback for speakers if they weren't in audioFiles prop
        if (audioFiles.speakerAudios.length === 0 && contentData.speakers) {
          contentData.speakers.forEach((speaker, index) => {
            if (speaker.audioFile && speaker.audioFile instanceof File) {
              audioFiles.speakerAudios.push({
                file: speaker.audioFile,
                order: index
              });
            }
          });
        }

        console.log('Audio files to upload:', {
          mainAudio: audioFiles.mainAudio ? audioFiles.mainAudio.name : null,
          speakerCount: audioFiles.speakerAudios.length,
          speakerFiles: audioFiles.speakerAudios.map(f => f.name)
        });

        // STEP 1: Create listening question (without audio)
        console.log('STEP 1: Creating listening question (without audio):', questionDataForCreation);
        const listeningResult = await dispatch(createQuestion(questionDataForCreation));

        if (createQuestion.fulfilled.match(listeningResult)) {
          const questionId = listeningResult.payload.questionId || listeningResult.payload.data?.id || listeningResult.payload.id;
          console.log('✅ Listening question created with ID:', questionId);
          console.log('🔍 Full payload:', listeningResult.payload);

          // STEP 2: Upload audio files if provided (similar to image workflow)
          const hasAudioFiles = audioFiles.mainAudio || audioFiles.speakerAudios.length > 0;
          if (hasAudioFiles) {
            console.log('STEP 2: Uploading audio files...');
            try {
              const uploadResult = await questionApi.uploadQuestionAudios(questionId, audioFiles);
              console.log('✅ Audio files uploaded successfully:', uploadResult);
            } catch (uploadError) {
              console.error('❌ Failed to upload audio files:', uploadError);
              if (uploadError.response?.data) {
                console.error('🔍 Upload Error Data:', uploadError.response.data);
              }
              dispatch(showNotification({
                message: 'Tạo câu hỏi thành công nhưng upload audio thất bại. Vui lòng thêm audio sau.',
                type: 'warning'
              }));
            }
          }

          dispatch(showNotification({
            message: 'Tạo câu hỏi Listening thành công!',
            type: 'success'
          }));

          if (shouldContinue) {
            // Reset form
            setActiveStep(0);
            setSelectedAptis('');
            setSelectedSkill('');
            setSelectedQuestionType('');
            setShowListeningMCQSubTypes(false);
            setFilteredQuestionTypes([]);
            setQuestionData({
              aptis_type_id: '',
              skill_type_id: '',
              question_type_id: '',
              difficulty: 'medium',
              title: '',
              content: '',
              media_url: '',
              duration_seconds: null,
              status: 'draft'
            });
          } else {
            router.push('/teacher/questions');
          }
        } else {
          throw new Error(listeningResult.payload || 'Không thể tạo câu hỏi listening');
        }
      } else {

        if (!questionData.aptis_type_id || !questionData.skill_type_id || !questionData.question_type_id) {
          throw new Error('Vui lòng chọn đầy đủ loại APTIS, kỹ năng và loại câu hỏi');
        }

        const completeQuestionData = {
          ...questionData,
          aptis_type_code: aptisTypes.find(a => a.id == selectedAptis)?.aptis_type_code,
          skill_type_code: skillTypes.find(s => s.id == selectedSkill)?.skill_type_code,
          question_type_code: selectedQuestionType?.code
        };

        console.log('Submitting question data:', completeQuestionData);
        const result = await dispatch(createQuestion(completeQuestionData));

        if (createQuestion.fulfilled.match(result)) {
          dispatch(showNotification({
            message: 'Tạo câu hỏi thành công!',
            type: 'success'
          }));

          if (shouldContinue) {
            // Reset form
            setActiveStep(0);
            setSelectedAptis('');
            setSelectedSkill('');
            setSelectedQuestionType('');
            setShowListeningMCQSubTypes(false);
            setFilteredQuestionTypes([]);
            setQuestionData({
              aptis_type_id: '',
              skill_type_id: '',
              question_type_id: '',
              difficulty: 'medium',
              title: '',
              content: '',
              media_url: '',
              duration_seconds: null,
              status: 'draft'
            });
          } else {
            router.push('/teacher/questions');
          }
        } else if (createQuestion.rejected.match(result)) {
          const errorMessage = result.payload || 'Không thể tạo câu hỏi';
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error('❌ Error creating question:', error);
      if (error.response?.data) {
        console.error('🔍 Error Response Data:', error.response.data);
      }

      const errorMessage = error.message || 'Có lỗi xảy ra khi tạo câu hỏi';

      dispatch(showNotification({
        message: errorMessage,
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

            {publicDataLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : aptisTypes.length === 0 || skillTypes.length === 0 ? (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => window.location.reload()}
                  >
                    Thử lại
                  </Button>
                }
              >
                Không thể tải dữ liệu APTIS types hoặc Skill types. Vui lòng thử lại.
              </Alert>
            ) : (
              aptisTypes.map((aptis) => (
                <Paper key={aptis.id} elevation={1} sx={{ mb: 3, p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <School color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6">{aptis.aptis_type_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {aptis.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    {skillTypes.map((skill) => (
                      <Grid item xs={12} sm={6} key={skill.id}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            border: selectedAptis == aptis.id && selectedSkill == skill.id ? 2 : 1,
                            borderColor: selectedAptis == aptis.id && selectedSkill == skill.id
                              ? 'primary.main' : 'divider',
                            '&:hover': { borderColor: 'primary.light', bgcolor: 'action.hover' }
                          }}
                          onClick={() => handleAptisSkillSelect(aptis.id, skill.id)}
                        >
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                              {skill.skill_type_name}
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
              ))
            )}
          </Box>
        );

      case 1:
        const selectedSkillData = skillTypes.find(s => s.id == selectedSkill);
        const selectedAptisData = aptisTypes.find(a => a.id == selectedAptis);

        return (
          <Box>
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Chọn loại câu hỏi cho {selectedSkillData?.skill_type_name}
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <Chip
                  label={selectedAptisData?.aptis_type_name}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={selectedSkillData?.skill_type_name}
                  color="secondary"
                  variant="outlined"
                />
              </Box>
            </Box>

            {publicDataLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : filteredQuestionTypes.length === 0 ? (
              <Alert severity="warning">
                Không có loại câu hỏi nào cho kỹ năng {selectedSkillData?.skill_type_name}
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {filteredQuestionTypes.map((type) => {
                  // Skip Gap Filling for Listening
                  if (selectedSkillData?.skill_type_code === 'listening' &&
                    type.code === 'LISTENING_GAP_FILL') {
                    return null;
                  }

                  const isAIScoring = type.scoring_method === 'ai';
                  return (
                    <Grid item xs={12} md={6} key={type.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: selectedQuestionType?.id === type.id ? 2 : 1,
                          borderColor: selectedQuestionType?.id === type.id
                            ? 'primary.main' : 'divider',
                          '&:hover': { borderColor: 'primary.light' },
                          height: '100%'
                        }}
                        onClick={() => {
                          handleQuestionTypeSelect(type);
                        }}
                      >
                        <CardContent>
                          <Box display="flex" alignItems="center" mb={2}>
                            {isAIScoring ? (
                              <Psychology color="secondary" sx={{ mr: 2 }} />
                            ) : (
                              <AutoAwesome color="primary" sx={{ mr: 2 }} />
                            )}
                            <Box>
                              <Typography variant="h6" gutterBottom>
                                {type.question_type_name}
                              </Typography>
                              <Chip
                                label={isAIScoring ? 'AI Scoring' : 'Auto Scoring'}
                                size="small"
                                color={isAIScoring ? 'secondary' : 'primary'}
                              />
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {type.instruction_template ||
                              (isAIScoring ? 'Câu hỏi sẽ được AI chấm điểm tự động' : 'Câu hỏi sẽ được chấm điểm tự động')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}

                {/* Separate Multiple Questions MCQ card removed - now uses Statement Matching slot */}
              </Grid>
            )}

            <Box mt={3}>
              <Button variant="outlined" onClick={handleBack}>
                Quay lại
              </Button>
            </Box>
          </Box>
        );

      case 2:
        // Kiểm tra nếu là SPEAKING_DESCRIPTION hoặc SPEAKING_COMPARISON
        const isSpeakingImageBased = selectedQuestionType?.code === 'SPEAKING_DESCRIPTION' ||
          selectedQuestionType?.code === 'SPEAKING_COMPARISON';

        if (isSpeakingImageBased) {
          return (
            <SpeakingImageBasedForm
              key={`speaking-form-${selectedAptis}-${selectedSkill}-${selectedQuestionType?.id}`}
              questionType={selectedQuestionType}
              initialData={questionData}
              onSubmit={handleFormSubmit}
              onBack={handleBack}
            />
          );
        }

        return (
          <QuestionForm
            key={`question-form-${selectedAptis}-${selectedSkill}-${selectedQuestionType?.id}`}
            aptisType={selectedAptis}
            skillType={selectedSkill}
            questionType={selectedQuestionType}
            aptisData={aptisTypes.find(a => a.id == selectedAptis)}
            skillData={skillTypes.find(s => s.id == selectedSkill)}
            questionTypeData={selectedQuestionType}
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
              aptisData={aptisTypes.find(a => a.id == selectedAptis)}
              skillData={skillTypes.find(s => s.id == selectedSkill)}
              questionTypeData={selectedQuestionType}
              showActions={false}
              open={false}
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