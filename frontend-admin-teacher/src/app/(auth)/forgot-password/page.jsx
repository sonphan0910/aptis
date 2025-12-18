'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Link,
  Divider,
} from '@mui/material';
import {
  Email,
  ArrowBack,
  School,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { forgotPassword } from '@/store/slices/authSlice';
import { ROUTES } from '@/config/app.config';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await dispatch(forgotPassword(values.email));
      if (result.type === 'auth/forgotPassword/fulfilled') {
        setSuccess(true);
      }
    } catch (error) {
      console.error('Forgot password failed:', error);
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
                Quên mật khẩu
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nhập email để nhận liên kết đặt lại mật khẩu
              </Typography>
            </Box>

            {success ? (
              // Success Message
              <Box textAlign="center">
                <Alert severity="success" sx={{ mb: 3 }}>
                  Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.
                  Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam).
                </Alert>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => router.push(ROUTES.LOGIN)}
                  sx={{ mt: 2 }}
                >
                  Quay về đăng nhập
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

                {/* Forgot Password Form */}
                <Formik
                  initialValues={{
                    email: '',
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
                                    <Email color="action" />
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
                          disabled={isLoading || isSubmitting}
                          sx={{
                            py: 1.5,
                            mt: 2,
                            fontSize: '1rem',
                            fontWeight: 600,
                          }}
                        >
                          {isLoading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
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