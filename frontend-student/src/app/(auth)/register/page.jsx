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
      errors.fullName = 'Họ và tên là bắt buộc';
    } else if (formData.fullName.length < 2) {
      errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Vui lòng nhập email hợp lệ';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[\+]?[\s\-\(\)]*([0-9][\s\-\(\)]*){10,15}$/.test(formData.phone)) {
      errors.phone = 'Vui lòng nhập số điện thoại hợp lệ (VD: +84 901 234 567)';
    }

    if (!formData.password.trim()) {
      errors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu không khớp';
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'Bạn phải đồng ý với điều khoản và điều kiện';
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
    if (passwordStrength < 25) return 'Rất yếu';
    if (passwordStrength < 50) return 'Yếu';
    if (passwordStrength < 75) return 'Trung bình';
    return 'Mạnh';
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
                Tham gia APTIS
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Tạo tài khoản học viên để bắt đầu luyện tập
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
                label="Họ và tên"
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
                label="Địa chỉ Email"
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
                label="Số điện thoại"
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
                label="Mật khẩu"
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
                      Độ mạnh mật khẩu:
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
                label="Xác nhận mật khẩu"
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
                    Tôi đồng ý với{' '}
                    <Link href="/terms" variant="body2" sx={{ textDecoration: 'none' }}>
                      Điều khoản và Điều kiện
                    </Link>{' '}
                    và{' '}
                    <Link href="/privacy" variant="body2" sx={{ textDecoration: 'none' }}>
                      Chính sách Bảo mật
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
                  'Tạo tài khoản'
                )}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Đã có tài khoản?
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                <Link href="/login" variant="body2" sx={{ textDecoration: 'none' }}>
                  Đăng nhập tại đây
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}