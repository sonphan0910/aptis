'use client';

import { Container, Box } from '@mui/material';

/**
 * Container wrapper for page content
 * Ensures content always fills available space (min-height 100%)
 * so footer gets pushed to the bottom
 */
export default function PageContainer({ 
  children, 
  maxWidth = 'lg',
  sx = {}
}) {
  return (
    <Container 
      maxWidth={maxWidth}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        minHeight: '100%',
        py: { xs: 2, sm: 3, md: 4 },
        ...sx
      }}
    >
      {children}
    </Container>
  );
}