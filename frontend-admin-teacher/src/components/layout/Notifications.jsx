'use client';

import {
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  IconButton,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import {
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Close as CloseIcon,
  MarkAsUnread as MarkAsUnreadIcon,
} from '@mui/icons-material';

// Mock notifications data - replace with real data from your state/API
const notifications = [
  {
    id: 1,
    type: 'info',
    title: 'Bài thi mới được tạo',
    message: 'Bài thi "Toán học lớp 12" đã được tạo thành công',
    timestamp: '2 phút trước',
    read: false,
  },
  {
    id: 2,
    type: 'warning',
    title: 'Cần chấm bài',
    message: '15 bài thi đang chờ chấm điểm',
    timestamp: '10 phút trước',
    read: false,
  },
  {
    id: 3,
    type: 'success',
    title: 'Xuất báo cáo thành công',
    message: 'Báo cáo thống kê tháng 12 đã được tạo',
    timestamp: '1 giờ trước',
    read: true,
  },
  {
    id: 4,
    type: 'error',
    title: 'Lỗi kết nối',
    message: 'Không thể đồng bộ dữ liệu với server',
    timestamp: '2 giờ trước',
    read: true,
  },
];

const getNotificationIcon = (type) => {
  switch (type) {
    case 'info':
      return <InfoIcon color="info" />;
    case 'warning':
      return <WarningIcon color="warning" />;
    case 'error':
      return <ErrorIcon color="error" />;
    case 'success':
      return <SuccessIcon color="success" />;
    default:
      return <InfoIcon />;
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'info':
      return 'info';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'success':
      return 'success';
    default:
      return 'default';
  }
};

export default function Notifications({ anchorEl, open, onClose }) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    // TODO: Implement mark all as read functionality
    console.log('Mark all as read');
  };

  const handleViewAll = () => {
    // TODO: Navigate to notifications page
    onClose();
    console.log('View all notifications');
  };

  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 400,
          maxHeight: 600,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Thông báo
          {unreadCount > 0 && (
            <Chip
              label={unreadCount}
              size="small"
              color="error"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Actions */}
      {unreadCount > 0 && (
        <Box sx={{ p: 2, pb: 0 }}>
          <Button
            startIcon={<MarkAsUnreadIcon />}
            onClick={handleMarkAllAsRead}
            size="small"
            variant="outlined"
            fullWidth
          >
            Đánh dấu tất cả đã đọc
          </Button>
        </Box>
      )}

      {/* Notifications List */}
      <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
        {notifications.length === 0 ? (
          <ListItem>
            <ListItemText
              primary="Không có thông báo"
              secondary="Bạn đã xem tất cả thông báo"
              sx={{ textAlign: 'center' }}
            />
          </ListItem>
        ) : (
          notifications.map((notification, index) => (
            <Box key={notification.id}>
              <ListItem
                sx={{
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  borderLeft: 3,
                  borderColor: notification.read ? 'transparent' : `${getNotificationColor(notification.type)}.main`,
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: notification.read ? 400 : 600,
                          flex: 1,
                        }}
                      >
                        {notification.title}
                      </Typography>
                      {!notification.read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.timestamp}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </Box>
          ))
        )}
      </List>

      {/* Footer */}
      {notifications.length > 0 && (
        <Box sx={{ p: 2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
          <Button
            onClick={handleViewAll}
            variant="text"
            fullWidth
            size="small"
          >
            Xem tất cả thông báo
          </Button>
        </Box>
      )}
    </Popover>
  );
}