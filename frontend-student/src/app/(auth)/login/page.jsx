'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
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
  Divider,
  CircularProgress,
} from '@mui/material';
import { School, Email, Lock } from '@mui/icons-material';
import { loginUser } from '@/store/slices/authSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Redirect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[LoginPage] User authenticated, redirecting to /home');
      router.replace('/home');
    }
  }, [isAuthenticated, router]);

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
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      console.log('[LoginPage] Submitting login form:', { email: formData.email });

      const result = await dispatch(loginUser({
        email: formData.email,
        password: formData.password,
      })).unwrap();

      console.log('[LoginPage] Login successful');
      // Redirect will happen via useEffect when isAuthenticated changes
    } catch (err) {
      console.error('[LoginPage] Login failed:', err);
      // Error is handled by Redux slice and displayed in Alert
    }
  };

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
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to your APTIS student account
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
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
                sx={{ mb: 2 }}
                disabled={isLoading}
                required
                autoComplete="email"
                autoFocus
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                InputProps={{
                  startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} />,
                }}
                sx={{ mb: 3 }}
                disabled={isLoading}
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ mb: 2, py: 1.5 }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  href="/forgot-password"
                  variant="body2"
                  sx={{ textDecoration: 'none' }}
                >
                  Forgot your password?
                </Link>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don&apos;t have an account?{' '}
                <Link href="/register" variant="body2" sx={{ textDecoration: 'none', fontWeight: 500 }}>
                  Create one here
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}