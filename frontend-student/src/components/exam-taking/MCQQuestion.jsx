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
    if (question.answer_data?.selected_option_id) {
      const optionValue = String(question.answer_data.selected_option_id);
      setSelectedOption(optionValue);
      console.log('[MCQQuestion] Initialized with existing answer:', optionValue);
    } else {
      // Reset if no answer data
      setSelectedOption('');
      console.log('[MCQQuestion] No existing answer, reset to empty');
    }
  }, [question.id, question.answer_data?.selected_option_id]); // Track specific value, not whole object

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);

    onAnswerChange({
      answer_type: 'option',
      selected_option_id: parseInt(value)
    });
  };

  const options = question.options || [];
  const isTrueFalse = question.questionType?.code === 'READING_TRUE_FALSE';

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