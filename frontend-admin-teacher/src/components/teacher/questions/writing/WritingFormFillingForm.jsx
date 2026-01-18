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
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

/**
 * APTIS Writing Task 2: Form Filling (A2 Level)
 * Cấu trúc: Trả lời ngắn cho câu hỏi cụ thể (20-30 từ)
 * Điểm: 0-5 scale (A2 level)
 * Focus: Specific information, basic grammar, appropriate vocabulary
 */
const WritingFormFillingForm = ({ questionData, onChange, onValidate }) => {
  const [formData, setFormData] = React.useState({
    content: questionData?.content || '',
    scenario: questionData?.scenario || '',
    form_fields: questionData?.form_fields || [
      {
        id: 1,
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Your full name'
      }
    ],
    questions: questionData?.questions || [
      {
        id: 1,
        question: '',
        expected_content: '',
        word_limit: 25,
        sample_answer: ''
      }
    ],
    instructions: questionData?.instructions || 'Complete the form and answer the questions. Write 20-30 words for each question.',
    scoring_criteria: questionData?.scoring_criteria || {
      content_relevance: 'Answers the question directly',
      grammar_accuracy: 'Basic A2-level grammar structures',
      vocabulary_appropriateness: 'Simple, clear vocabulary',
      word_count: '20-30 words per question'
    },
    difficulty: questionData?.difficulty || 'medium',
    time_limit: questionData?.time_limit || 10,
    cefr_level: 'A2',
    points: questionData?.points || 5
  });

  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validate scenario
    if (!formData.scenario.trim()) {
      newErrors.scenario = 'Scenario description is required';
    }

    // Validate instructions
    if (!formData.instructions.trim()) {
      newErrors.instructions = 'Instructions are required';
    }

    // Validate form fields
    const emptyFields = formData.form_fields.filter(field => !field.label.trim());
    if (emptyFields.length > 0) {
      newErrors.form_fields = `${emptyFields.length} form field(s) are missing labels`;
    }

    // Validate questions
    const emptyQuestions = formData.questions.filter(q => !q.question.trim());
    if (emptyQuestions.length > 0) {
      newErrors.questions = `${emptyQuestions.length} question(s) are empty`;
    }

    // Validate sample answers
    const missingSamples = formData.questions.filter(q => !q.sample_answer.trim());
    if (missingSamples.length > 0) {
      newErrors.sample_answers = `${missingSamples.length} sample answer(s) are missing`;
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

  const handleFormFieldChange = (index, field, value) => {
    const newFields = [...formData.form_fields];
    newFields[index] = { ...newFields[index], [field]: value };
    handleChange('form_fields', newFields);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    handleChange('questions', newQuestions);
  };

  const addFormField = () => {
    const newFields = [...formData.form_fields];
    newFields.push({
      id: Date.now(),
      label: '',
      type: 'text',
      required: false,
      placeholder: ''
    });
    handleChange('form_fields', newFields);
  };

  const removeFormField = (index) => {
    if (formData.form_fields.length > 1) {
      const newFields = formData.form_fields.filter((_, i) => i !== index);
      handleChange('form_fields', newFields);
    }
  };

  const addQuestion = () => {
    const newQuestions = [...formData.questions];
    newQuestions.push({
      id: Date.now(),
      question: '',
      expected_content: '',
      word_limit: 25,
      sample_answer: ''
    });
    handleChange('questions', newQuestions);
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      const newQuestions = formData.questions.filter((_, i) => i !== index);
      handleChange('questions', newQuestions);
    }
  };

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Phone Number' },
    { value: 'date', label: 'Date' },
    { value: 'number', label: 'Number' },
    { value: 'textarea', label: 'Text Area' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AssignmentIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Writing Task 2: Form Filling (A2)
          </Typography>
          <Chip label="5 Points" color="primary" />
          <Chip label="A2 Level" color="secondary" />
        </Box>
        
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Students complete a form and answer specific questions with 20-30 words each.
          Tests basic writing skills and ability to provide specific information.
        </Typography>
      </Paper>

      {/* Scenario & Instructions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon /> Task Setup
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Scenario Description"
            value={formData.scenario}
            onChange={(e) => handleChange('scenario', e.target.value)}
            error={!!errors.scenario}
            helperText={errors.scenario || 'Describe the context for the form filling task'}
            sx={{ mb: 2 }}
            placeholder="e.g., You want to join a local sports club. Complete the membership form and answer the questions."
          />

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Instructions to Students"
            value={formData.instructions}
            onChange={(e) => handleChange('instructions', e.target.value)}
            error={!!errors.instructions}
            helperText={errors.instructions || 'Clear instructions for the task'}
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Time Limit (minutes)"
                type="number"
                value={formData.time_limit}
                onChange={(e) => handleChange('time_limit', parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 5, max: 20 } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CEFR Level"
                value={formData.cefr_level}
                disabled
                helperText="Fixed at A2 level for Task 2"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Form Fields ({formData.form_fields.length})
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addFormField}
              variant="outlined"
              size="small"
            >
              Add Field
            </Button>
          </Box>

          {errors.form_fields && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.form_fields}
            </Alert>
          )}

          <Grid container spacing={2}>
            {formData.form_fields.map((field, index) => (
              <Grid item xs={12} md={6} key={field.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="primary">
                      Field {index + 1}
                    </Typography>
                    {formData.form_fields.length > 1 && (
                      <IconButton 
                        size="small" 
                        onClick={() => removeFormField(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    label="Field Label"
                    value={field.label}
                    onChange={(e) => handleFormFieldChange(index, 'label', e.target.value)}
                    sx={{ mb: 1 }}
                    placeholder="e.g., Full Name, Email Address"
                  />

                  <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                    <InputLabel>Field Type</InputLabel>
                    <Select
                      value={field.type}
                      onChange={(e) => handleFormFieldChange(index, 'type', e.target.value)}
                      label="Field Type"
                    >
                      {fieldTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    size="small"
                    label="Placeholder Text"
                    value={field.placeholder}
                    onChange={(e) => handleFormFieldChange(index, 'placeholder', e.target.value)}
                    placeholder="Hint text for students"
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Questions ({formData.questions.length})
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

          {errors.questions && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.questions}
            </Alert>
          )}

          {formData.questions.map((question, index) => (
            <Paper key={question.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Question {index + 1}
                </Typography>
                {formData.questions.length > 1 && (
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
                    label="Question Text"
                    value={question.question}
                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                    placeholder="Ask a specific question requiring 20-30 words"
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Word Limit"
                    type="number"
                    value={question.word_limit}
                    onChange={(e) => handleQuestionChange(index, 'word_limit', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 15, max: 40 } }}
                    helperText="Typically 20-30 words for A2"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Expected Content"
                    value={question.expected_content}
                    onChange={(e) => handleQuestionChange(index, 'expected_content', e.target.value)}
                    placeholder="What should the answer include?"
                    helperText="Key points for marking"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Sample Answer"
                    value={question.sample_answer}
                    onChange={(e) => handleQuestionChange(index, 'sample_answer', e.target.value)}
                    placeholder="Provide a model answer at A2 level..."
                    error={!!errors.sample_answers && !question.sample_answer.trim()}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </CardContent>
      </Card>

      {/* Scoring Criteria */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            A2-Level Scoring Criteria
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Content Relevance"
                value={formData.scoring_criteria.content_relevance}
                onChange={(e) => handleChange('scoring_criteria', {
                  ...formData.scoring_criteria,
                  content_relevance: e.target.value
                })}
                helperText="What content should be included"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Grammar Accuracy"
                value={formData.scoring_criteria.grammar_accuracy}
                onChange={(e) => handleChange('scoring_criteria', {
                  ...formData.scoring_criteria,
                  grammar_accuracy: e.target.value
                })}
                helperText="Expected grammar level"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vocabulary Appropriateness"
                value={formData.scoring_criteria.vocabulary_appropriateness}
                onChange={(e) => handleChange('scoring_criteria', {
                  ...formData.scoring_criteria,
                  vocabulary_appropriateness: e.target.value
                })}
                helperText="Vocabulary expectations"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Word Count Requirement"
                value={formData.scoring_criteria.word_count}
                onChange={(e) => handleChange('scoring_criteria', {
                  ...formData.scoring_criteria,
                  word_count: e.target.value
                })}
                helperText="Length requirements"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary */}
      <Paper sx={{ p: 2, mt: 3, backgroundColor: '#f9f9f9' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Summary:</strong> {formData.form_fields.length} form fields, 
          {formData.questions.length} questions, A2 level task, 
          {formData.time_limit} minutes time limit
        </Typography>
      </Paper>
    </Box>
  );
};

export default WritingFormFillingForm;