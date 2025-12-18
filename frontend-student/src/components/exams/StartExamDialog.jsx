'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Box,
  Divider,
  Chip,
} from '@mui/material';
import {
  AccessTime,
  Quiz,
  PlayArrow,
} from '@mui/icons-material';

export default function StartExamDialog({ open, onClose, exam, onStart }) {
  const [attemptType, setAttemptType] = useState('full_exam');
  const [selectedSkill, setSelectedSkill] = useState('');

  const handleStart = () => {
    if (attemptType === 'single_skill' && !selectedSkill) {
      return;
    }
    onStart(attemptType, selectedSkill);
    onClose();
  };

  const handleTypeChange = (event) => {
    const value = event.target.value;
    setAttemptType(value);
    if (value === 'full_exam') {
      setSelectedSkill('');
    }
  };

  if (!exam) return null;

  const availableSkills = exam.sections?.map(section => ({
    id: section.skill_type_id || section.skillType?.id,
    skill_type: section.skillType?.skill_type_name || 'N/A',
    duration: section.duration_minutes,
    questions: section.questions?.length || 0,
    max_score: section.questions?.reduce((sum, q) => sum + (parseInt(q.max_score) || 0), 0) || 0,
  })) || [];

  // Calculate totals from sections
  const totalDuration = availableSkills.reduce((sum, skill) => sum + skill.duration, 0);
  const totalQuestions = availableSkills.reduce((sum, skill) => sum + skill.questions, 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Bắt đầu làm bài thi
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {exam.title}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          Vui lòng chọn chế độ làm bài. Bạn có thể làm toàn bộ bài thi hoặc chỉ luyện tập một kỹ năng cụ thể.
        </Alert>

        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            value={attemptType}
            onChange={handleTypeChange}
          >
            <FormControlLabel
              value="full_exam"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    Làm toàn bộ bài thi
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Hoàn thành tất cả các phần thi ({exam.sections?.length || 0} kỹ năng)
                  </Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip 
                      size="small" 
                      icon={<AccessTime fontSize="small" />} 
                      label={`${totalDuration} phút`}
                    />
                    <Chip 
                      size="small" 
                      icon={<Quiz fontSize="small" />} 
                      label={`${totalQuestions} câu`}
                    />
                  </Box>
                </Box>
              }
            />
            
            <FormControlLabel
              value="single_skill"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    Luyện tập một kỹ năng
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Chọn một kỹ năng cụ thể để luyện tập
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>

        {attemptType === 'single_skill' && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Chọn kỹ năng muốn luyện tập:
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
              >
                {availableSkills.map((skill) => (
                  <FormControlLabel
                    key={skill.id}
                    value={skill.id}
                    control={<Radio />}
                    label={
                      <Box sx={{ width: '100%', py: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {skill.skill_type}
                        </Typography>
                        <Box display="flex" gap={1} mt={0.5}>
                          <Chip 
                            size="small" 
                            variant="outlined"
                            label={`${skill.duration} phút`}
                          />
                          <Chip 
                            size="small" 
                            variant="outlined"
                            label={`${skill.questions} câu`}
                          />
                          <Chip 
                            size="small" 
                            variant="outlined"
                            label={`${skill.max_score} điểm`}
                          />
                        </Box>
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Lưu ý:</strong> Sau khi bắt đầu, thời gian sẽ được tính ngay. 
            Hãy đảm bảo bạn có đủ thời gian và môi trường phù hợp để làm bài.
          </Typography>
        </Alert>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Hủy
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayArrow />}
          onClick={handleStart}
          disabled={attemptType === 'single_skill' && !selectedSkill}
        >
          Bắt đầu
        </Button>
      </DialogActions>
    </Dialog>
  );
}