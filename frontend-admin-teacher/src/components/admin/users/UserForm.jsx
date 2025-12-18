'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Alert
} from '@mui/material';
import { Close, PersonAdd, Edit } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  name: yup
    .string()
    .required('Tên không được để trống')
    .min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email không được để trống'),
  password: yup
    .string()
    .when('isEdit', {
      is: false,
      then: yup.string().required('Mật khẩu không được để trống').min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
      otherwise: yup.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    }),
  role: yup
    .string()
    .required('Vai trò không được để trống'),
  phone: yup
    .string()
    .matches(/^[0-9+\-\s()]*$/, 'Số điện thoại không hợp lệ'),
});

const roles = [
  { value: 'admin', label: 'Quản trị viên', color: 'error' },
  { value: 'teacher', label: 'Giáo viên', color: 'primary' },
  { value: 'examiner', label: 'Giám khảo', color: 'secondary' }
];

export default function UserForm({ 
  open, 
  onClose, 
  onSubmit,
  user = null,
  loading = false 
}) {
  const isEdit = !!user;

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      confirmPassword: '',
      role: user?.role || '',
      phone: user?.phone || '',
      department: user?.department || '',
      bio: user?.bio || '',
      is_active: user?.is_active ?? true,
      isEdit
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const submitData = { ...values };
      delete submitData.confirmPassword;
      delete submitData.isEdit;
      
      // Don't send empty password for edit mode
      if (isEdit && !values.password) {
        delete submitData.password;
      }
      
      onSubmit(submitData);
    },
  });

  const [passwordMismatch, setPasswordMismatch] = useState(false);

  useEffect(() => {
    if (formik.values.password && formik.values.confirmPassword) {
      setPasswordMismatch(formik.values.password !== formik.values.confirmPassword);
    } else {
      setPasswordMismatch(false);
    }
  }, [formik.values.password, formik.values.confirmPassword]);

  const handleClose = () => {
    formik.resetForm();
    setPasswordMismatch(false);
    onClose();
  };

  const selectedRole = roles.find(r => r.value === formik.values.role);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { minHeight: '400px' } }}
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              {isEdit ? <Edit color="primary" /> : <PersonAdd color="primary" />}
              <Typography variant="h5">
                {isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Basic Information */}
            <Typography variant="h6" color="primary">
              Thông tin cơ bản
            </Typography>

            <TextField
              fullWidth
              name="name"
              label="Họ và tên"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              required
            />

            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              required
            />

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                name="password"
                label={isEdit ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                required={!isEdit}
              />

              {formik.values.password && (
                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  type="password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  error={passwordMismatch}
                  helperText={passwordMismatch ? "Mật khẩu không khớp" : ""}
                  required
                />
              )}
            </Box>

            {passwordMismatch && (
              <Alert severity="error">
                Mật khẩu xác nhận không khớp với mật khẩu đã nhập
              </Alert>
            )}

            {/* Role and Status */}
            <Box display="flex" gap={2} alignItems="center">
              <FormControl fullWidth required>
                <InputLabel>Vai trò</InputLabel>
                <Select
                  name="role"
                  value={formik.values.role}
                  label="Vai trò"
                  onChange={formik.handleChange}
                  error={formik.touched.role && Boolean(formik.errors.role)}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={role.label}
                          color={role.color}
                          size="small"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.is_active}
                    onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
                    color="primary"
                  />
                }
                label="Kích hoạt"
              />
            </Box>

            {/* Additional Information */}
            <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
              Thông tin bổ sung
            </Typography>

            <TextField
              fullWidth
              name="phone"
              label="Số điện thoại"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
            />

            <TextField
              fullWidth
              name="department"
              label="Bộ phận/Khoa"
              value={formik.values.department}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            <TextField
              fullWidth
              name="bio"
              label="Tiểu sử/Ghi chú"
              multiline
              rows={3}
              value={formik.values.bio}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Thông tin bổ sung về người dùng..."
            />

            {/* Preview selected role */}
            {selectedRole && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Vai trò được chọn:
                </Typography>
                <Chip 
                  label={selectedRole.label}
                  color={selectedRole.color}
                  variant="outlined"
                />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || passwordMismatch || !formik.isValid}
          >
            {loading ? 'Đang xử lý...' : (isEdit ? 'Cập nhật' : 'Thêm mới')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}