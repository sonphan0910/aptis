'use client';

import { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Typography,
  Box,
  Button,
  Collapse,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  PlayArrow,
  CheckCircle,
  RadioButtonUnchecked,
  Grade,
  Schedule,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function RecentAttempts({ attempts, showActions = false, maxItems = 5 }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  
  const displayAttempts = expanded ? attempts : attempts.slice(0, maxItems);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
      case 'graded':
      case 'reviewed':
        return <CheckCircle color="success" />;
      case 'in_progress':
        return <RadioButtonUnchecked color="primary" />;
      default:
        return <RadioButtonUnchecked color="disabled" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'info';
      case 'graded':
        return 'success';
      case 'reviewed':
        return 'success';
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'in_progress':
        return 'Đang làm';
      case 'submitted':
        return 'Đã nộp';
      case 'graded':
        return 'Đã chấm';
      case 'reviewed':
        return 'Đã xem lại';
      default:
        return status;
    }
  };

  const getAttemptTypeText = (type) => {
    switch (type) {
      case 'full_exam':
        return 'Thi đầy đủ';
      case 'single_skill':
        return 'Luyện kỹ năng';
      default:
        return type;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const handleViewResults = (attemptId) => {
    router.push(`/results/${attemptId}`);
  };

  const handleContinueAttempt = (attemptId) => {
    router.push(`/exams/take/${attemptId}`);
  };

  if (!attempts || attempts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Chưa có kết quả nào
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <List disablePadding>
        {displayAttempts.map((attempt, index) => (
          <Box key={attempt.id}>
            <ListItem alignItems="flex-start">
              <Box sx={{ mr: 2, mt: 0.5 }}>
                {getStatusIcon(attempt.status)}
              </Box>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'medium' }}>
                      {attempt.exam?.title || 'Bài thi không rõ'}
                    </Typography>
                    <Chip
                      label={getStatusText(attempt.status)}
                      size="small"
                      color={getStatusColor(attempt.status)}
                      variant="filled"
                    />
                    {attempt.exam?.aptisType && (
                      <Chip
                        label={attempt.exam.aptisType.aptis_type_name}
                        size="small"
                        variant="outlined"
                        color="default"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>{getAttemptTypeText(attempt.attempt_type)}</strong>
                      {attempt.selected_skill && (
                        <span> - {attempt.selected_skill.skill_type_name}</span>
                      )}
                      {attempt.exam?.duration_minutes && (
                        <span> • Thời gian: {attempt.exam.duration_minutes} phút</span>
                      )}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5, flexWrap: 'wrap' }}>
                      {attempt.total_score !== null ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Grade sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Chip
                            label={`${Math.round(attempt.total_score * 100) / 100}%`}
                            size="small"
                            color={getScoreColor(attempt.total_score)}
                            variant="filled"
                          />
                        </Box>
                      ) : (
                        <Chip
                          label="Chưa có điểm"
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      )}
                      
                      <Typography variant="caption" color="text.secondary">
                        Lần {attempt.attempt_number}
                      </Typography>
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Schedule sx={{ fontSize: 14 }} />
                      {attempt.start_time && formatDistanceToNow(new Date(attempt.start_time), { 
                        addSuffix: true,
                        locale: vi
                      })}
                      {attempt.end_time && (
                        <span> • Kết thúc {formatDistanceToNow(new Date(attempt.end_time), { 
                          addSuffix: true,
                          locale: vi
                        })}</span>
                      )}
                    </Typography>
                  </Box>
                }
              />

              {showActions && (
                <ListItemSecondaryAction>
                  {attempt.status === 'in_progress' ? (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => handleContinueAttempt(attempt.id)}
                    >
                      Tiếp tục
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Grade />}
                      onClick={() => handleViewResults(attempt.id)}
                    >
                      Xem kết quả
                    </Button>
                  )}
                </ListItemSecondaryAction>
              )}
            </ListItem>
            
            {index < displayAttempts.length - 1 && <Divider />}
          </Box>
        ))}
      </List>

      {attempts.length > maxItems && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            startIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setExpanded(!expanded)}
            size="small"
          >
            {expanded ? 'Thu gọn' : `Xem thêm ${attempts.length - maxItems} kết quả`}
          </Button>
        </Box>
      )}
    </Box>
  );
}