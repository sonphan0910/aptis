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

  // Parse question content from backend
  const questionData = React.useMemo(() => {
    if (!question.content) return null;

    try {
      let contentString = '';

      // 1. Handle JSON or string content
      if (typeof question.content === 'string') {
        if (question.content.trim().startsWith('{')) {
          const parsed = JSON.parse(question.content);
          contentString = parsed.content || parsed.emailContent || question.content;

          // If the JSON already has the structure we want, return it
          if (parsed.managerEmail && parsed.tasks) return parsed;
        } else {
          contentString = question.content;
        }
      } else if (typeof question.content === 'object') {
        if (question.content.managerEmail && question.content.tasks) return question.content;
        contentString = question.content.content || question.content.emailContent || '';
      }

      const content = contentString;

      // Extract title (first line)
      const firstNewlineIndex = content.indexOf('\n');
      const title = firstNewlineIndex > 0 ? content.substring(0, firstNewlineIndex).trim() : 'Email Writing Task';

      // Extract reference email (between "From:" and "---" or similar patterns)
      const fromIndex = content.indexOf('From:');
      const endEmailIndex = content.indexOf('---');
      let managerEmail = { subject: "Email", body: "Please respond to this email." };

      if (fromIndex !== -1) {
        let emailSection = '';
        if (endEmailIndex !== -1 && endEmailIndex > fromIndex) {
          emailSection = content.substring(fromIndex, endEmailIndex).trim();
        } else {
          // If no separator, take some portion or look for standard end markers
          emailSection = content.substring(fromIndex).trim();
        }

        const subjectMatch = emailSection.match(/Subject:\s*(.+?)(?:\n|$)/);
        const bodyMatch = emailSection.match(/(?:Dear|Hi)[\s\S]*$/);

        managerEmail = {
          subject: subjectMatch ? subjectMatch[1].trim() : "Email Discussion",
          body: bodyMatch ? bodyMatch[0].trim() : emailSection
        };
      } else if (content.includes('Dear') || content.includes('Hi')) {
        // Fallback for informal emails without "From:" header
        const dearIndex = Math.max(content.indexOf('Dear'), content.indexOf('Hi'));
        const bodyEnd = endEmailIndex !== -1 ? endEmailIndex : content.length;
        managerEmail = {
          subject: "Incoming Email",
          body: content.substring(dearIndex, bodyEnd).trim()
        };
      }

      // Extract email tasks after "---" or by searching for numbered list
      let tasks = [];
      const tasksSection = endEmailIndex !== -1 ? content.substring(endEmailIndex + 3).trim() : content;

      // Try to find tasks with pattern "1. description (word count)"
      const taskMatches = tasksSection.match(/(\d+)\.\s*(.+?)\s*\((.+?)\)/g);

      if (taskMatches) {
        taskMatches.forEach((match, idx) => {
          const parts = match.match(/(\d+)\.\s*(.+?)\s*\((.+?)\)/);
          if (parts) {
            const taskType = ['friendEmail', 'managerEmail', 'formalEmail'][idx] || `task_${idx}`;
            tasks.push({
              type: taskType,
              description: parts[2].trim(),
              wordCount: parts[3].trim(),
              maxPoints: [5, 10, 15][idx] || 10
            });
          }
        });
      }

      // Final fallback: if no tasks found, provide default tasks
      if (tasks.length === 0) {
        tasks = [
          { type: 'friendEmail', description: 'Write an email to a friend', wordCount: '50 words', maxPoints: 5 },
          { type: 'managerEmail', description: 'Write an email to a manager', wordCount: '120-150 words', maxPoints: 10 }
        ];
      }

      return {
        title,
        managerEmail,
        tasks
      };
    } catch (error) {
      console.warn('[WritingEmailQuestion] Parsing failed:', error);
      return {
        title: "Email Writing Task",
        managerEmail: { subject: "Email", body: "Please check the instructions and respond." },
        tasks: [
          { type: 'friendEmail', description: 'Email to friend', wordCount: '50 words', maxPoints: 5 },
          { type: 'formalEmail', description: 'Formal email', wordCount: '120-150 words', maxPoints: 10 }
        ]
      };
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

  if (!questionData || !questionData.tasks) {
    return <Box sx={{ p: 2 }}><Typography color="error">Không thể tải câu hỏi</Typography></Box>;
  }

  const friendWordCount = countWords(answers.friendEmail);
  const managerWordCount = countWords(answers.managerEmail);
  const formalWordCount = countWords(answers.formalEmail);

  // Function to extract word count range as numbers
  const getWordCountRange = (text) => {
    const match = text.match(/(\d+)(?:-(\d+))?/);
    if (match) {
      const min = parseInt(match[1]);
      const max = match[2] ? parseInt(match[2]) : min;
      return { min, max };
    }
    return { min: 50, max: 50 };
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Reference Email from Backend */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Email Reference</Typography>
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

      {/* Render tasks dynamically from backend */}
      {questionData.tasks.map((task, idx) => {
        const wordCountRange = getWordCountRange(task.wordCount);
        const currentCount = task.type === 'friendEmail' ? friendWordCount :
          task.type === 'managerEmail' ? managerWordCount :
            formalWordCount;

        const isInRange = currentCount >= wordCountRange.min && currentCount <= wordCountRange.max;
        const feedbackText = isInRange
          ? ' ✓'
          : currentCount < wordCountRange.min
            ? ` (need ${wordCountRange.min - currentCount} more)`
            : ` (${currentCount - wordCountRange.max} too many)`;

        return (
          <Box key={idx} sx={{ mb: idx === questionData.tasks.length - 1 ? 0 : 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {task.description} ({task.wordCount})
            </Typography>
            <TextField
              multiline
              fullWidth
              rows={idx === 0 ? 4 : idx === 1 ? 5 : 6}
              value={answers[task.type]}
              onChange={(e) => handleAnswerChange(task.type, e.target.value)}
              variant="outlined"
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  fontSize: '0.95rem'
                }
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {currentCount} words{feedbackText}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}