'use client';

import { useState } from 'react';
import {
  Switch,
  FormControlLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { Warning, CheckCircle, Block } from '@mui/icons-material';

export default function UserStatusToggle({ 
  user, 
  onStatusChange,
  loading = false,
  showConfirmation = true 
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const handleToggle = (newStatus) => {
    if (showConfirmation) {
      setPendingStatus(newStatus);
      setConfirmOpen(true);
    } else {
      onStatusChange?.(user.id, newStatus);
    }
  };

  const confirmStatusChange = () => {
    onStatusChange?.(user.id, pendingStatus);
    setConfirmOpen(false);
    setPendingStatus(null);
  };

  const cancelStatusChange = () => {
    setConfirmOpen(false);
    setPendingStatus(null);
  };

  return (
    <>
      <Box display="flex" alignItems="center" gap={2}>
        <FormControlLabel
          control={
            <Switch
              checked={user?.is_active || false}
              onChange={(e) => handleToggle(e.target.checked)}
              disabled={loading}
              color="primary"
            />
          }
          label=""
        />
        
        <Chip
          label={user?.is_active ? 'Đang hoạt động' : 'Đã tạm khóa'}
          color={user?.is_active ? 'success' : 'error'}
          icon={user?.is_active ? <CheckCircle /> : <Block />}
          size="small"
        />
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={cancelStatusChange}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Warning color="warning" />
            <Typography variant="h6">
              Xác nhận thay đổi trạng thái
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn {pendingStatus ? 'kích hoạt' : 'tạm khóa'} người dùng này?
          </Alert>
          
          <Typography variant="body1" gutterBottom>
            <strong>Người dùng:</strong> {user?.name} ({user?.email})
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            <strong>Trạng thái hiện tại:</strong> {user?.is_active ? 'Đang hoạt động' : 'Đã tạm khóa'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            <strong>Trạng thái mới:</strong> {pendingStatus ? 'Đang hoạt động' : 'Đã tạm khóa'}
          </Typography>
          
          {!pendingStatus && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Người dùng sẽ không thể đăng nhập sau khi bị tạm khóa.
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={cancelStatusChange}>
            Hủy
          </Button>
          <Button 
            onClick={confirmStatusChange} 
            variant="contained"
            color={pendingStatus ? 'success' : 'error'}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}