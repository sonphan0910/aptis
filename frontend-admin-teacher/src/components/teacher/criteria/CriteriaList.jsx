'use client';

import { useEffect, useState } from 'react';
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
  Chip
} from '@mui/material';
import {
  Search,
  Edit,
  Delete,
  Visibility
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { fetchCriteria, deleteCriteria } from '@/store/slices/criteriaSlice';
import DataTable from '@/components/shared/DataTable';
import CriteriaPreview from './CriteriaPreview';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { DEFAULT_APTIS_TYPES, DEFAULT_QUESTION_TYPES } from '@/constants/filterOptions';

export default function CriteriaList() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { criteria, loading, pagination } = useSelector(state => state.criteria);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    aptis_type: '',
    question_type: ''
  });
  const [selectedCriteria, setSelectedCriteria] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Track if component is mounted (for hydration safety)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      handleFetchCriteria(1);
    }
  }, [searchTerm, filters, isMounted]);

  const handleFetchCriteria = (page = 1) => {
    dispatch(fetchCriteria({
      page,
      limit: 10,
      search: searchTerm,
      aptis_type: filters.aptis_type || undefined,
      question_type: filters.question_type || undefined
    }));
  };

  const handlePreview = (criteria) => {
    setSelectedCriteria(criteria);
    setPreviewOpen(true);
  };

  const handleEdit = (criteriaId) => {
    router.push(`/teacher/criteria/${criteriaId}/edit`);
  };

  const handleDelete = (criteria) => {
    setConfirmDelete(criteria);
  };

  const confirmDeleteCriteria = async () => {
    if (confirmDelete) {
      await dispatch(deleteCriteria(confirmDelete.id));
      setConfirmDelete(null);
      handleFetchCriteria();
    }
  };

  if (!isMounted) {
    return null;
  }

  const columns = [
    {
      id: 'criteria_name',
      label: 'Tên tiêu chí',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {row.criteria_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.rubric_prompt?.substring(0, 50)}...
          </Typography>
        </Box>
      )
    },
    {
      id: 'questionType',
      label: 'Loại câu hỏi',
      render: (row) => {
        const questionType = row.questionType || {};
        return (
          <Chip 
            label={questionType.question_type_name || 'N/A'} 
            size="small" 
            variant="outlined"
            color="primary"
          />
        );
      }
    },
    {
      id: 'aptisType',
      label: 'Loại APTIS',
      render: (row) => {
        const aptisType = row.aptisType || {};
        return (
          <Chip 
            label={aptisType.aptis_type_name || 'N/A'} 
            size="small" 
            variant="filled"
            color="secondary"
          />
        );
      }
    },
    {
      id: 'weight',
      label: 'Trọng số',
      align: 'center',
      render: (row) => row.weight || '-'
    },
    {
      id: 'max_score',
      label: 'Điểm tối đa',
      align: 'center',
      render: (row) => row.max_score || '-'
    },
    {
      id: 'created_at',
      label: 'Ngày tạo',
      render: (row) => new Date(row.created_at).toLocaleDateString('vi-VN')
    },
    {
      id: 'actions',
      label: 'Hành động',
      align: 'center',
      render: (row) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handlePreview(row)}
            color="info"
            title="Xem chi tiết"
          >
            <Visibility />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleEdit(row.id)}
            color="primary"
            title="Chỉnh sửa"
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(row)}
            color="error"
            title="Xóa"
          >
            <Delete />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <TextField
              placeholder="Tìm kiếm tiêu chí..."
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

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Loại câu hỏi</InputLabel>
              <Select
                value={filters.question_type}
                label="Loại câu hỏi"
                onChange={(e) => setFilters(prev => ({ ...prev, question_type: e.target.value }))}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {DEFAULT_QUESTION_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Loại APTIS</InputLabel>
              <Select
                value={filters.aptis_type}
                label="Loại APTIS"
                onChange={(e) => setFilters(prev => ({ ...prev, aptis_type: e.target.value }))}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {DEFAULT_APTIS_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <DataTable
        data={criteria}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handleFetchCriteria}
      />

      {previewOpen && selectedCriteria && (
        <CriteriaPreview
          criteria={selectedCriteria}
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          onEdit={() => handleEdit(selectedCriteria.id)}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Xóa tiêu chí"
        content={`Bạn có chắc muốn xóa tiêu chí "${confirmDelete?.criteria_name}"?`}
        onConfirm={confirmDeleteCriteria}
        onCancel={() => setConfirmDelete(null)}
      />
    </Box>
  );
}
