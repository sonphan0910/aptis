'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
  School,
  Lock,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { resetPassword } from '@/store/slices/authSlice';
import { ROUTES } from '@/config/app.config';

const validationSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .required('Vui lòng nhập mật khẩu mới'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Xác nhận mật khẩu không khớp')
    .required('Vui lòng xác nhận mật khẩu'),
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  
  const { isLoading, error } = useSelector((state) => state.auth);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      // Redirect to login if no token
      router.push(ROUTES.LOGIN);
    }
  }, [searchParams, router]);

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!token) {
      return;
    }

    try {
      const result = await dispatch(resetPassword({ 
        token, 
        password: values.password 
      }));
      
      if (result.type === 'auth/resetPassword/fulfilled') {
        setSuccess(true);
      }
    } catch (error) {
      console.error('Reset password failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
                Đặt lại mật khẩu
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nhập mật khẩu mới cho tài khoản của bạn
              </Typography>
            </Box>

            {success ? (
              // Success Message
              <Box textAlign="center">
                <Alert severity="success" sx={{ mb: 3 }}>
                  Mật khẩu đã được đặt lại thành công!
                  Bạn có thể đăng nhập với mật khẩu mới.
                </Alert>
                <Button
                  variant="contained"
                  onClick={() => router.push(ROUTES.LOGIN)}
                  sx={{ mt: 2 }}
                >
                  Đăng nhập ngay
                </Button>
              </Box>
            ) : (
              <>
                {/* Error Alert */}
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {/* Reset Password Form */}
                <Formik
                  initialValues={{
                    password: '',
                    confirmPassword: '',
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched, isSubmitting }) => (
                    <Form>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Password Field */}
                        <Field name="password">
                          {({ field }) => (
                            <TextField
                              {...field}
                              label="Mật khẩu mới"
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
                                      onClick={handleTogglePasswordVisibility}
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

                        {/* Confirm Password Field */}
                        <Field name="confirmPassword">
                          {({ field }) => (
                            <TextField
                              {...field}
                              label="Xác nhận mật khẩu mới"
                              type={showConfirmPassword ? 'text' : 'password'}
                              variant="outlined"
                              fullWidth
                              error={touched.confirmPassword && !!errors.confirmPassword}
                              helperText={touched.confirmPassword && errors.confirmPassword}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Lock color="action" />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={handleToggleConfirmPasswordVisibility}
                                      edge="end"
                                    >
                                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        </Field>

                        {/* Submit Button */}
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          size="large"
                          disabled={isLoading || isSubmitting || !token}
                          sx={{
                            py: 1.5,
                            mt: 2,
                            fontSize: '1rem',
                            fontWeight: 600,
                          }}
                        >
                          {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                        </Button>

                        {/* Back to Login */}
                        <Box textAlign="center">
                          <Link
                            href={ROUTES.LOGIN}
                            variant="body2"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            <ArrowBack sx={{ fontSize: 16, mr: 0.5 }} />
                            Quay về đăng nhập
                          </Link>
                        </Box>
                      </Box>
                    </Form>
                  )}
                </Formik>
              </>
            )}

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
      </Box>
    </Container>
  );
}