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
  Avatar,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * APTIS Writing Task 3: Chat Responses (B1 Level)
 * Cấu trúc: 3 câu hỏi trong chat room (30-40 từ mỗi câu)
 * Điểm: 0-5 scale (B1 level)
 * Focus: Natural interaction, appropriate register, connecting ideas
 */
const WritingChatResponsesForm = ({ questionData, onChange, onValidate }) => {
  const [formData, setFormData] = React.useState({
    content: questionData?.content || '',
    chat_topic: questionData?.chat_topic || '',
    chat_context: questionData?.chat_context || '',
    participants: questionData?.participants || [
      {
        id: 1,
        name: 'Alex',
        avatar: '',
        role: 'moderator'
      },
      {
        id: 2,
        name: 'Student',
        avatar: '',
        role: 'student'
      }
    ],
    messages: questionData?.messages || [
      {
        id: 1,
        sender_id: 1,
        sender_name: 'Alex',
        message: 'Welcome to our discussion!',
        type: 'intro',
        requires_response: false
      }
    ],
    questions: questionData?.questions || [
      {
        id: 1,
        sender_id: 1,
        sender_name: 'Alex',
        question: '',
        word_limit: 35,
        expected_content: '',
        sample_answer: '',
        follow_up: false
      }
    ],
    instructions: questionData?.instructions || 'You are in a chat room discussion. Read the messages and respond to the three questions. Write 30-40 words for each response.',
    scoring_criteria: questionData?.scoring_criteria || {
      task_achievement: 'Addresses all questions appropriately',
      coherence_cohesion: 'Logical flow and connection between ideas',
      lexical_resource: 'B1-level vocabulary and expressions',
      grammatical_accuracy: 'Mostly accurate B1 grammar structures'
    },
    difficulty: questionData?.difficulty || 'medium',
    time_limit: questionData?.time_limit || 12,
    cefr_level: 'B1',
    points: questionData?.points || 5
  });

  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validate chat topic
    if (!formData.chat_topic.trim()) {
      newErrors.chat_topic = 'Chat topic is required';
    }

    // Validate chat context
    if (!formData.chat_context.trim()) {
      newErrors.chat_context = 'Chat context is required';
    }

    // Validate questions
    if (formData.questions.length !== 3) {
      newErrors.questions = 'Exactly 3 questions are required for APTIS Writing Task 3';
    }

    const emptyQuestions = formData.questions.filter(q => !q.question.trim());
    if (emptyQuestions.length > 0) {
      newErrors.question_content = `${emptyQuestions.length} question(s) are empty`;
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

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    handleChange('questions', newQuestions);
  };

  const handleMessageChange = (index, field, value) => {
    const newMessages = [...formData.messages];
    newMessages[index] = { ...newMessages[index], [field]: value };
    handleChange('messages', newMessages);
  };

  const handleParticipantChange = (index, field, value) => {
    const newParticipants = [...formData.participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    handleChange('participants', newParticipants);
  };

  const addMessage = () => {
    const newMessages = [...formData.messages];
    newMessages.push({
      id: Date.now(),
      sender_id: 1,
      sender_name: formData.participants[0]?.name || 'Alex',
      message: '',
      type: 'context',
      requires_response: false
    });
    handleChange('messages', newMessages);
  };

  const removeMessage = (index) => {
    if (formData.messages.length > 1) {
      const newMessages = formData.messages.filter((_, i) => i !== index);
      handleChange('messages', newMessages);
    }
  };

  const addQuestion = () => {
    if (formData.questions.length < 3) {
      const newQuestions = [...formData.questions];
      newQuestions.push({
        id: Date.now(),
        sender_id: 1,
        sender_name: formData.participants[0]?.name || 'Alex',
        question: '',
        word_limit: 35,
        expected_content: '',
        sample_answer: '',
        follow_up: false
      });
      handleChange('questions', newQuestions);
    }
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      const newQuestions = formData.questions.filter((_, i) => i !== index);
      handleChange('questions', newQuestions);
    }
  };

  const addParticipant = () => {
    const newParticipants = [...formData.participants];
    newParticipants.push({
      id: Date.now(),
      name: '',
      avatar: '',
      role: 'participant'
    });
    handleChange('participants', newParticipants);
  };

  const removeParticipant = (index) => {
    if (formData.participants.length > 2) {
      const newParticipants = formData.participants.filter((_, i) => i !== index);
      handleChange('participants', newParticipants);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ChatIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Writing Task 3: Chat Responses (B1)
          </Typography>
          <Chip label="5 Points" color="primary" />
          <Chip label="B1 Level" color="secondary" />
        </Box>
        
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Students participate in a chat room discussion by responding to 3 questions.
          Each response should be 30-40 words and demonstrate B1-level interaction skills.
        </Typography>
      </Paper>

      {/* Chat Setup */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon /> Chat Room Setup
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chat Topic"
                value={formData.chat_topic}
                onChange={(e) => handleChange('chat_topic', e.target.value)}
                error={!!errors.chat_topic}
                helperText={errors.chat_topic || 'Main discussion topic'}
                placeholder="e.g., Travel Experiences, Technology in Education"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Time Limit (minutes)"
                type="number"
                value={formData.time_limit}
                onChange={(e) => handleChange('time_limit', parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 8, max: 20 } }}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Chat Context"
            value={formData.chat_context}
            onChange={(e) => handleChange('chat_context', e.target.value)}
            error={!!errors.chat_context}
            helperText={errors.chat_context || 'Background information for the discussion'}
            sx={{ mb: 2 }}
            placeholder="Describe the situation and purpose of the chat discussion..."
          />

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Instructions to Students"
            value={formData.instructions}
            onChange={(e) => handleChange('instructions', e.target.value)}
            helperText="Clear instructions for the chat task"
          />
        </CardContent>
      </Card>

      {/* Participants */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Chat Participants ({formData.participants.length})
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addParticipant}
              variant="outlined"
              size="small"
            >
              Add Participant
            </Button>
          </Box>

          <Grid container spacing={2}>
            {formData.participants.map((participant, index) => (
              <Grid item xs={12} md={6} key={participant.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24 }}>
                        <PersonIcon />
                      </Avatar>
                      <Typography variant="subtitle2">
                        {participant.role === 'student' ? 'Student' : `Participant ${index + 1}`}
                      </Typography>
                    </Box>
                    {formData.participants.length > 2 && participant.role !== 'student' && (
                      <IconButton 
                        size="small" 
                        onClick={() => removeParticipant(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    label="Name"
                    value={participant.name}
                    onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                    sx={{ mb: 1 }}
                  />

                  <FormControl fullWidth size="small">
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={participant.role}
                      onChange={(e) => handleParticipantChange(index, 'role', e.target.value)}
                      label="Role"
                    >
                      <MenuItem value="moderator">Moderator</MenuItem>
                      <MenuItem value="participant">Participant</MenuItem>
                      <MenuItem value="student">Student (Test-taker)</MenuItem>
                    </Select>
                  </FormControl>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Context Messages */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Context Messages ({formData.messages.length})
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addMessage}
              variant="outlined"
              size="small"
            >
              Add Message
            </Button>
          </Box>

          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {formData.messages.map((message, index) => (
              <Paper key={message.id} variant="outlined" sx={{ p: 2, mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24 }}>
                      {message.sender_name?.charAt(0)}
                    </Avatar>
                    <Typography variant="subtitle2">
                      {message.sender_name}
                    </Typography>
                  </Box>
                  {formData.messages.length > 1 && (
                    <IconButton 
                      size="small" 
                      onClick={() => removeMessage(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={1}>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      label="Message"
                      value={message.message}
                      onChange={(e) => handleMessageChange(index, 'message', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sender</InputLabel>
                      <Select
                        value={message.sender_id}
                        onChange={(e) => {
                          const sender = formData.participants.find(p => p.id === e.target.value);
                          handleMessageChange(index, 'sender_id', e.target.value);
                          handleMessageChange(index, 'sender_name', sender?.name || '');
                        }}
                        label="Sender"
                      >
                        {formData.participants.map((participant) => (
                          <MenuItem key={participant.id} value={participant.id}>
                            {participant.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Questions for Student Response ({formData.questions.length}/3)
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addQuestion}
              variant="outlined"
              size="small"
              disabled={formData.questions.length >= 3}
            >
              Add Question
            </Button>
          </Box>

          {errors.questions && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.questions}
            </Alert>
          )}

          {errors.question_content && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {errors.question_content}
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
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label="Question Text"
                    value={question.question}
                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                    placeholder="Ask a question that requires a 30-40 word response"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Word Limit"
                    type="number"
                    value={question.word_limit}
                    onChange={(e) => handleQuestionChange(index, 'word_limit', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 25, max: 50 } }}
                    helperText="Typically 30-40"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Expected Content"
                    value={question.expected_content}
                    onChange={(e) => handleQuestionChange(index, 'expected_content', e.target.value)}
                    placeholder="Key points the response should include"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Sender</InputLabel>
                    <Select
                      value={question.sender_id}
                      onChange={(e) => {
                        const sender = formData.participants.find(p => p.id === e.target.value);
                        handleQuestionChange(index, 'sender_id', e.target.value);
                        handleQuestionChange(index, 'sender_name', sender?.name || '');
                      }}
                      label="Sender"
                    >
                      {formData.participants.filter(p => p.role !== 'student').map((participant) => (
                        <MenuItem key={participant.id} value={participant.id}>
                          {participant.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Sample Answer (B1 Level)"
                    value={question.sample_answer}
                    onChange={(e) => handleQuestionChange(index, 'sample_answer', e.target.value)}
                    placeholder="Provide a model answer demonstrating B1-level interaction..."
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
            B1-Level Scoring Criteria
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
                helperText="How well questions are addressed"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Coherence & Cohesion"
                value={formData.scoring_criteria.coherence_cohesion}
                onChange={(e) => handleChange('scoring_criteria', {
                  ...formData.scoring_criteria,
                  coherence_cohesion: e.target.value
                })}
                helperText="Logical flow and connections"
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
                helperText="Vocabulary range and accuracy"
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
                helperText="Grammar structures and accuracy"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary */}
      <Paper sx={{ p: 2, mt: 3, backgroundColor: '#f9f9f9' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Summary:</strong> {formData.participants.length} participants, 
          {formData.messages.length} context messages, {formData.questions.length}/3 questions, 
          B1 level task, {formData.time_limit} minutes time limit
        </Typography>
      </Paper>
    </Box>
  );
};

export default WritingChatResponsesForm;