'use client';

import { useState, useEffect } from 'react';
import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
} from '@mui/material';

export default function MCQQuestion({ question, onAnswerChange }) {
  const [selectedOption, setSelectedOption] = useState('');

  // Initialize from answer_data when component mounts or answer changes
  useEffect(() => {
    console.log('[MCQQuestion] useEffect triggered:', {
      questionId: question.id,
      hasAnswerData: !!question.answer_data,
      selectedOptionFromData: question.answer_data?.selected_option,
      currentSelected: selectedOption
    });
    
    if (question.answer_data?.selected_option) {
      const optionValue = String(question.answer_data.selected_option);
      console.log('[MCQQuestion] Setting selected option:', optionValue);
      setSelectedOption(optionValue);
    } else {
      // Reset if no answer data
      setSelectedOption('');
    }
  }, [question.id, question.answer_data?.selected_option]); // Track specific value, not whole object

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
    
    onAnswerChange({
      selected_option: value
    });
  };

  const options = question.options || [];
  const isTrueFalse = question.questionType?.code === 'READING_TRUE_FALSE';

  console.log('[MCQQuestion] Question data:', {
    questionId: question.id,
    questionType: question.questionType?.code,
    isTrueFalse,
    optionsCount: options.length,
    sampleOption: options[0]
  });

  return (
    <Box>
      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          value={selectedOption}
          onChange={handleChange}
        >
          {options.map((option, index) => (
            <FormControlLabel
              key={option.id || index}
              value={option.id}
              control={<Radio />}
              label={
                <Typography variant="body1" sx={{ py: 1 }}>
                  {isTrueFalse ? 
                    option.option_text : 
                    `${String.fromCharCode(65 + index)}. ${option.option_text}`
                  }
                </Typography>
              }
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                margin: '4px 0',
                ml: 0,
                pr: 2,
                '&:hover': {
                  backgroundColor: 'action.hover'
                },
                '& .MuiFormControlLabel-label': {
                  width: '100%'
                }
              }}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
}