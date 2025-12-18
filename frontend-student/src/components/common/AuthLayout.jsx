'use client';

import { Box, Container } from '@mui/material';

export default function AuthLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
      }}
    >
      <Container component="main" maxWidth="sm">
        {children}
      </Container>
    </Box>
  );
}