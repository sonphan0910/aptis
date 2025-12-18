'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { Provider } from 'react-redux';
import store from '@/store';
import theme from '@/config/theme';
import AlertSnackbar from '@/components/common/AlertSnackbar';
import AuthProvider from '@/components/auth/AuthProvider';
import '@/styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <Provider store={store}>
          <AuthProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '100vh'
                }}
              >
                {children}
                <AlertSnackbar />
              </Box>
            </ThemeProvider>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}