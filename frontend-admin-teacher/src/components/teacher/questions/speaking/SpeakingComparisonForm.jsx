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
  ImageList,
  ImageListItem
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoIcon,
  RecordVoiceOver as SpeakIcon,
  Info as InfoIcon,
  Compare as CompareIcon
} from '@mui/icons-material';

/**
 * APTIS Speaking Task 3: Comparison (B1 Level)
 * Cấu trúc: So sánh 2 hình ảnh hoặc tình huống
 * Điểm: 0-5 scale (B1 level)
 * Focus: Comparing, contrasting, expressing preferences, giving reasons
 */
const SpeakingComparisonForm = ({ questionData, onChange, onValidate }) => {
  const [formData, setFormData] = React.useState({
    content: questionData?.content || '',
    topic: questionData?.topic || '',
    images: questionData?.images || [
      {
        id: 1,
        url: '',
        description: '',
        alt_text: ''
      },
      {
        id: 2,
        url: '',
        description: '',
        alt_text: ''
      }
    ],
    comparison_prompts: questionData?.comparison_prompts || [
      {
        id: 1,
        prompt: 'Compare these two images.',
        focus: 'general_comparison'
      },
      {
        id: 2,
        prompt: 'Which one do you prefer and why?',
        focus: 'preference_reasoning'
      }
    ],
    useful_language: questionData?.useful_language || {
      comparison_phrases: ['In contrast to...', 'Unlike...', 'While... on the other hand...', 'Both images show...'],
      preference_phrases: ['I prefer... because...', 'I think... is better than...', 'In my opinion...', 'I would choose...'],
      descriptive_adjectives: ['modern', 'traditional', 'busy', 'peaceful', 'crowded', 'spacious']
    },
    instructions: questionData?.instructions || 'Look at the two images and compare them. Then tell me which one you prefer and explain why. You have 1 minute to prepare and 1-2 minutes to speak.',
    scoring_criteria: questionData?.scoring_criteria || {
      task_achievement: 'Addresses comparison and preference clearly',
      fluency_coherence: 'Maintains flow with some hesitation acceptable',
      lexical_resource: 'B1 vocabulary for comparison and preference',
      grammatical_accuracy: 'Comparative structures, present/past tenses',
      pronunciation: 'Generally clear with some B1-level features'
    },
    preparation_time: questionData?.preparation_time || 60,
    speaking_time: questionData?.speaking_time || 90,
    difficulty: questionData?.difficulty || 'medium',
    cefr_level: 'B1',
    points: questionData?.points || 5
  });

  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validate topic
    if (!formData.topic.trim()) {
      newErrors.topic = 'Topic is required';
    }

    // Validate images
    if (formData.images.length < 2) {
      newErrors.images = 'At least 2 images are required for comparison';
    }

    const imagesWithoutDescription = formData.images.filter(img => !img.description.trim());
    if (imagesWithoutDescription.length > 0) {
      newErrors.image_descriptions = `${imagesWithoutDescription.length} image(s) missing descriptions`;
    }

    // Validate comparison prompts
    if (formData.comparison_prompts.length === 0) {
      newErrors.comparison_prompts = 'At least one comparison prompt is required';
    }

    const emptyPrompts = formData.comparison_prompts.filter(prompt => !prompt.prompt.trim());
    if (emptyPrompts.length > 0) {
      newErrors.prompt_content = `${emptyPrompts.length} prompt(s) are empty`;
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

  const handleImageChange = (index, field, value) => {
    const newImages = [...formData.images];
    newImages[index] = { ...newImages[index], [field]: value };
    handleChange('images', newImages);
  };

  const handlePromptChange = (index, field, value) => {
    const newPrompts = [...formData.comparison_prompts];
    newPrompts[index] = { ...newPrompts[index], [field]: value };
    handleChange('comparison_prompts', newPrompts);
  };

  const handleUsefulLanguageChange = (category, index, value) => {
    const newUsefulLanguage = { ...formData.useful_language };
    newUsefulLanguage[category][index] = value;
    handleChange('useful_language', newUsefulLanguage);
  };

  const addImage = () => {
    if (formData.images.length < 4) {
      const newImages = [...formData.images];
      newImages.push({
        id: Date.now(),
        url: '',
        description: '',
        alt_text: ''
      });
      handleChange('images', newImages);
    }
  };

  const removeImage = (index) => {
    if (formData.images.length > 2) {
      const newImages = formData.images.filter((_, i) => i !== index);
      handleChange('images', newImages);
    }
  };

  const addPrompt = () => {
    const newPrompts = [...formData.comparison_prompts];
    newPrompts.push({
      id: Date.now(),
      prompt: '',
      focus: 'general_comparison'
    });
    handleChange('comparison_prompts', newPrompts);
  };

  const removePrompt = (index) => {
    if (formData.comparison_prompts.length > 1) {
      const newPrompts = formData.comparison_prompts.filter((_, i) => i !== index);
      handleChange('comparison_prompts', newPrompts);
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

  const promptFocusOptions = [
    { value: 'general_comparison', label: 'General Comparison' },
    { value: 'preference_reasoning', label: 'Preference & Reasoning' },
    { value: 'similarities_differences', label: 'Similarities & Differences' },
    { value: 'advantages_disadvantages', label: 'Advantages & Disadvantages' },
    { value: 'personal_experience', label: 'Personal Experience' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CompareIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Speaking Task 3: Comparison (B1)
          </Typography>
          <Chip label="5 Points" color="primary" />
          <Chip label="B1 Level" color="secondary" />
        </Box>
        
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Students compare images/situations, express preferences, and give reasons.
          Tests ability to use comparative language and express opinions clearly.
        </Typography>
      </Paper>

      {/* Task Setup */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon /> Task Setup
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Comparison Topic"
                value={formData.topic}
                onChange={(e) => handleChange('topic', e.target.value)}
                error={!!errors.topic}
                helperText={errors.topic || 'Main topic for comparison'}
                placeholder="e.g., Urban vs Rural Life, Traditional vs Modern Education"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Prep Time (sec)"
                type="number"
                value={formData.preparation_time}
                onChange={(e) => handleChange('preparation_time', parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 30, max: 120 } }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Speaking Time (sec)"
                type="number"
                value={formData.speaking_time}
                onChange={(e) => handleChange('speaking_time', parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 60, max: 180 } }}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Instructions to Students"
            value={formData.instructions}
            onChange={(e) => handleChange('instructions', e.target.value)}
            helperText="Clear instructions for the comparison task"
          />
        </CardContent>
      </Card>

      {/* Images Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Images for Comparison ({formData.images.length}/4 max)
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addImage}
              disabled={formData.images.length >= 4}
              variant="outlined"
              size="small"
            >
              Add Image
            </Button>
          </Box>

          {errors.images && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.images}
            </Alert>
          )}

          {errors.image_descriptions && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {errors.image_descriptions}
            </Alert>
          )}

          <Grid container spacing={2}>
            {formData.images.map((image, index) => (
              <Grid item xs={12} md={6} key={image.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Image {index + 1}
                    </Typography>
                    {formData.images.length > 2 && (
                      <IconButton 
                        size="small" 
                        onClick={() => removeImage(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>

                  {/* Image Preview */}
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    {image.url ? (
                      <Box
                        component="img"
                        src={image.url}
                        alt={image.alt_text}
                        sx={{
                          width: '100%',
                          maxWidth: 200,
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: '1px solid #ddd'
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 200,
                          height: 120,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          border: '1px dashed #ccc'
                        }}
                      >
                        <PhotoIcon color="disabled" />
                      </Box>
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    label="Image URL"
                    value={image.url}
                    onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                    sx={{ mb: 1 }}
                    placeholder="Enter image URL or upload path"
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Image Description"
                    value={image.description}
                    onChange={(e) => handleImageChange(index, 'description', e.target.value)}
                    sx={{ mb: 1 }}
                    placeholder="Describe what the image shows for comparison purposes"
                    error={!image.description.trim()}
                  />

                  <TextField
                    fullWidth
                    label="Alt Text (Accessibility)"
                    value={image.alt_text}
                    onChange={(e) => handleImageChange(index, 'alt_text', e.target.value)}
                    placeholder="Brief description for screen readers"
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Comparison Prompts */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Comparison Prompts ({formData.comparison_prompts.length})
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addPrompt}
              variant="outlined"
              size="small"
            >
              Add Prompt
            </Button>
          </Box>

          {errors.prompt_content && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {errors.prompt_content}
            </Alert>
          )}

          {formData.comparison_prompts.map((prompt, index) => (
            <Paper key={prompt.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Prompt {index + 1}
                </Typography>
                {formData.comparison_prompts.length > 1 && (
                  <IconButton 
                    size="small" 
                    onClick={() => removePrompt(index)}
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
                    label="Prompt Text"
                    value={prompt.prompt}
                    onChange={(e) => handlePromptChange(index, 'prompt', e.target.value)}
                    placeholder="e.g., Compare these two situations and tell me which you prefer"
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Focus</InputLabel>
                    <Select
                      value={prompt.focus}
                      onChange={(e) => handlePromptChange(index, 'focus', e.target.value)}
                      label="Focus"
                    >
                      {promptFocusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
            Useful Language for B1 Comparison
          </Typography>

          <Grid container spacing={2}>
            {/* Comparison Phrases */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Comparison Phrases
                <IconButton 
                  size="small" 
                  onClick={() => addUsefulPhrase('comparison_phrases')}
                >
                  <AddIcon />
                </IconButton>
              </Typography>
              {formData.useful_language.comparison_phrases.map((phrase, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={phrase}
                    onChange={(e) => handleUsefulLanguageChange('comparison_phrases', index, e.target.value)}
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => removeUsefulPhrase('comparison_phrases', index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Grid>

            {/* Preference Phrases */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Preference Phrases
                <IconButton 
                  size="small" 
                  onClick={() => addUsefulPhrase('preference_phrases')}
                >
                  <AddIcon />
                </IconButton>
              </Typography>
              {formData.useful_language.preference_phrases.map((phrase, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={phrase}
                    onChange={(e) => handleUsefulLanguageChange('preference_phrases', index, e.target.value)}
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => removeUsefulPhrase('preference_phrases', index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Grid>

            {/* Descriptive Adjectives */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Descriptive Adjectives
                <IconButton 
                  size="small" 
                  onClick={() => addUsefulPhrase('descriptive_adjectives')}
                >
                  <AddIcon />
                </IconButton>
              </Typography>
              {formData.useful_language.descriptive_adjectives.map((adjective, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={adjective}
                    onChange={(e) => handleUsefulLanguageChange('descriptive_adjectives', index, e.target.value)}
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => removeUsefulPhrase('descriptive_adjectives', index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Grid>
          </Grid>
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
                helperText="How well the comparison is made"
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
                helperText="Speech flow and organization"
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
                helperText="Vocabulary for comparison"
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
                helperText="Comparative structures"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary */}
      <Paper sx={{ p: 2, mt: 3, backgroundColor: '#f9f9f9' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Summary:</strong> {formData.images.length} images, 
          {formData.comparison_prompts.length} prompts, {formData.preparation_time}s prep time, 
          {formData.speaking_time}s speaking time, B1 level task
        </Typography>
      </Paper>
    </Box>
  );
};

export default SpeakingComparisonForm;