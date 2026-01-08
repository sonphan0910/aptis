'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { Warning, Block } from '@mui/icons-material';

export default function DeleteExamDialog({
  open,
  exam,
  onClose,
  onConfirm,
  loading = false
}) {
  if (!exam) return null;

  // Check if exam has attempts
  const hasAttempts = exam.attempt_count > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Warning color={hasAttempts ? "error" : "warning"} />
          {hasAttempts ? 'Không thể xóa bài thi' : 'Xác nhận xóa bài thi'}
        </Box>
      </DialogTitle>
      <DialogContent>
        {hasAttempts ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Bài thi này không thể xóa được!
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {exam.attempt_count} học sinh đã làm bài thi này. Để bảo toàn dữ liệu, bạn chỉ có thể hủy công khai (unpublish) bài thi.
            </Typography>
          </Alert>
        ) : (
          <DialogContentText>
            Bạn có chắc chắn muốn xóa bài thi này không?
          </DialogContentText>
        )}
        <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="subtitle2" fontWeight="bold">
            {exam.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {exam.description || 'Không có mô tả'}
          </Typography>
          <Typography variant="caption" color="text.secondary" mt={1}>
            Loại: {exam.aptisType?.aptis_type_name || 'N/A'} • 
            Thời gian: {exam.duration_minutes} phút
          </Typography>
          {hasAttempts && (
            <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 1 }}>
              Số học sinh đã làm bài: {exam.attempt_count}
            </Typography>
          )}
        </Box>
        {!hasAttempts && (
          <Box mt={2}>
            <Typography variant="body2" color="error.main">
              ⚠️ Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến bài thi sẽ bị xóa vĩnh viễn.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          disabled={loading}
        >
          {hasAttempts ? 'Đóng' : 'Hủy'}
        </Button>
        {!hasAttempts && (
          <Button 
            onClick={onConfirm}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Đang xóa...' : 'Xóa bài thi'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}