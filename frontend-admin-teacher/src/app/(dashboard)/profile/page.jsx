'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import { Save, Edit, Lock, Person } from '@mui/icons-material';
import { updateProfile, changePassword } from '@/store/slices/authSlice';
import { showNotification } from '@/store/slices/uiSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const profileSchema = Yup.object().shape({
  full_name: Yup.string().required('Họ tên là bắt buộc'),
  email: Yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  phone: Yup.string(),
  bio: Yup.string()
});

const passwordSchema = Yup.object().shape({
  current_password: Yup.string().required('Mật khẩu hiện tại là bắt buộc'),
  new_password: Yup.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự').required('Mật khẩu mới là bắt buộc'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('new_password')], 'Xác nhận mật khẩu không khớp')
    .required('Xác nhận mật khẩu là bắt buộc')
});

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const profileFormik = useFormik({
    initialValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || ''
    },
    validationSchema: profileSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await dispatch(updateProfile(values));
        dispatch(showNotification({
          message: 'Cập nhật thông tin thành công!',
          type: 'success'
        }));
        setEditMode(false);
      } catch (error) {
        dispatch(showNotification({
          message: 'Có lỗi xảy ra khi cập nhật thông tin',
          type: 'error'
        }));
      }
    }
  });

  const passwordFormik = useFormik({
    initialValues: {
      current_password: '',
      new_password: '',
      confirm_password: ''
    },
    validationSchema: passwordSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(changePassword({
          current_password: values.current_password,
          new_password: values.new_password
        }));
        dispatch(showNotification({
          message: 'Đổi mật khẩu thành công!',
          type: 'success'
        }));
        setShowPasswordForm(false);
        passwordFormik.resetForm();
      } catch (error) {
        dispatch(showNotification({
          message: 'Có lỗi xảy ra khi đổi mật khẩu',
          type: 'error'
        }));
      }
    }
  });

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'teacher': return 'Giáo viên';
      case 'student': return 'Học viên';
      default: return role;
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Hồ sơ cá nhân
      </Typography>

      <Grid container spacing={3}>
        {/* Thông tin cơ bản */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  Thông tin cá nhân
                </Typography>
                <Button
                  startIcon={<Edit />}
                  onClick={() => setEditMode(!editMode)}
                  variant={editMode ? "outlined" : "contained"}
                >
                  {editMode ? 'Hủy' : 'Chỉnh sửa'}
                </Button>
              </Box>

              <form onSubmit={profileFormik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      name="full_name"
                      value={profileFormik.values.full_name}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={profileFormik.touched.full_name && !!profileFormik.errors.full_name}
                      helperText={profileFormik.touched.full_name && profileFormik.errors.full_name}
                      disabled={!editMode}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={profileFormik.values.email}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={profileFormik.touched.email && !!profileFormik.errors.email}
                      helperText={profileFormik.touched.email && profileFormik.errors.email}
                      disabled={!editMode}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      name="phone"
                      value={profileFormik.values.phone}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={profileFormik.touched.phone && !!profileFormik.errors.phone}
                      helperText={profileFormik.touched.phone && profileFormik.errors.phone}
                      disabled={!editMode}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Giới thiệu"
                      name="bio"
                      multiline
                      rows={3}
                      value={profileFormik.values.bio}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={profileFormik.touched.bio && !!profileFormik.errors.bio}
                      helperText={profileFormik.touched.bio && profileFormik.errors.bio}
                      disabled={!editMode}
                    />
                  </Grid>

                  {editMode && (
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        disabled={profileFormik.isSubmitting}
                      >
                        Lưu thay đổi
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Avatar và thông tin vai trò */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
              >
                <Person sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                {user?.full_name || 'Chưa có tên'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getRoleLabel(user?.role)}
              </Typography>
            </CardContent>
          </Card>

          {/* Đổi mật khẩu */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Bảo mật
              </Typography>
              
              {!showPasswordForm ? (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setShowPasswordForm(true)}
                >
                  Đổi mật khẩu
                </Button>
              ) : (
                <form onSubmit={passwordFormik.handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Mật khẩu hiện tại"
                        name="current_password"
                        type="password"
                        value={passwordFormik.values.current_password}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        error={passwordFormik.touched.current_password && !!passwordFormik.errors.current_password}
                        helperText={passwordFormik.touched.current_password && passwordFormik.errors.current_password}
                        size="small"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Mật khẩu mới"
                        name="new_password"
                        type="password"
                        value={passwordFormik.values.new_password}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        error={passwordFormik.touched.new_password && !!passwordFormik.errors.new_password}
                        helperText={passwordFormik.touched.new_password && passwordFormik.errors.new_password}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Xác nhận mật khẩu"
                        name="confirm_password"
                        type="password"
                        value={passwordFormik.values.confirm_password}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        error={passwordFormik.touched.confirm_password && !!passwordFormik.errors.confirm_password}
                        helperText={passwordFormik.touched.confirm_password && passwordFormik.errors.confirm_password}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box display="flex" gap={1}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setShowPasswordForm(false);
                            passwordFormik.resetForm();
                          }}
                          size="small"
                        >
                          Hủy
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={passwordFormik.isSubmitting}
                          size="small"
                        >
                          Lưu
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}