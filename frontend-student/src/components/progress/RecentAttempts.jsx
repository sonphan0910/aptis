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
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export default function RecentAttempts({ attempts, showActions = false, maxItems = 5 }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  
  const displayAttempts = expanded ? attempts : attempts.slice(0, maxItems);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'graded':
        return <CheckCircle color="success" />;
      case 'in_progress':
        return <RadioButtonUnchecked color="primary" />;
      default:
        return <RadioButtonUnchecked color="disabled" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'graded':
        return 'success';
      case 'in_progress':
        return 'primary';
      default:
        return 'default';
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
          No recent attempts to show
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
                    <Typography variant="subtitle2" component="span">
                      {attempt.exam?.title || 'Unknown Exam'}
                    </Typography>
                    <Chip
                      label={attempt.status}
                      size="small"
                      color={getStatusColor(attempt.status)}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {attempt.attempt_type === 'single_skill' 
                        ? `${attempt.selected_skill?.name || 'Single Skill'} Practice`
                        : 'Full Exam'
                      }
                    </Typography>
                    
                    {attempt.total_score !== null && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Grade sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Chip
                          label={`${Math.round(attempt.total_score)}%`}
                          size="small"
                          color={getScoreColor(attempt.total_score)}
                        />
                      </Box>
                    )}
                    
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(attempt.start_time || attempt.created_at), { 
                        addSuffix: true 
                      })}
                    </Typography>
                  </Box>
                }
              />

              {showActions && (
                <ListItemSecondaryAction>
                  {attempt.status === 'in_progress' ? (
                    <Button
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => handleContinueAttempt(attempt.id)}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewResults(attempt.id)}
                    >
                      View Results
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
            {expanded ? 'Show Less' : `Show ${attempts.length - maxItems} More`}
          </Button>
        </Box>
      )}
    </Box>
  );
}