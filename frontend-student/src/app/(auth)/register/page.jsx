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
  FormControlLabel,
  Checkbox,
  Divider,
  CircularProgress,
  LinearProgress,
  Chip,
} from '@mui/material';
import { School, Email, Lock, Person, Phone } from '@mui/icons-material';
import { registerUser } from '@/store/slices/authSlice';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Calculate password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,15}$/.test(formData.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions';
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
      await dispatch(registerUser({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })).unwrap();

      // Redirect will happen via useEffect when isAuthenticated changes
    } catch (err) {
      // Error is handled by Redux slice
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return 'error';
    if (passwordStrength < 75) return 'warning';
    return 'success';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Very Weak';
    if (passwordStrength < 50) return 'Weak';
    if (passwordStrength < 75) return 'Medium';
    return 'Strong';
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
                Join APTIS
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your student account to start practicing
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Registration Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                id="fullName"
                name="fullName"
                label="Full Name"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                error={!!validationErrors.fullName}
                helperText={validationErrors.fullName}
                InputProps={{
                  startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} />,
                }}
                sx={{ mb: 2 }}
                required
                autoComplete="name"
                autoFocus
              />

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
                required
                autoComplete="email"
              />

              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={!!validationErrors.phone}
                helperText={validationErrors.phone}
                InputProps={{
                  startAdornment: <Phone sx={{ color: 'action.active', mr: 1 }} />,
                }}
                sx={{ mb: 2 }}
                required
                autoComplete="tel"
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
                sx={{ mb: 1 }}
                required
                autoComplete="new-password"
              />

              {/* Password Strength Indicator */}
              {formData.password && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Password Strength:
                    </Typography>
                    <Chip
                      label={getPasswordStrengthText()}
                      size="small"
                      color={getPasswordStrengthColor()}
                      variant="outlined"
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength}
                    color={getPasswordStrengthColor()}
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                </Box>
              )}

              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!validationErrors.confirmPassword}
                helperText={validationErrors.confirmPassword}
                InputProps={{
                  startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} />,
                }}
                sx={{ mb: 2 }}
                required
                autoComplete="new-password"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link href="/terms" variant="body2" sx={{ textDecoration: 'none' }}>
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" variant="body2" sx={{ textDecoration: 'none' }}>
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{ mb: 2 }}
              />

              {validationErrors.agreeToTerms && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mb: 2 }}>
                  {validationErrors.agreeToTerms}
                </Typography>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ mb: 2, py: 1.5 }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create Account'
                )}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                <Link href="/login" variant="body2" sx={{ textDecoration: 'none' }}>
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}