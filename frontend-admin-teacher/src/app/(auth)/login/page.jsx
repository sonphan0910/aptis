'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  School,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { login } from '@/store/slices/authSlice';
import { ROUTES } from '@/config/app.config';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  password: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Vui lòng nhập mật khẩu'),
});

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await dispatch(login(values));
      if (result.type === 'auth/login/fulfilled') {
        router.push(ROUTES.DASHBOARD);
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setSubmitting(false);
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
          py: 4,
        }}
      >
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <School sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
                <Typography variant="h4" component="h1" fontWeight="bold">
                  APTIS
                </Typography>
              </Box>
              <Typography variant="h5" component="h2" gutterBottom>
                Đăng nhập
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hệ thống quản lý giáo viên & quản trị
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Formik
              initialValues={{
                email: '',
                password: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Email Field */}
                    <Field name="email">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Email"
                          type="email"
                          variant="outlined"
                          fullWidth
                          error={touched.email && !!errors.email}
                          helperText={touched.email && errors.email}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    </Field>

                    {/* Password Field */}
                    <Field name="password">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Mật khẩu"
                          type={showPassword ? 'text' : 'password'}
                          variant="outlined"
                          fullWidth
                          error={touched.password && !!errors.password}
                          helperText={touched.password && errors.password}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    </Field>

                    {/* Login Button */}
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={isLoading || isSubmitting}
                      sx={{
                        py: 1.5,
                        mt: 2,
                        fontSize: '1rem',
                        fontWeight: 600,
                      }}
                    >
                      {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>

                    {/* Forgot Password Link */}
                    <Box textAlign="center">
                      <Link
                        href={ROUTES.FORGOT_PASSWORD}
                        variant="body2"
                        sx={{
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        Quên mật khẩu?
                      </Link>
                    </Box>
                  </Box>
                </Form>
              )}
            </Formik>

            {/* Footer */}
            <Divider sx={{ my: 3 }} />
            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
              display="block"
            >
              © 2024 APTIS Exam System. All rights reserved.
            </Typography>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card sx={{ mt: 3, backgroundColor: '#f5f5f5' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Tài khoản demo:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                <strong>Admin:</strong> admin@aptis.local / password123
              </Typography>
              <Typography variant="body2">
                <strong>Teacher:</strong> teacher1@aptis.local / password123
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}