'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress,
} from '@mui/material';
import { School, Email, CheckCircle } from '@mui/icons-material';
import { authService } from '@/services/authService';

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear general error
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.forgotPassword(formData.email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            py: 4,
          }}
        >
          <Card sx={{ width: '100%', boxShadow: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                Check Your Email
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                We&apos;ve sent a password reset link to <strong>{formData.email}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Please check your email and follow the instructions to reset your password. 
                If you don&apos;t see the email, check your spam folder.
              </Typography>
              
              <Button
                variant="outlined"
                onClick={() => router.push('/login')}
                sx={{ mr: 2 }}
              >
                Back to Login
              </Button>
              
              <Button
                variant="contained"
                onClick={() => {
                  setSuccess(false);
                  setFormData({ email: '' });
                }}
              >
                Send Another Email
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Card sx={{ width: '100%', boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <School sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                Forgot Password?
              </Typography>
              <Typography variant="body1" color="text.secondary">
                No worries! Enter your email and we&apos;ll send you reset instructions.
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Forgot Password Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                InputProps={{
                  startAdornment: <Email sx={{ color: 'action.active', mr: 1 }} />,
                }}
                sx={{ mb: 3 }}
                required
                autoComplete="email"
                autoFocus
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ mb: 3, py: 1.5 }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Send Reset Instructions'
                )}
              </Button>
            </Box>

            {/* Back to Login */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Remember your password?{' '}
                <Link href="/login" variant="body2" sx={{ textDecoration: 'none' }}>
                  Back to Sign In
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}