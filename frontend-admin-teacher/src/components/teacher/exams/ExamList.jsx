'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  Publish,
  UnpublishedOutlined
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { fetchExams, deleteExam, publishExam, unpublishExam } from '@/store/slices/examSlice';
import { 
  DEFAULT_FILTER_OPTIONS,
  DEFAULT_APTIS_TYPES,
  DEFAULT_SKILLS
} from '@/constants/filterOptions';
import DataTable from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function ExamList({
  showActions = true,
  showFilters = true,
  onExamSelect
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { exams, isLoading: loading, pagination } = useSelector(state => state.exams);
  const [isClient, setIsClient] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    aptis_type: '',
    skill: '',
    status: ''
  });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [publishingExam, setPublishingExam] = useState(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      handleFetchExams();
    }
  }, [isClient, searchTerm, filters]);

  const handleFetchExams = (page = 1) => {
    const filterParams = {};
    if (filters.aptis_type) filterParams.aptis_type = filters.aptis_type;
    if (filters.skill) filterParams.skill = filters.skill;
    if (filters.status) filterParams.status = filters.status;
    
    dispatch(fetchExams({
      page,
      search: searchTerm,
      ...filterParams
    }));
  };

  const handleEdit = (examId) => {
    if (onExamSelect) {
      onExamSelect(examId);
    } else {
      router.push(`/teacher/exams/${examId}`);
    }
  };

  const handlePreview = (examId) => {
    window.open(`/exam-preview/${examId}`, '_blank');
  };

  const handlePublish = async (exam) => {
    setPublishingExam(exam);
    try {
      if (exam.is_published) {
        await dispatch(unpublishExam(exam.id));
      } else {
        await dispatch(publishExam(exam.id));
      }
      handleFetchExams();
    } finally {
      setPublishingExam(null);
    }
  };

  const handleDelete = (exam) => {
    setConfirmDelete(exam);
  };

  const confirmDeleteExam = async () => {
    if (confirmDelete) {
      await dispatch(deleteExam(confirmDelete.id));
      setConfirmDelete(null);
      handleFetchExams();
    }
  };

  const columns = [
    {
      id: 'title',
      label: 'Tên bài thi',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {row.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.description || 'Không có mô tả'}
          </Typography>
        </Box>
      )
    },
    {
      id: 'aptis_type',
      label: 'Loại APTIS',
      render: (row) => (
        <Chip 
          label={row.aptis_type || 'Unknown'} 
          size="small" 
          variant="outlined"
          color="primary"
        />
      )
    },
    {
      id: 'duration_minutes',
      label: 'Thời lượng',
      render: (row) => `${row.duration_minutes || 0} phút`
    },
    {
      id: 'total_questions',
      label: 'Số câu',
      align: 'center'
    },
    {
      id: 'total_sections',
      label: 'Số phần',
      align: 'center'
    },
    {
      id: 'is_published',
      label: 'Trạng thái',
      render: (row) => (
        <Chip 
          label={row.is_published ? 'Đã công khai' : 'Bản nháp'} 
          size="small"
          color={row.is_published ? 'success' : 'default'}
          variant={row.is_published ? 'filled' : 'outlined'}
        />
      )
    },
    {
      id: 'actions',
      label: 'Hành động',
      align: 'center',
      render: (row) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handlePreview(row.id)}
            color="info"
          >
            <Visibility />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleEdit(row.id)}
            color="primary"
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handlePublish(row)}
            color={row.is_published ? "warning" : "success"}
            disabled={publishingExam?.id === row.id}
          >
            {row.is_published ? <UnpublishedOutlined /> : <Publish />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(row)}
            color="error"
            disabled={row.is_published}
          >
            <Delete />
          </IconButton>
        </Box>
      )
    }
  ];

  // Don't render until client-side to prevent hydration mismatch
  if (!isClient) {
    return (
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '300px' 
      }}>
        <Typography variant="h6" color="text.secondary">
          Đang tải danh sách bài thi...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Search and Filter */}
      {showFilters && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <TextField
                placeholder="Tìm kiếm bài thi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ minWidth: 250 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Loại APTIS</InputLabel>
                <Select
                  value={filters.aptis_type}
                  label="Loại APTIS"
                  onChange={(e) => setFilters(prev => ({ ...prev, aptis_type: e.target.value }))}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {DEFAULT_FILTER_OPTIONS.aptisTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Kỹ năng</InputLabel>
                <Select
                  value={filters.skill}
                  label="Kỹ năng"
                  onChange={(e) => setFilters(prev => ({ ...prev, skill: e.target.value }))}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {DEFAULT_FILTER_OPTIONS.skills.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filters.status}
                  label="Trạng thái"
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="published">Đã công khai</MenuItem>
                  <MenuItem value="draft">Bản nháp</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
      )}

      <DataTable
        data={exams || []}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handleFetchExams}
        emptyMessage="Không tìm thấy bài thi nào"
      />

      {isClient && (
        <ConfirmDialog
          open={!!confirmDelete}
          title="Xóa bài thi"
          content={`Bạn có chắc muốn xóa bài thi "${confirmDelete?.title}"? Hành động này không thể hoàn tác.`}
          onConfirm={confirmDeleteExam}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </Box>
  );
}
