'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Visibility,
  Edit,
  Refresh,
  MoreVert,
  Psychology,
  Person,
  CheckCircle,
  Warning,
  Schedule,
  Assignment
} from '@mui/icons-material';

export default function SubmissionList({ 
  submissions = [],
  loading = false,
  onRefresh,
  onViewSubmission,
  onGradeSubmission,
  onRegradeSubmissions
}) {
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [regradeDialogOpen, setRegradeDialogOpen] = useState(false);
  const [regradeType, setRegradeType] = useState('ai');

  const getStatusChip = (submission) => {
    const { grading_status, needs_review, has_ai_feedback } = submission;
    
    switch (grading_status) {
      case 'ungraded':
        return <Chip label="Chưa chấm" color="default" size="small" />;
      case 'ai_graded':
        return (
          <Chip 
            label="AI đã chấm" 
            color="info" 
            size="small"
            icon={<Psychology />}
          />
        );
      case 'manually_graded':
        return (
          <Chip 
            label="Đã chấm" 
            color="success" 
            size="small"
            icon={<Person />}
          />
        );
      case 'auto_graded':
        return <Chip label="Tự động" color="secondary" size="small" />;
      default:
        return <Chip label="Không rõ" color="default" size="small" />;
    }
  };

  const getPriorityIcon = (submission) => {
    if (submission.needs_review) {
      return (
        <Tooltip title="Cần xem xét lại">
          <Warning color="warning" />
        </Tooltip>
      );
    }
    if (submission.can_regrade) {
      return (
        <Tooltip title="Có thể chấm lại">
          <Refresh color="info" />
        </Tooltip>
      );
    }
    return null;
  };

  const handleSelectSubmission = (submissionId) => {
    setSelectedSubmissions(prev => 
      prev.includes(submissionId)
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const handleSelectAll = () => {
    const eligibleSubmissions = submissions
      .filter(s => s.can_regrade)
      .map(s => s.id);
    
    setSelectedSubmissions(
      selectedSubmissions.length === eligibleSubmissions.length 
        ? [] 
        : eligibleSubmissions
    );
  };

  const handleRegradeSubmissions = async () => {
    if (selectedSubmissions.length === 0) return;

    try {
      await onRegradeSubmissions(selectedSubmissions, regradeType);
      setSelectedSubmissions([]);
      setRegradeDialogOpen(false);
    } catch (error) {
      console.error('Error regrading submissions:', error);
    }
  };

  const getScoreDisplay = (submission) => {
    const { final_score, score, max_score } = submission;
    const displayScore = final_score || score || 0;
    const maxScore = max_score || 10;
    
    return (
      <Box>
        <Typography variant="body2" fontWeight="bold">
          {displayScore}/{maxScore}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={(displayScore / maxScore) * 100}
          sx={{ width: 50, height: 4, mt: 0.5 }}
        />
      </Box>
    );
  };

  return (
    <Paper>
      {/* Header with actions */}
      <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">
          Danh sách bài làm ({submissions.length})
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          {selectedSubmissions.length > 0 && (
            <Alert severity="info" sx={{ mr: 2 }}>
              Đã chọn {selectedSubmissions.length} bài làm
            </Alert>
          )}
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onRefresh}
            disabled={loading}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            startIcon={<Psychology />}
            onClick={() => setRegradeDialogOpen(true)}
            disabled={selectedSubmissions.length === 0}
          >
            Chấm lại bằng AI
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={
                    submissions.filter(s => s.can_regrade).length > 0 &&
                    selectedSubmissions.length === submissions.filter(s => s.can_regrade).length
                  }
                  indeterminate={
                    selectedSubmissions.length > 0 && 
                    selectedSubmissions.length < submissions.filter(s => s.can_regrade).length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Học sinh</TableCell>
              <TableCell>Bài thi</TableCell>
              <TableCell>Kỹ năng</TableCell>
              <TableCell>Câu hỏi</TableCell>
              <TableCell>Điểm số</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ưu tiên</TableCell>
              <TableCell>Thời gian</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={10} sx={{ p: 3 }}>
                  <LinearProgress />
                  <Typography align="center" sx={{ mt: 2 }}>
                    Đang tải...
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading && submissions.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    Không có bài làm nào
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading && submissions.map((submission) => (
              <TableRow key={submission.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedSubmissions.includes(submission.id)}
                    onChange={() => handleSelectSubmission(submission.id)}
                    disabled={!submission.can_regrade}
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {submission.attempt?.student?.full_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {submission.attempt?.student?.email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {submission.attempt?.exam?.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={submission.attempt?.selectedSkill?.skill_type_name || 'N/A'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {submission.question?.questionType?.question_type_name}
                    </Typography>
                    <Chip 
                      label={submission.question?.difficulty}
                      size="small"
                      color={
                        submission.question?.difficulty === 'easy' ? 'success' :
                        submission.question?.difficulty === 'medium' ? 'warning' : 'error'
                      }
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  {getScoreDisplay(submission)}
                </TableCell>
                <TableCell>
                  {getStatusChip(submission)}
                </TableCell>
                <TableCell>
                  {getPriorityIcon(submission)}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(submission.answered_at).toLocaleDateString('vi-VN')}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" gap={0.5}>
                    <IconButton 
                      size="small"
                      onClick={() => onViewSubmission(submission)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => onGradeSubmission(submission)}
                      disabled={!submission.can_regrade}
                    >
                      <Edit />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Regrade Dialog */}
      <Dialog 
        open={regradeDialogOpen} 
        onClose={() => setRegradeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chấm lại bằng AI</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Bạn muốn chấm lại {selectedSubmissions.length} bài làm được chọn?
          </Typography>
          
          <Box mt={3}>
            <Typography variant="subtitle2" gutterBottom>
              Loại chấm lại:
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={regradeType === 'ai'}
                  onChange={(e) => setRegradeType(e.target.checked ? 'ai' : 'reset')}
                />
              }
              label="Chỉ chấm lại bằng AI (giữ nguyên kết quả cũ)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={regradeType === 'reset'}
                  onChange={(e) => setRegradeType(e.target.checked ? 'reset' : 'ai')}
                />
              }
              label="Xóa kết quả cũ và chấm lại hoàn toàn"
            />
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            {regradeType === 'ai' 
              ? 'AI sẽ chấm lại và cung cấp feedback mới. Điểm số cũ sẽ được backup.'
              : 'Tất cả kết quả chấm điểm trước đó sẽ bị xóa và AI sẽ chấm lại từ đầu.'
            }
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegradeDialogOpen(false)}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={handleRegradeSubmissions}
            startIcon={<Psychology />}
          >
            Bắt đầu chấm lại
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}