'use client';

import Box from '@mui/material/Box';

/**
 * Page transition wrapper - animations disabled for instant page loads
 */
export default function PageTransition({ children }) {
  return (
    <Box sx={{ 
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%'
    }}>
      {children}
    </Box>
  );
}