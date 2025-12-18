'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { Edit, Close } from '@mui/icons-material';

export default function QuestionPreview({ 
  question, 
  open = true, 
  onClose, 
  onEdit, 
  showActions = true 
}) {
  if (!question) return null;

  const renderQuestionContent = () => {
    const { content, question_type } = question;
    
    switch (question_type) {
      case 'mcq':
        return (
          <Box>
            <Typography variant="body1" paragraph>
              {content.question}
            </Typography>
            <RadioGroup value={content.correct_answer}>
              {content.options?.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio disabled />}
                  label={`${option.id}. ${option.text}`}
                  sx={{ 
                    backgroundColor: option.id === content.correct_answer ? 'success.light' : 'transparent',
                    borderRadius: 1,
                    px: 1
                  }}
                />
              ))}
            </RadioGroup>
            {content.explanation && (
              <Box mt={2}>
                <Typography variant="subtitle2" color="primary">Giải thích:</Typography>
                <Typography variant="body2">{content.explanation}</Typography>
              </Box>
            )}
          </Box>
        );
        
      case 'matching':
        return (
          <Box>
            <Typography variant="body1" paragraph>
              {content.instruction || 'Ghép các mục ở cột trái với cột phải'}
            </Typography>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Cột trái</Typography>
                <List dense>
                  {content.left_items?.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`${index + 1}. ${item.text}`} />
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Cột phải</Typography>
                <List dense>
                  {content.right_items?.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`${String.fromCharCode(65 + index)}. ${item.text}`} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
            {content.correct_matches && (
              <Box mt={2}>
                <Typography variant="subtitle2" color="primary">Câu trả lời đúng:</Typography>
                {content.correct_matches.map((match, index) => (
                  <Typography key={index} variant="body2">
                    {match.left} ↔ {match.right}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        );
        
      case 'writing':
        return (
          <Box>
            <Typography variant="body1" paragraph>
              {content.prompt}
            </Typography>
            <Box display="flex" gap={2} mb={2}>
              <Chip label={`Tối thiểu: ${content.min_words || 0} từ`} size="small" />
              <Chip label={`Tối đa: ${content.max_words || 0} từ`} size="small" />
            </Box>
            {content.guidelines && (
              <Box>
                <Typography variant="subtitle2" color="primary">Gợi ý:</Typography>
                <Typography variant="body2">{content.guidelines}</Typography>
              </Box>
            )}
          </Box>
        );
        
      case 'speaking':
        return (
          <Box>
            <Typography variant="body1" paragraph>
              {content.task}
            </Typography>
            <Chip label={`Thời gian: ${content.recording_time || 0} giây`} size="small" sx={{ mb: 2 }} />
            {content.instructions && (
              <Box>
                <Typography variant="subtitle2" color="primary">Hướng dẫn:</Typography>
                <Typography variant="body2">{content.instructions}</Typography>
              </Box>
            )}
          </Box>
        );
        
      default:
        return (
          <Typography variant="body2" color="text.secondary">
            Không thể hiển thị nội dung cho loại câu hỏi này
          </Typography>
        );
    }
  };

  const getQuestionTypeLabel = (type) => {
    const labels = {
      mcq: 'Trắc nghiệm',
      matching: 'Ghép đôi',
      gap_filling: 'Điền từ',
      ordering: 'Sắp xếp',
      writing: 'Viết',
      speaking: 'Nói'
    };
    return labels[type] || type;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">{question.title}</Typography>
        {question.description && (
          <Typography variant="body2" color="text.secondary">
            {question.description}
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent>
        <Box display="flex" gap={1} mb={3}>
          <Chip label={getQuestionTypeLabel(question.question_type)} color="primary" size="small" />
          <Chip label={question.skill} color="secondary" size="small" />
          <Chip label={question.aptis_type} variant="outlined" size="small" />
          <Chip 
            label={question.difficulty} 
            color={getDifficultyColor(question.difficulty)} 
            size="small" 
          />
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {renderQuestionContent()}
      </DialogContent>
      
      {showActions && (
        <DialogActions>
          <Button onClick={onClose} startIcon={<Close />}>
            Đóng
          </Button>
          {onEdit && (
            <Button onClick={onEdit} variant="contained" startIcon={<Edit />}>
              Chỉnh sửa
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
}