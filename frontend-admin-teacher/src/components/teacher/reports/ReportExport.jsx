'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  GetApp,
  Close,
  FileDownload,
  TableChart,
  PictureAsPdf,
  Description,
  Analytics,
  TrendingUp,
  People,
  School
} from '@mui/icons-material';

const exportFormats = [
  {
    id: 'pdf',
    name: 'PDF Report',
    icon: PictureAsPdf,
    description: 'Comprehensive PDF report with charts and detailed analysis',
    color: 'error'
  },
  {
    id: 'excel',
    name: 'Excel Spreadsheet',
    icon: TableChart,
    description: 'Raw data in Excel format for further analysis',
    color: 'success'
  },
  {
    id: 'csv',
    name: 'CSV Data',
    icon: Description,
    description: 'Comma-separated values for data processing',
    color: 'info'
  }
];

const reportTypes = [
  {
    id: 'student_performance',
    name: 'Student Performance Report',
    icon: Analytics,
    description: 'Individual student progress and scores analysis'
  },
  {
    id: 'exam_statistics',
    name: 'Exam Statistics Report',
    icon: TrendingUp,
    description: 'Overall exam performance and difficulty analysis'
  },
  {
    id: 'class_overview',
    name: 'Class Overview Report',
    icon: People,
    description: 'Class-wide performance summary and comparison'
  },
  {
    id: 'skill_breakdown',
    name: 'Skills Breakdown Report',
    icon: School,
    description: 'Performance breakdown by language skills'
  }
];

export default function ReportExport({ 
  open, 
  onClose, 
  onExport,
  availableExams = [],
  availableStudents = [],
  loading = false 
}) {
  const [exportConfig, setExportConfig] = useState({
    type: '',
    format: 'pdf',
    dateRange: { start: null, end: null },
    filters: {
      exam_id: '',
      student_id: '',
      skill: ''
    },
    includeCharts: true,
    includeDetails: true
  });

  const handleConfigChange = (field, value) => {
    setExportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterChange = (field, value) => {
    setExportConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [field]: value
      }
    }));
  };

  const handleExport = () => {
    if (!exportConfig.type || !exportConfig.format) return;
    onExport(exportConfig);
  };

  const selectedType = reportTypes.find(type => type.id === exportConfig.type);
  const selectedFormat = exportFormats.find(format => format.id === exportConfig.format);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: '500px' } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <GetApp color="primary" />
            <Typography variant="h5">
              Xuất báo cáo
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            1. Chọn loại báo cáo
          </Typography>
          <List>
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <ListItem
                  key={type.id}
                  button
                  selected={exportConfig.type === type.id}
                  onClick={() => handleConfigChange('type', type.id)}
                  sx={{ 
                    borderRadius: 1,
                    mb: 1,
                    border: exportConfig.type === type.id ? 2 : 1,
                    borderColor: exportConfig.type === type.id ? 'primary.main' : 'divider'
                  }}
                >
                  <ListItemIcon>
                    <Icon color={exportConfig.type === type.id ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={type.name}
                    secondary={type.description}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            2. Chọn định dạng xuất
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            {exportFormats.map((format) => {
              const Icon = format.icon;
              return (
                <Paper
                  key={format.id}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: exportConfig.format === format.id ? 2 : 1,
                    borderColor: exportConfig.format === format.id ? 'primary.main' : 'divider',
                    minWidth: 200,
                    textAlign: 'center'
                  }}
                  onClick={() => handleConfigChange('format', format.id)}
                >
                  <Icon 
                    sx={{ fontSize: 40, mb: 1 }} 
                    color={exportConfig.format === format.id ? format.color : 'inherit'}
                  />
                  <Typography variant="subtitle1" gutterBottom>
                    {format.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format.description}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            3. Tùy chọn lọc dữ liệu
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Exam Filter */}
            <FormControl fullWidth>
              <InputLabel>Bài kiểm tra (tùy chọn)</InputLabel>
              <Select
                value={exportConfig.filters.exam_id}
                label="Bài kiểm tra (tùy chọn)"
                onChange={(e) => handleFilterChange('exam_id', e.target.value)}
              >
                <MenuItem value="">Tất cả bài kiểm tra</MenuItem>
                {availableExams.map((exam) => (
                  <MenuItem key={exam.id} value={exam.id}>
                    {exam.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Student Filter - only show for student performance reports */}
            {exportConfig.type === 'student_performance' && (
              <FormControl fullWidth>
                <InputLabel>Học sinh</InputLabel>
                <Select
                  value={exportConfig.filters.student_id}
                  label="Học sinh"
                  onChange={(e) => handleFilterChange('student_id', e.target.value)}
                >
                  <MenuItem value="">Tất cả học sinh</MenuItem>
                  {availableStudents.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Skill Filter */}
            <FormControl fullWidth>
              <InputLabel>Kỹ năng (tùy chọn)</InputLabel>
              <Select
                value={exportConfig.filters.skill}
                label="Kỹ năng (tùy chọn)"
                onChange={(e) => handleFilterChange('skill', e.target.value)}
              >
                <MenuItem value="">Tất cả kỹ năng</MenuItem>
                <MenuItem value="listening">Listening</MenuItem>
                <MenuItem value="reading">Reading</MenuItem>
                <MenuItem value="writing">Writing</MenuItem>
                <MenuItem value="speaking">Speaking</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {selectedType && selectedFormat && (
          <>
            <Divider sx={{ my: 3 }} />
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Sẵn sàng xuất:</strong> {selectedType.name} dạng {selectedFormat.name}
              </Typography>
              {exportConfig.filters.exam_id && (
                <Typography variant="caption" display="block">
                  • Lọc theo bài kiểm tra được chọn
                </Typography>
              )}
              {exportConfig.filters.student_id && (
                <Typography variant="caption" display="block">
                  • Lọc theo học sinh được chọn
                </Typography>
              )}
              {exportConfig.filters.skill && (
                <Typography variant="caption" display="block">
                  • Lọc theo kỹ năng: {exportConfig.filters.skill}
                </Typography>
              )}
            </Alert>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={!exportConfig.type || !exportConfig.format || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <FileDownload />}
        >
          {loading ? 'Đang xuất...' : 'Xuất báo cáo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}