'use client';

import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Alert,
  Divider,
  IconButton,
  Input,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Person,
  Email,
  Phone,
  CalendarToday,
} from '@mui/icons-material';
import { updateProfile } from '@/store/slices/authSlice';
import { showSnackbar } from '@/store/slices/uiSlice';
import userService from '@/services/userService';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return true; // Optional field
    // Allow formats like: +84 901 234 567, 0901234567, +84901234567
    const phoneRegex = /^[\+]?[\s\-\(\)]*([0-9][\s\-\(\)]*){10,15}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.full_name.trim()) {
      errors.full_name = 'Họ và tên là bắt buộc';
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ. Ví dụ: +84 901 234 567';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      dispatch(showSnackbar({ message: 'Vui lòng chọn file hình ảnh', severity: 'error' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      dispatch(showSnackbar({ message: 'Kích thước file quá lớn (tối đa 5MB)', severity: 'error' }));
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);
      
      await userService.uploadAvatar(formData);
      dispatch(showSnackbar({ message: 'Đã cập nhật ảnh đại diện thành công', severity: 'success' }));
      
      // Reload user data
      window.location.reload();
    } catch (error) {
      dispatch(showSnackbar({
        message: error.response?.data?.message || 'Có lỗi xảy ra khi tải lên ảnh',
        severity: 'error'
      }));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
      dispatch(showSnackbar({ message: 'Đã cập nhật thông tin thành công', severity: 'success' }));
    } catch (err) {
      // Error is handled by Redux slice
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
    });
    setValidationErrors({});
    setIsEditing(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Cài đặt Hồ sơ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý thông tin tài khoản và tùy chọn của bạn.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Thông tin cá nhân</Typography>
                {!isEditing ? (
                  <IconButton onClick={() => setIsEditing(true)}>
                    <Edit />
                  </IconButton>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      startIcon={<Save />}
                      onClick={handleSave}
                      disabled={isLoading}
                      size="small"
                    >
                      Lưu
                    </Button>
                    <Button
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      variant="outlined"
                      size="small"
                    >
                      Hủy
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    error={!!validationErrors.full_name}
                    helperText={validationErrors.full_name}
                    InputProps={{
                      startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={user?.email || ''}
                    disabled
                    helperText="Email không thể thay đổi"
                    InputProps={{
                      startAdornment: <Email sx={{ color: 'action.active', mr: 1 }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    error={!!validationErrors.phone}
                    helperText={validationErrors.phone || 'Ví dụ: +84 901 234 567 hoặc 0901234567'}
                    placeholder="+84 901 234 567"
                    InputProps={{
                      startAdornment: <Phone sx={{ color: 'action.active', mr: 1 }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Vai trò"
                    value={user?.role === 'student' ? 'Học viên' : user?.role === 'teacher' ? 'Giáo viên' : user?.role || 'Học viên'}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <Chip
                          label={user?.role === 'student' ? 'Student' : user?.role === 'teacher' ? 'Teacher' : 'Unknown'}
                          color={user?.role === 'teacher' ? 'primary' : 'default'}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Picture */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Ảnh đại diện
              </Typography>
              
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: 48,
                  }}
                  src={user?.avatar_url}
                >
                  {user?.full_name?.charAt(0)?.toUpperCase()}
                </Avatar>
                
                {isUploadingAvatar && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 120,
                      height: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.5)',
                      borderRadius: '50%',
                    }}
                  >
                    <CircularProgress color="primary" />
                  </Box>
                )}
              </Box>

              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                sx={{ display: 'none' }}
              />
              

              
              <Typography variant="caption" display="block" sx={{ mt: 1 }} color="text.secondary">
                Chấp nhận JPG, PNG, GIF (tối đa 5MB)
              </Typography>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin Tài khoản
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarToday sx={{ fontSize: 16 }} />
                  Thành viên từ
                </Typography>
                <Typography variant="body1">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Không rõ'
                  }
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarToday sx={{ fontSize: 16 }} />
                  Lần đăng nhập cuối
                </Typography>
                <Typography variant="body1">
                  {user?.last_login 
                    ? new Date(user.last_login).toLocaleString('vi-VN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Không rõ'
                  }
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Trạng thái tài khoản
                </Typography>
                <Chip 
                  label={user?.status === 'active' ? 'Hoạt động' : user?.status || 'Không rõ'}
                  color={user?.status === 'active' ? 'success' : 'default'}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}