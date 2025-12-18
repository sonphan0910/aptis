'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  Pagination
} from '@mui/material';
import {
  Search,
  Add,
  Visibility,
  DragIndicator,
  FilterList
} from '@mui/icons-material';
import { fetchQuestions } from '@/store/slices/questionSlice';
import { Draggable } from 'react-beautiful-dnd';

export default function QuestionSelector({ 
  onQuestionAdd,
  selectedQuestions = [],
  examType = '',
  examSkill = ''
}) {
  const dispatch = useDispatch();
  const { questions, loading, pagination } = useSelector(state => state.question);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    question_type: '',
    aptis_type: examType,
    skill: examSkill,
    difficulty: ''
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    handleFetchQuestions();
  }, [searchTerm, filters, page]);

  useEffect(() => {
    // Update filters when exam type/skill changes
    setFilters(prev => ({
      ...prev,
      aptis_type: examType,
      skill: examSkill
    }));
  }, [examType, examSkill]);

  const handleFetchQuestions = () => {
    dispatch(fetchQuestions({
      page,
      limit: 10,
      search: searchTerm,
      ...filters,
      exclude: selectedQuestions.map(q => q.id) // Exclude already selected questions
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPage(1);
  };

  const handleAddQuestion = (question) => {
    onQuestionAdd(question);
  };

  const isQuestionSelected = (questionId) => {
    return selectedQuestions.some(q => q.id === questionId);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Danh sách câu hỏi
      </Typography>
      
      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Tìm kiếm câu hỏi..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Filters */}
      <Box display="flex" gap={1} mb={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Loại câu</InputLabel>
          <Select
            value={filters.question_type}
            label="Loại câu"
            onChange={(e) => handleFilterChange('question_type', e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="mcq">MCQ</MenuItem>
            <MenuItem value="matching">Matching</MenuItem>
            <MenuItem value="gap_filling">Gap Filling</MenuItem>
            <MenuItem value="ordering">Ordering</MenuItem>
            <MenuItem value="writing">Writing</MenuItem>
            <MenuItem value="speaking">Speaking</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Độ khó</InputLabel>
          <Select
            value={filters.difficulty}
            label="Độ khó"
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="easy">Easy</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="hard">Hard</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Questions List */}
      <Box sx={{ height: 'calc(100% - 180px)', overflow: 'auto' }}>
        {questions.length > 0 ? (
          <List>
            {questions.map((question, index) => (
              <ListItem key={question.id} disablePadding sx={{ mb: 1 }}>
                <Card 
                  sx={{ 
                    width: '100%',
                    opacity: isQuestionSelected(question.id) ? 0.5 : 1,
                    cursor: isQuestionSelected(question.id) ? 'not-allowed' : 'grab'
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      <DragIndicator color="action" sx={{ mt: 0.5 }} />
                      <Box flex={1}>
                        <Typography variant="subtitle2" noWrap title={question.title}>
                          {question.title}
                        </Typography>
                        
                        <Box display="flex" gap={0.5} mt={1} mb={1}>
                          <Chip 
                            label={question.question_type?.toUpperCase()} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                          <Chip 
                            label={question.skill?.charAt(0).toUpperCase() + question.skill?.slice(1)} 
                            size="small" 
                            color="secondary"
                          />
                          <Chip 
                            label={question.difficulty || 'medium'} 
                            size="small" 
                            color={getDifficultyColor(question.difficulty)}
                          />
                        </Box>
                        
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {question.description || question.content || 'Không có mô tả'}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" flexDirection="column" gap={1}>
                        <IconButton size="small" title="Xem trước">
                          <Visibility />
                        </IconButton>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() => handleAddQuestion(question)}
                          disabled={isQuestionSelected(question.id)}
                        >
                          Thêm
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              {loading ? 'Đang tải...' : 'Không tìm thấy câu hỏi phù hợp'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(pagination.total / pagination.limit)}
            page={page}
            onChange={(e, newPage) => setPage(newPage)}
            color="primary"
            size="small"
          />
        </Box>
      )}

      {/* Filter Info */}
      <Box mt={2} p={1} bgcolor="info.light" borderRadius={1}>
        <Typography variant="caption" color="info.dark">
          <FilterList fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
          Đang hiển thị câu hỏi cho: {examType} - {examSkill}
        </Typography>
      </Box>
    </Paper>
  );
}