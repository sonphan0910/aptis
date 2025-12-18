'use client';
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Grid
} from '@mui/material';
import { PlayArrow as PlayIcon, AccessTime as TimeIcon, Quiz as QuizIcon } from '@mui/icons-material';

const ExamPreview = ({ exam }) => {
  if (!exam || !exam.sections || exam.sections.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Chưa có nội dung để xem trước
        </Typography>
        <Typography color="text.secondary">
          Vui lòng thêm phần và câu hỏi vào bài thi để xem trước.
        </Typography>
      </Box>
    );
  }

  const totalQuestions = exam.sections.reduce((total, section) => 
    total + (section.questions?.length || 0), 0);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Exam Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {exam.title}
          </Typography>
          
          {exam.description && (
            <Typography variant="body1" paragraph color="text.secondary">
              {exam.description}
            </Typography>
          )}
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon fontSize="small" color="primary" />
                <Typography variant="body2">
                  Thời gian: {exam.time_limit} phút
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QuizIcon fontSize="small" color="primary" />
                <Typography variant="body2">
                  Tổng câu hỏi: {totalQuestions}
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Chip 
                label={exam.aptis_type || 'APTIS General'} 
                color="primary" 
                size="small"
              />
            </Grid>
          </Grid>
          
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            sx={{ mt: 2 }}
            size="large"
          >
            Bắt đầu làm bài
          </Button>
        </CardContent>
      </Card>

      {/* Exam Sections */}
      {exam.sections.map((section, sectionIndex) => (
        <Card key={section.id || sectionIndex} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {section.name || `Part ${sectionIndex + 1}`}
            </Typography>
            
            {section.description && (
              <Typography variant="body2" color="text.secondary" paragraph>
                {section.description}
              </Typography>
            )}
            
            {section.instructions && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Hướng dẫn:
                </Typography>
                <Typography variant="body2">
                  {section.instructions}
                </Typography>
              </Box>
            )}
            
            {section.questions && section.questions.length > 0 ? (
              <List dense>
                {section.questions.map((question, questionIndex) => (
                  <React.Fragment key={question.id || questionIndex}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {questionIndex + 1}. {question.title}
                            </Typography>
                            <Chip 
                              label={question.question_type} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              label={question.skill} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                            <Chip 
                              label={question.difficulty} 
                              size="small"
                              color={
                                question.difficulty === 'easy' ? 'success' :
                                question.difficulty === 'medium' ? 'warning' : 'error'
                              }
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={question.description}
                      />
                    </ListItem>
                    {questionIndex < section.questions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Chưa có câu hỏi trong phần này
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
      
      {/* Summary */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tóm tắt bài thi
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Số phần thi
              </Typography>
              <Typography variant="h6">
                {exam.sections.length}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Tổng câu hỏi
              </Typography>
              <Typography variant="h6">
                {totalQuestions}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Thời gian
              </Typography>
              <Typography variant="h6">
                {exam.time_limit} phút
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Loại APTIS
              </Typography>
              <Typography variant="h6">
                {exam.aptis_type || 'General'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExamPreview;