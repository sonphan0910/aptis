'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export default function LoadingSpinner({ message = 'Đang tải...', overlay = true, size = 60 }) {
  if (!overlay) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          p: 3,
        }}
      >
        <CircularProgress 
          size={size} 
          thickness={4}
          sx={{ 
            color: '#999999',
          }}
        />
        
        {message && (
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              letterSpacing: '0.5px',
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        backdropFilter: 'blur(2px)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          p: 3,
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          minWidth: 200,
        }}
      >
        <CircularProgress 
          size={size} 
          thickness={4}
          sx={{ 
            color: '#1976d2',
          }}
        />
        
        {message && (
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.primary',
              letterSpacing: '0.5px',
              textAlign: 'center',
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
}