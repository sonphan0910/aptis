'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Avatar
} from '@mui/material';
import {
  Search,
  Visibility,
  Schedule,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { fetchSubmissions } from '@/store/slices/submissionSlice';
import DataTable from '@/components/shared/DataTable';
import SubmissionFilters from '@/components/teacher/submissions/SubmissionFilters';

export default function SubmissionsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { submissions, isLoading, pagination } = useSelector(state => state.submission || {});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    answer_type: '', // 'text' for writing, 'audio' for speaking
    exam_id: '',
    status: '',
    date_range: { start: null, end: null }
  });

  useEffect(() => {
    handleFetchSubmissions();
  }, [searchTerm, filters]);

  const handleFetchSubmissions = (page = 1) => {
    dispatch(fetchSubmissions({
      page,
      limit: 20,
      needs_review: 'true', // Chỉ hiển thị bài cần xem xét
      answer_type: filters.answer_type,
      ...filters
    }));
  };

  const handleReview = (attemptId) => {
    router.push(`/teacher/submissions/${attemptId}`);
  };

  const getStatusChip = (row) => {
    if (row.final_score !== null && !row.needs_review) {
      return <Chip label="Đã xem xét" size="small" color="success" icon={<CheckCircle />} />;
    }
    if (row.score !== null && row.needs_review) {
      return <Chip label="Cần xem xét" size="small" color="warning" icon={<Warning />} />;
    }
    return <Chip label="Chờ xem xét" size="small" color="default" icon={<Schedule />} />;
  };

  const columns = [
    {
      id: 'student',
      label: 'Học viên',
      render: (row) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar 
            src={row.attempt?.student?.avatar_url}
            sx={{ width: 32, height: 32 }}
          >
            {row.attempt?.student?.full_name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {row.attempt?.student?.full_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.attempt?.student?.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'exam',
      label: 'Bài thi',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {row.attempt?.exam?.title}
          </Typography>
          {row.attempt?.exam?.sections && row.attempt.exam.sections[0] && (
            <Typography variant="caption" color="text.secondary">
              {row.attempt.exam.sections[0].skillType?.name}
            </Typography>
          )}
        </Box>
      )
    },
    {
      id: 'skill',
      label: 'Kỹ năng',
      render: (row) => {
        const skill = row.answer_type === 'audio' ? 'Speaking' : 'Writing';
        return (
          <Chip 
            label={skill} 
            size="small" 
            variant="filled"
            color={row.answer_type === 'text' ? 'primary' : 'secondary'}
          />
        );
      }
    },
    {
      id: 'submitted_at',
      label: 'Ngày nộp',
      render: (row) => row.answered_at 
        ? new Date(row.answered_at).toLocaleDateString('vi-VN')
        : '-'
    },
    {
      id: 'ai_score',
      label: 'Điểm AI',
      align: 'center',
      render: (row) => row.score ? `${row.score}` : '-'
    },
    {
      id: 'status',
      label: 'Trạng thái',
      render: (row) => getStatusChip(row)
    },
    {
      id: 'actions',
      label: 'Hành động',
      align: 'center',
      render: (row) => (
        <IconButton
          size="small"
          onClick={() => handleReview(row.attempt_id)}
          color="primary"
        >
          <Visibility />
        </IconButton>
      )
    }
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Xem xét nộp bài (Writing & Speaking)
      </Typography>

      <SubmissionFilters
        filters={filters}
        onFiltersChange={setFilters}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <DataTable
        data={submissions || []}
        columns={columns}
        loading={isLoading}
        pagination={pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }}
        onPageChange={handleFetchSubmissions}
      />
    </Box>
  );
}