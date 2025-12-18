'use client';

import { Box, CircularProgress, Typography, keyframes } from '@mui/material';
import { School } from '@mui/icons-material';

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export default function LoadingSpinner({ message = 'Đang tải...' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#1976d2',
        gap: 3,
        animation: `${fadeIn} 0.5s ease-out`,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer spinning circle */}
        <CircularProgress 
          size={80} 
          thickness={3}
          sx={{ 
            color: 'rgba(255, 255, 255, 0.3)',
            position: 'absolute',
          }}
        />
        
        {/* Inner spinning circle */}
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ 
            color: 'white',
          }}
        />
        
        {/* Center icon */}
        <School 
          sx={{ 
            position: 'absolute',
            fontSize: 32,
            color: 'white',
            animation: `${pulse} 2s ease-in-out infinite`,
          }} 
        />
      </Box>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'white',
            fontWeight: 600,
            mb: 1,
          }}
        >
          APTIS Learning Platform
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            letterSpacing: '0.5px',
          }}
        >
          {message}
        </Typography>
      </Box>
      
      {/* Loading dots animation */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'white',
              animation: `${pulse} 1.5s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}