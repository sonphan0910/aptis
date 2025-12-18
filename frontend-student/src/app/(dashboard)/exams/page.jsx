'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  PlayArrow,
  History,
  Schedule,
  Assessment,
  School,
  TrendingUp,
  FilterList,
} from '@mui/icons-material';
import { api } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Breadcrumb from '@/components/common/Breadcrumb';

export default function ExamsPage() {
  const router = useRouter();
  
  // State for exams
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [searchInput, setSearchInput] = useState('');
  const [aptisTypes, setAptisTypes] = useState([]);
  const [skillTypes, setSkillTypes] = useState([]);
  const [filters, setFilters] = useState({
    aptis_type: '',
    skill: '',
    sort: 'created_at',
    search: '',
  });

  // State for pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Fetch filter options from public API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [aptisRes, skillsRes] = await Promise.all([
          api.get('/public/aptis-types'),
          api.get('/public/skill-types'),
        ]);

        // Safely extract data from response
        const aptisData = aptisRes.data?.data || aptisRes.data || [];
        const skillsData = skillsRes.data?.data || skillsRes.data || [];

        setAptisTypes(Array.isArray(aptisData) ? aptisData : []);
        setSkillTypes(Array.isArray(skillsData) ? skillsData : []);
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
        setAptisTypes([]);
        setSkillTypes([]);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch exams
  useEffect(() => {
    const fetchExamsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query params
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.aptis_type) params.append('aptis_type', filters.aptis_type);
        if (filters.skill) params.append('skill', filters.skill);
        if (filters.sort) params.append('sort', filters.sort);
        params.append('page', page);
        params.append('limit', pagination.limit);

        const response = await api.get(`/student/exams?${params.toString()}`);

        // Extract exam data safely
        const examsData = response.data?.data || response.data?.exams || [];
        setExams(Array.isArray(examsData) ? examsData : []);
        
        // Extract pagination data safely
        if (response.data?.pagination) {
          setPagination({
            page: response.data.pagination.page || page,
            limit: response.data.pagination.limit || 12,
            total: response.data.pagination.total || 0,
            totalPages: response.data.pagination.totalPages || 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch exams:', err);
        setError(err.response?.data?.message || 'Failed to load exams');
        setExams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamsData();
  }, [filters, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchInput });
    setPage(1);
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setFilters({
      aptis_type: '',
      skill: '',
      sort: 'created_at',
      search: '',
    });
    setPage(1);
  };

  const hasActiveFilters = filters.search || filters.aptis_type || filters.skill;

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartExam = (examId) => {
    router.push(`/exams/${examId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      'easy': 'Dễ',
      'medium': 'Trung bình',
      'hard': 'Khó',
    };
    return labels[difficulty?.toLowerCase()] || difficulty || 'Not specified';
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'Không xác định';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (isLoading && exams.length === 0) {
    return <LoadingSpinner message="Đang tải bài thi..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Duyệt bài thi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chọn bài thi luyện tập APTIS phù hợp với kỹ năng của bạn
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container alignItems="flex-end" spacing={2}>
            <Grid item xs={12} md={10}>
              <Grid container spacing={2} alignItems="flex-end">
                {/* Search */}
                <Grid item xs={12} sm={6} md={5}>
                  <Box component="form" onSubmit={handleSearch}>
                    <TextField
                      fullWidth
                      placeholder="Tìm kiếm bài thi..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                        endAdornment: hasActiveFilters && (
                          <InputAdornment position="end">
                            <Button
                              size="small"
                              onClick={handleClearFilters}
                              sx={{ textTransform: 'none' }}
                            >
                              Xóa bộ lọc
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Grid>
                {/* APTIS Type Filter */}
                <Grid item xs={12} sm={3} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Loại APTIS</InputLabel>
                    <Select
                      value={filters.aptis_type}
                      label="Loại APTIS"
                      onChange={(e) => handleFilterChange('aptis_type', e.target.value)}
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      {Array.isArray(aptisTypes) && aptisTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* Skill Filter */}
                <Grid item xs={12} sm={3} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Kỹ năng</InputLabel>
                    <Select
                      value={filters.skill}
                      label="Kỹ năng"
                      onChange={(e) => handleFilterChange('skill', e.target.value)}
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      {Array.isArray(skillTypes) && skillTypes.map((skill) => (
                        <MenuItem key={skill.id} value={skill.id}>
                          {skill.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            {/* Sort Filter right aligned */}
            <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={filters.sort}
                  label="Sắp xếp"
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  <MenuItem value="created_at">Mới nhất</MenuItem>
                  <MenuItem value="title">Tiêu đề</MenuItem>
                  <MenuItem value="duration">Thời gian</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Exams Grid */}
      {!isLoading && exams.length > 0 && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {exams.map((exam) => (
              <Grid item xs={12} sm={6} md={4} key={exam.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Header: Title */}
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 1.5 }}>
                      {exam.title}
                    </Typography>

                    {/* APTIS Type Badge */}
                    {exam.aptis_type && (
                      <Box sx={{ mb: 1.5 }}>
                        <Chip
                          icon={<School />}
                          label={exam.aptis_type}
                          size="small"
                          variant="filled"
                          color="primary"
                        />
                      </Box>
                    )}

                    {/* Skill Types */}
                    {exam.skill_types && exam.skill_types.length > 0 && (
                      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {exam.skill_types.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            variant="outlined"
                            color="secondary"
                          />
                        ))}
                      </Box>
                    )}

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {exam.description?.substring(0, 150)}
                      {exam.description?.length > 150 ? '...' : ''}
                    </Typography>

                    {/* Divider */}
                    <Box sx={{ borderTop: '1px solid #e0e0e0', my: 2 }} />

                    {/* Exam Details Grid */}
                    <Grid container spacing={1.5}>
                      {exam.duration && (
                        <Grid item xs={6}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <Schedule sx={{ fontSize: 16, color: 'primary.main' }} />
                              <Typography variant="caption" color="text.secondary">
                                Thời gian
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatDuration(exam.duration)}
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {exam.section_count && (
                        <Grid item xs={6}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <FilterList sx={{ fontSize: 16, color: 'primary.main' }} />
                              <Typography variant="caption" color="text.secondary">
                                Phần
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {exam.section_count}
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {exam.attempted_count !== undefined && (
                        <Grid item xs={6}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <History sx={{ fontSize: 16, color: 'primary.main' }} />
                              <Typography variant="caption" color="text.secondary">
                                Lần làm
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {exam.attempted_count}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>

                  <CardActions sx={{ pt: 0 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<PlayArrow />}
                      fullWidth
                      onClick={() => handleStartExam(exam.id)}
                    >
                      Bắt đầu bài thi
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* No Results */}
      {!isLoading && exams.length === 0 && !error && (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <TrendingUp sx={{ fontSize: 48, color: 'text.secondary', mb: 2, mx: 'auto' }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Không tìm thấy bài thi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hãy thử điều chỉnh các bộ lọc để xem kết quả khác.
          </Typography>
        </Card>
      )}
    </Container>
  );
}