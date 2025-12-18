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
  const { submissions, isLoading: loading, pagination } = useSelector(state => state.submissions);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skill: '',
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
      search: searchTerm,
      needs_review: true, // Chỉ hiển thị bài cần xem xét
      ...filters
    }));
  };

  const handleReview = (attemptId) => {
    router.push(`/teacher/submissions/${attemptId}`);
  };

  const getStatusChip = (status, aiScore, finalScore) => {
    if (status === 'completed' && finalScore !== null) {
      return <Chip label="Đã xem xét" size="small" color="success" icon={<CheckCircle />} />;
    }
    if (status === 'graded' && aiScore !== null) {
      return <Chip label="Ghi đè điểm" size="small" color="warning" icon={<Warning />} />;
    }
    return <Chip label="Chờ xem xét" size="small" color="default" icon={<Schedule />} />;
  };

  const columns = [
    {
      id: 'student',
      label: 'Học viên',
      render: (row) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {row.student_name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {row.student_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.student_email}
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
            {row.exam_title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Phần: {row.section_title}
          </Typography>
        </Box>
      )
    },
    {
      id: 'skill',
      label: 'Kỹ năng',
      render: (row) => (
        <Chip 
          label={row.skill} 
          size="small" 
          variant="filled"
          color={row.skill === 'writing' ? 'primary' : 'secondary'}
        />
      )
    },
    {
      id: 'submitted_at',
      label: 'Ngày nộp',
      render: (row) => new Date(row.submitted_at).toLocaleDateString('vi-VN')
    },
    {
      id: 'ai_score',
      label: 'Điểm AI',
      align: 'center',
      render: (row) => row.ai_score ? `${row.ai_score}/${row.max_score}` : '-'
    },
    {
      id: 'status',
      label: 'Trạng thái',
      render: (row) => getStatusChip(row.status, row.ai_score, row.final_score)
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
        data={submissions}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handleFetchSubmissions}
      />
    </Box>
  );
}