'use client';

import { Box, Chip, Typography } from '@mui/material';
import { AccessTime, WarningAmber } from '@mui/icons-material';

export default function ExamTimer({ timeRemaining, totalTime, isRunning, skillName }) {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining <= 120) return 'error'; // 2 minutes
    if (timeRemaining <= 300) return 'warning'; // 5 minutes
    return 'primary';
  };

  const isLowTime = timeRemaining <= 300;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

      
      <Chip
        icon={isLowTime ? <WarningAmber /> : <AccessTime />}
        label={formatTime(timeRemaining)}
        color={getTimeColor()}
        variant={isLowTime ? 'filled' : 'outlined'}
        sx={{ 
          fontSize: '1rem',
          fontWeight: 'bold',
          minWidth: 100
        }}
      />
    </Box>
  );
}