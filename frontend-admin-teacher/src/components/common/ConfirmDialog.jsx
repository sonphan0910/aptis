'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button
} from '@mui/material';

export default function ConfirmDialog({
  open,
  title,
  content,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmColor = 'error',
  onConfirm,
  onCancel
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color={confirmColor} autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}