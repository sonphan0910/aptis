'use client';

import { useState } from 'react';
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
} from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';
import { updateProfile } from '@/store/slices/authSlice';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
    } catch (err) {
      // Error is handled by Redux slice
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account information and preferences.
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
                <Typography variant="h6">Personal Information</Typography>
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
                      Save
                    </Button>
                    <Button
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      variant="outlined"
                      size="small"
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={user?.email || ''}
                    disabled
                    helperText="Email cannot be changed"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Role"
                    value={user?.role || 'Student'}
                    disabled
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
                Profile Picture
              </Typography>
              
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

              <Button variant="outlined" size="small" disabled>
                Change Picture
              </Button>
              
              <Typography variant="caption" display="block" sx={{ mt: 1 }} color="text.secondary">
                Feature coming soon
              </Typography>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Member since
                </Typography>
                <Typography variant="body1">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString()
                    : 'Unknown'
                  }
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Last login
                </Typography>
                <Typography variant="body1">
                  {user?.last_login 
                    ? new Date(user.last_login).toLocaleDateString()
                    : 'Unknown'
                  }
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Account status
                </Typography>
                <Typography variant="body1" color="success.main">
                  Active
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}