import React from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Grid,
  Paper,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  RecordVoiceOver as SpeakIcon,
  Info as InfoIcon,
  Topic as TopicIcon
} from '@mui/icons-material';

/**
 * APTIS Speaking Task 4: Topic Discussion (B2 Level)
 * Cấu trúc: Thảo luận mở rộng về chủ đề
 * Điểm: 0-6 scale with C1/C2 extension (B2 level)
 * Focus: Extended discourse, abstract concepts, developing arguments
 */
const SpeakingTopicDiscussionForm = ({ questionData, onChange, onValidate }) => {
  const [formData, setFormData] = React.useState({
    content: questionData?.content || '',
    main_topic: questionData?.main_topic || '',
    discussion_questions: questionData?.discussion_questions || [
      {
        id: 1,
        question: '',
        level: 'B2',
        focus: 'opinion',
        follow_up: ''
      }
    ],
    topic_context: questionData?.topic_context || '',
    discussion_points: questionData?.discussion_points || [
      'Express and justify opinions',
      'Discuss abstract concepts',
      'Compare different viewpoints',
      'Provide examples and explanations'
    ],
    useful_language: questionData?.useful_language || {
      opinion_expressions: ['In my view...', 'I believe that...', 'From my perspective...', 'It seems to me that...'],
      agreeing_disagreeing: ['I completely agree...', 'I see your point, but...', 'That\'s a valid point...', 'I\'m not convinced that...'],
      developing_ideas: ['Furthermore...', 'What\'s more...', 'On the other hand...', 'For instance...'],
      abstract_language: ['concept', 'aspect', 'perspective', 'implications', 'significance', 'complexity']
    },
    extension_criteria: questionData?.extension_criteria || {
      C1_features: 'Sophisticated language use, complex structures, nuanced expression',
      C2_features: 'Effortless expression, precise meaning, cultural references'
    },
    instructions: questionData?.instructions || 'We will have a discussion about this topic. I will ask you some questions and you should give your opinions and ideas. Try to speak as much as you can and give reasons for your answers.',
    scoring_criteria: questionData?.scoring_criteria || {
      task_achievement: 'Addresses questions fully with developed responses',
      fluency_coherence: 'Sustained discourse with natural flow',
      lexical_resource: 'B2+ vocabulary, some sophistication',
      grammatical_accuracy: 'Complex structures with good control',
      pronunciation: 'Clear and natural, appropriate stress and intonation',
      interaction: 'Maintains conversation, develops topics naturally'
    },
    preparation_time: questionData?.preparation_time || 30,
    discussion_time: questionData?.discussion_time || 180,
    difficulty: questionData?.difficulty || 'hard',
    cefr_level: 'B2',
    points: questionData?.points || 6
  });

  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validate main topic
    if (!formData.main_topic.trim()) {
      newErrors.main_topic = 'Main topic is required';
    }

    // Validate topic context
    if (!formData.topic_context.trim()) {
      newErrors.topic_context = 'Topic context is required';
    }

    // Validate discussion questions
    if (formData.discussion_questions.length === 0) {
      newErrors.discussion_questions = 'At least one discussion question is required';
    }

    const emptyQuestions = formData.discussion_questions.filter(q => !q.question.trim());
    if (emptyQuestions.length > 0) {
      newErrors.question_content = `${emptyQuestions.length} question(s) are empty`;
    }

    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0;
    if (onValidate) onValidate(isValid);
    
    return isValid;
  };

  const handleChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    if (onChange) onChange(newFormData);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.discussion_questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    handleChange('discussion_questions', newQuestions);
  };

  const handleUsefulLanguageChange = (category, index, value) => {
    const newUsefulLanguage = { ...formData.useful_language };
    newUsefulLanguage[category][index] = value;
    handleChange('useful_language', newUsefulLanguage);
  };

  const handleDiscussionPointChange = (index, value) => {
    const newPoints = [...formData.discussion_points];
    newPoints[index] = value;
    handleChange('discussion_points', newPoints);
  };

  const addQuestion = () => {
    const newQuestions = [...formData.discussion_questions];
    newQuestions.push({
      id: Date.now(),
      question: '',
      level: 'B2',
      focus: 'opinion',
      follow_up: ''
    });
    handleChange('discussion_questions', newQuestions);
  };

  const removeQuestion = (index) => {
    if (formData.discussion_questions.length > 1) {
      const newQuestions = formData.discussion_questions.filter((_, i) => i !== index);
      handleChange('discussion_questions', newQuestions);
    }
  };

  const addDiscussionPoint = () => {
    const newPoints = [...formData.discussion_points];
    newPoints.push('');
    handleChange('discussion_points', newPoints);
  };

  const removeDiscussionPoint = (index) => {
    if (formData.discussion_points.length > 1) {
      const newPoints = formData.discussion_points.filter((_, i) => i !== index);
      handleChange('discussion_points', newPoints);
    }
  };

  const addUsefulPhrase = (category) => {
    const newUsefulLanguage = { ...formData.useful_language };
    newUsefulLanguage[category].push('');
    handleChange('useful_language', newUsefulLanguage);
  };

  const removeUsefulPhrase = (category, index) => {
    const newUsefulLanguage = { ...formData.useful_language };
    newUsefulLanguage[category] = newUsefulLanguage[category].filter((_, i) => i !== index);
    handleChange('useful_language', newUsefulLanguage);
  };

  const questionFocusOptions = [
    { value: 'opinion', label: 'Opinion & Viewpoint' },
    { value: 'analysis', label: 'Analysis & Evaluation' },
    { value: 'prediction', label: 'Prediction & Future' },
    { value: 'comparison', label: 'Comparison & Contrast' },
    { value: 'experience', label: 'Personal Experience' },
    { value: 'abstract', label: 'Abstract Concepts' },
    { value: 'problem_solving', label: 'Problem Solving' }
  ];

  const cefrLevelOptions = [
    { value: 'B2', label: 'B2 (Target Level)' },
    { value: 'C1', label: 'C1 (Extension)' },
    { value: 'C2', label: 'C2 (Extension)' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TopicIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Speaking Task 4: Topic Discussion (B2)
          </Typography>
          <Chip label="6 Points" color="primary" />
          <Chip label="B2-C2" color="secondary" />
        </Box>
        
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Extended discussion task testing ability to maintain discourse, express complex ideas, 
          and interact naturally at B2+ level with potential C1/C2 extension.
        </Typography>
      </Paper>

      {/* Topic Setup */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon /> Topic Setup
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Main Discussion Topic"
                value={formData.main_topic}
                onChange={(e) => handleChange('main_topic', e.target.value)}
                error={!!errors.main_topic}
                helperText={errors.main_topic || 'Central theme for extended discussion'}
                placeholder="e.g., The Impact of Technology on Social Relationships"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Prep Time (sec)"
                type="number"
                value={formData.preparation_time}
                onChange={(e) => handleChange('preparation_time', parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 0, max: 120 } }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Discussion Time (sec)"
                type="number"
                value={formData.discussion_time}
                onChange={(e) => handleChange('discussion_time', parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 120, max: 300 } }}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Topic Context & Background"
            value={formData.topic_context}
            onChange={(e) => handleChange('topic_context', e.target.value)}
            error={!!errors.topic_context}
            helperText={errors.topic_context || 'Provide context to frame the discussion'}
            sx={{ mb: 2 }}
            placeholder="Give background information and context for the topic discussion..."
          />

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Instructions to Students"
            value={formData.instructions}
            onChange={(e) => handleChange('instructions', e.target.value)}
            helperText="Instructions for the discussion format"
          />
        </CardContent>
      </Card>

      {/* Discussion Points */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Key Discussion Points ({formData.discussion_points.length})
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addDiscussionPoint}
              variant="outlined"
              size="small"
            >
              Add Point
            </Button>
          </Box>

          <Grid container spacing={1}>
            {formData.discussion_points.map((point, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={point}
                    onChange={(e) => handleDiscussionPointChange(index, e.target.value)}
                    placeholder="Key point students should discuss"
                  />
                  {formData.discussion_points.length > 1 && (
                    <IconButton 
                      size="small" 
                      onClick={() => removeDiscussionPoint(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Discussion Questions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Discussion Questions ({formData.discussion_questions.length})
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addQuestion}
              variant="outlined"
              size="small"
            >
              Add Question
            </Button>
          </Box>

          {errors.question_content && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {errors.question_content}
            </Alert>
          )}

          {formData.discussion_questions.map((question, index) => (
            <Paper key={question.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Question {index + 1}
                </Typography>
                {formData.discussion_questions.length > 1 && (
                  <IconButton 
                    size="small" 
                    onClick={() => removeQuestion(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Discussion Question"
                    value={question.question}
                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                    placeholder="Ask a question that promotes extended discourse and abstract thinking"
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>CEFR Level</InputLabel>
                    <Select
                      value={question.level}
                      onChange={(e) => handleQuestionChange(index, 'level', e.target.value)}
                      label="CEFR Level"
                    >
                      {cefrLevelOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Question Focus</InputLabel>
                    <Select
                      value={question.focus}
                      onChange={(e) => handleQuestionChange(index, 'focus', e.target.value)}
                      label="Question Focus"
                    >
                      {questionFocusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Follow-up Prompt"
                    value={question.follow_up}
                    onChange={(e) => handleQuestionChange(index, 'follow_up', e.target.value)}
                    placeholder="Optional follow-up"
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </CardContent>
      </Card>

      {/* Useful Language */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Useful Language for B2+ Discussion
          </Typography>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Opinion Expressions</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1}>
                {formData.useful_language.opinion_expressions.map((phrase, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={phrase}
                        onChange={(e) => handleUsefulLanguageChange('opinion_expressions', index, e.target.value)}
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => removeUsefulPhrase('opinion_expressions', index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button 
                    startIcon={<AddIcon />} 
                    onClick={() => addUsefulPhrase('opinion_expressions')}
                    size="small"
                  >
                    Add Phrase
                  </Button>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Agreeing & Disagreeing</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1}>
                {formData.useful_language.agreeing_disagreeing.map((phrase, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={phrase}
                        onChange={(e) => handleUsefulLanguageChange('agreeing_disagreeing', index, e.target.value)}
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => removeUsefulPhrase('agreeing_disagreeing', index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button 
                    startIcon={<AddIcon />} 
                    onClick={() => addUsefulPhrase('agreeing_disagreeing')}
                    size="small"
                  >
                    Add Phrase
                  </Button>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Developing Ideas</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1}>
                {formData.useful_language.developing_ideas.map((phrase, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={phrase}
                        onChange={(e) => handleUsefulLanguageChange('developing_ideas', index, e.target.value)}
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => removeUsefulPhrase('developing_ideas', index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button 
                    startIcon={<AddIcon />} 
                    onClick={() => addUsefulPhrase('developing_ideas')}
                    size="small"
                  >
                    Add Phrase
                  </Button>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Abstract Language</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1}>
                {formData.useful_language.abstract_language.map((word, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={word}
                        onChange={(e) => handleUsefulLanguageChange('abstract_language', index, e.target.value)}
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => removeUsefulPhrase('abstract_language', index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button 
                    startIcon={<AddIcon />} 
                    onClick={() => addUsefulPhrase('abstract_language')}
                    size="small"
                  >
                    Add Word
                  </Button>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {/* Extension Criteria */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            C1/C2 Extension Criteria
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="C1 Level Features"
                value={formData.extension_criteria.C1_features}
                onChange={(e) => handleChange('extension_criteria', {
                  ...formData.extension_criteria,
                  C1_features: e.target.value
                })}
                helperText="What qualifies as C1 performance"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="C2 Level Features"
                value={formData.extension_criteria.C2_features}
                onChange={(e) => handleChange('extension_criteria', {
                  ...formData.extension_criteria,
                  C2_features: e.target.value
                })}
                helperText="What qualifies as C2 performance"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Scoring Criteria */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            B2+ Scoring Criteria (0-6 Scale)
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Task Achievement"
                value={formData.scoring_criteria.task_achievement}
                onChange={(e) => handleChange('scoring_criteria', {
                  ...formData.scoring_criteria,
                  task_achievement: e.target.value
                })}
                helperText="Full responses with development"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fluency & Coherence"
                value={formData.scoring_criteria.fluency_coherence}
                onChange={(e) => handleChange('scoring_criteria', {
                  ...formData.scoring_criteria,
                  fluency_coherence: e.target.value
                })}
                helperText="Sustained natural discourse"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lexical Resource"
                value={formData.scoring_criteria.lexical_resource}
                onChange={(e) => handleChange('scoring_criteria', {
                  ...formData.scoring_criteria,
                  lexical_resource: e.target.value
                })}
                helperText="B2+ vocabulary sophistication"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Grammatical Accuracy"
                value={formData.scoring_criteria.grammatical_accuracy}
                onChange={(e) => handleChange('scoring_criteria', {
                  ...formData.scoring_criteria,
                  grammatical_accuracy: e.target.value
                })}
                helperText="Complex structures, good control"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pronunciation"
                value={formData.scoring_criteria.pronunciation}
                onChange={(e) => handleChange('scoring_criteria', {
                  ...formData.scoring_criteria,
                  pronunciation: e.target.value
                })}
                helperText="Clear, natural stress/intonation"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Interaction"
                value={formData.scoring_criteria.interaction}
                onChange={(e) => handleChange('scoring_criteria', {
                  ...formData.scoring_criteria,
                  interaction: e.target.value
                })}
                helperText="Natural conversation maintenance"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary */}
      <Paper sx={{ p: 2, mt: 3, backgroundColor: '#f9f9f9' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Summary:</strong> {formData.discussion_questions.length} questions, 
          {formData.discussion_points.length} key points, {formData.preparation_time}s prep time, 
          {formData.discussion_time}s discussion time, B2-C2 level task with extension criteria
        </Typography>
      </Paper>
    </Box>
  );
};

export default SpeakingTopicDiscussionForm;