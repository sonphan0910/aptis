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
  Button
} from '@mui/material';
import {
  Search,
  Visibility,
  GetApp,
  Assessment,
  TrendingUp,
  People
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { fetchReports, exportReport } from '@/store/slices/reportSlice';
import DataTable from '@/components/shared/DataTable';
import ReportExport from '@/components/teacher/reports/ReportExport';

export default function ReportsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { reports, isLoading: loading, pagination } = useSelector(state => state.reports);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    exam_id: '',
    student_id: ''
  });
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    handleFetchReports();
  }, [searchTerm, filters]);

  const handleFetchReports = (page = 1) => {
    dispatch(fetchReports({
      page,
      search: searchTerm,
      ...filters
    }));
  };

  const handleView = (reportId) => {
    router.push(`/teacher/reports/${reportId}`);
  };

  const handleDownload = async (report) => {
    await dispatch(exportReport({
      id: report.id,
      format: 'pdf'
    }));
  };

  const getReportIcon = (type) => {
    switch (type) {
      case 'student_progress': return <People />;
      case 'exam_statistics': return <Assessment />;
      case 'performance_trend': return <TrendingUp />;
      default: return <Assessment />;
    }
  };

  const getReportTypeLabel = (type) => {
    switch (type) {
      case 'student_progress': return 'Báo cáo học viên';
      case 'exam_statistics': return 'Thống kê bài thi';
      case 'performance_trend': return 'Xu hướng kết quả';
      default: return type;
    }
  };

  const columns = [
    {
      id: 'title',
      label: 'Tên báo cáo',
      render: (row) => (
        <Box display="flex" alignItems="center" gap={1}>
          {getReportIcon(row.type)}
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {row.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.description}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'type',
      label: 'Loại báo cáo',
      render: (row) => (
        <Chip 
          label={getReportTypeLabel(row.type)} 
          size="small" 
          variant="outlined"
          color="primary"
        />
      )
    },
    {
      id: 'subject',
      label: 'Đối tượng',
      render: (row) => (
        <Typography variant="body2">
          {row.student_name || row.exam_title || 'Tổng hợp'}
        </Typography>
      )
    },
    {
      id: 'generated_at',
      label: 'Ngày tạo',
      render: (row) => new Date(row.generated_at).toLocaleDateString('vi-VN')
    },
    {
      id: 'data_period',
      label: 'Khoảng thời gian',
      render: (row) => {
        if (row.start_date && row.end_date) {
          return `${new Date(row.start_date).toLocaleDateString('vi-VN')} - ${new Date(row.end_date).toLocaleDateString('vi-VN')}`;
        }
        return 'Toàn bộ';
      }
    },
    {
      id: 'actions',
      label: 'Hành động',
      align: 'center',
      render: (row) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleView(row.id)}
            color="primary"
          >
            <Visibility />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDownload(row)}
            color="success"
          >
            <GetApp />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Báo cáo & Thống kê
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setExportOpen(true)}
          startIcon={<GetApp />}
        >
          Xuất báo cáo
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <TextField
              placeholder="Tìm kiếm báo cáo..."
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
              <InputLabel>Loại báo cáo</InputLabel>
              <Select
                value={filters.type}
                label="Loại báo cáo"
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="student_progress">Báo cáo học viên</MenuItem>
                <MenuItem value="exam_statistics">Thống kê bài thi</MenuItem>
                <MenuItem value="performance_trend">Xu hướng kết quả</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <DataTable
        data={reports}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handleFetchReports}
      />

      <ReportExport
        open={exportOpen}
        onClose={() => setExportOpen(false)}
      />
    </Box>
  );
}