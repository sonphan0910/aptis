'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
} from '@mui/material';

export default function WritingEmailQuestion({ question, onAnswerChange }) {
  const [answers, setAnswers] = useState({
    friendEmail: '',
    managerEmail: '',
    formalEmail: ''
  });

  // Parse question content
  const questionData = React.useMemo(() => {
    try {
      // If content is text format, parse it
      if (typeof question.content === 'string' && !question.content.startsWith('{')) {
        // Parse the text content to extract email information
        const lines = question.content.split('\n').filter(line => line.trim());
        const title = lines[0] || "Email Writing Task";
        
        // Extract email content between "From:" and "---"
        let inEmailSection = false;
        let emailLines = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line.startsWith('From:')) {
            inEmailSection = true;
            continue;
          }
          
          if (line.startsWith('---')) {
            inEmailSection = false;
            break;
          }
          
          if (inEmailSection) {
            emailLines.push(line);
          }
        }
        
        let managerEmail = { subject: "Email", body: "Please respond to this email." };
        if (emailLines.length > 0) {
          const subject = emailLines.find(line => line.startsWith('Subject:'))?.replace('Subject:', '').trim() || "Email";
          const bodyStartIndex = emailLines.findIndex(line => line.startsWith('Dear') || line.includes('student') || line.includes('applicant'));
          const body = bodyStartIndex >= 0 ? emailLines.slice(bodyStartIndex).join('\n\n') : emailLines.join('\n\n');
          
          managerEmail = { subject, body };
        }
        
        return {
          title,
          managerEmail,
          tasks: [
            { type: "friend", description: "Email to a friend", wordCount: "50 words", difficulty: "EASY", maxPoints: 5, icon: "📝" },
            { type: "manager", description: "Email to school manager", wordCount: "80-100 words", difficulty: "MEDIUM", maxPoints: 10, icon: "📧" },
            { type: "formal", description: "Formal discussion email", wordCount: "120-150 words", difficulty: "HARD", maxPoints: 15, icon: "📬" }
          ]
        };
      }
      
      // Legacy JSON format support
      return typeof question.content === 'string' ? JSON.parse(question.content) : question.content;
    } catch (error) {
      console.error('Failed to parse question content:', error);
      return null;
    }
  }, [question.content]);

  // Initialize answers from question.answer_data
  useEffect(() => {
    console.log('[WritingEmailQuestion] Initializing for question:', question.id);
    
    if (question.answer_data && typeof question.answer_data === 'object') {
      if (question.answer_data.text_answer) {
        console.log('[WritingEmailQuestion] Found existing answer:', question.answer_data.text_answer);
        
        const textAnswer = question.answer_data.text_answer;
        
        let friendEmail = '';
        let managerEmail = '';
        let formalEmail = '';
        
        if (textAnswer.includes('Friend Email:') && textAnswer.includes('Manager Email:') && textAnswer.includes('Formal Email:')) {
          const friendMatch = textAnswer.match(/Friend Email:\n([\s\S]*?)(?:\n\nManager Email:|$)/);
          const managerMatch = textAnswer.match(/Manager Email:\n([\s\S]*?)(?:\n\nFormal Email:|$)/);
          const formalMatch = textAnswer.match(/Formal Email:\n([\s\S]*?)$/);
          
          friendEmail = friendMatch ? friendMatch[1].trim() : '';
          managerEmail = managerMatch ? managerMatch[1].trim() : '';
          formalEmail = formalMatch ? formalMatch[1].trim() : '';
        } else {
          friendEmail = textAnswer.trim();
        }
        
        console.log('[WritingEmailQuestion] Parsed emails:', { friendEmail, managerEmail, formalEmail });
        setAnswers({ friendEmail, managerEmail, formalEmail });
      } else {
        console.log('[WritingEmailQuestion] No existing answer, resetting');
        setAnswers({ friendEmail: '', managerEmail: '', formalEmail: '' });
      }
    } else {
      console.log('[WritingEmailQuestion] No answer_data, resetting');
      setAnswers({ friendEmail: '', managerEmail: '', formalEmail: '' });
    }
  }, [question.id, question.answer_data]);

  const handleAnswerChange = (emailKey, value) => {
    console.log(`[WritingEmailQuestion] Updating ${emailKey}:`, value);
    
    const newAnswers = {
      ...answers,
      [emailKey]: value
    };
    
    setAnswers(newAnswers);
    
    // Convert to formatted text for consistent storage
    const formattedText = `Friend Email:\n${newAnswers.friendEmail}\n\nManager Email:\n${newAnswers.managerEmail}\n\nFormal Email:\n${newAnswers.formalEmail}`;
    
    console.log(`[WritingEmailQuestion] Sending formatted answer:`, formattedText);
    
    // Send update to parent
    onAnswerChange({
      answer_type: 'text',
      text_answer: formattedText
    });
  };

  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  if (!questionData) {
    return <Box sx={{ p: 2 }}><Typography color="error">Không thể tải câu hỏi</Typography></Box>;
  }

  const friendWordCount = countWords(answers.friendEmail);
  const managerWordCount = countWords(answers.managerEmail);
  const formalWordCount = countWords(answers.formalEmail);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        {questionData.title}
      </Typography>

      {/* Manager Email - Reference Context */}
      <Box sx={{ mb: 4, p: 2.5, border: '1px solid #ddd', borderRadius: 1, bgcolor: '#f5f5f5' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Email from Manager</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          From: manager@company.com
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
          Subject: {questionData.managerEmail.subject}
        </Typography>
        
        <Box sx={{ 
          bgcolor: 'white', 
          p: 2, 
          borderRadius: 0.5,
          border: '1px solid #e0e0e0',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: 1.6,
          fontSize: '0.95rem'
        }}>
          {questionData.managerEmail.body}
        </Box>
      </Box>

      {/* Email 1: Friend Email */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {questionData.tasks[0].icon} {questionData.tasks[0].description}
          </Typography>
          <Chip 
            label={questionData.tasks[0].difficulty} 
            size="small" 
            color="success" 
            variant="outlined"
            sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            {questionData.tasks[0].maxPoints}pts
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
          Write a casual email ({questionData.tasks[0].wordCount})
        </Typography>
        
        <TextField
          multiline
          fullWidth
          rows={4}
          value={answers.friendEmail}
          onChange={(e) => handleAnswerChange('friendEmail', e.target.value)}
          variant="outlined"
          placeholder="Dear Friend,

I wanted to tell you about..."
          sx={{
            mb: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              fontSize: '0.95rem'
            }
          }}
        />
        
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {friendWordCount} words 
          {friendWordCount >= 45 && friendWordCount <= 55 ? ' ✓' : friendWordCount < 45 ? ` (need ${45 - friendWordCount} more)` : ` (${friendWordCount - 55} too many)`}
        </Typography>
      </Box>

      <Box sx={{ my: 3, borderTop: '1px solid #ddd' }} />

      {/* Email 2: Manager Email */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {questionData.tasks[1].icon} {questionData.tasks[1].description}
          </Typography>
          <Chip 
            label={questionData.tasks[1].difficulty} 
            size="small" 
            color="warning" 
            variant="outlined"
            sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            {questionData.tasks[1].maxPoints}pts
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
          Write a semi-formal email ({questionData.tasks[1].wordCount})
        </Typography>
        
        <TextField
          multiline
          fullWidth
          rows={5}
          value={answers.managerEmail}
          onChange={(e) => handleAnswerChange('managerEmail', e.target.value)}
          variant="outlined"
          placeholder="Dear Manager,

Thank you for your email..."
          sx={{
            mb: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              fontSize: '0.95rem'
            }
          }}
        />
        
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {managerWordCount} words 
          {managerWordCount >= 80 && managerWordCount <= 100 ? ' ✓' : managerWordCount < 80 ? ` (need ${80 - managerWordCount} more)` : ` (${managerWordCount - 100} too many)`}
        </Typography>
      </Box>

      <Box sx={{ my: 3, borderTop: '1px solid #ddd' }} />

      {/* Email 3: Formal Discussion Email */}
      <Box>
        <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {questionData.tasks[2].icon} {questionData.tasks[2].description}
          </Typography>
          <Chip 
            label={questionData.tasks[2].difficulty} 
            size="small" 
            color="error" 
            variant="outlined"
            sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            {questionData.tasks[2].maxPoints}pts
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
          Write a formal professional email with detailed discussion ({questionData.tasks[2].wordCount})
        </Typography>
        
        <TextField
          multiline
          fullWidth
          rows={6}
          value={answers.formalEmail}
          onChange={(e) => handleAnswerChange('formalEmail', e.target.value)}
          variant="outlined"
          placeholder="Dear Sir/Madam,

I am writing to discuss..."
          sx={{
            mb: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              fontSize: '0.95rem'
            }
          }}
        />
        
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {formalWordCount} words 
          {formalWordCount >= 120 && formalWordCount <= 150 ? ' ✓' : formalWordCount < 120 ? ` (need ${120 - formalWordCount} more)` : ` (${formalWordCount - 150} too many)`}
        </Typography>
      </Box>
    </Box>
  );
}