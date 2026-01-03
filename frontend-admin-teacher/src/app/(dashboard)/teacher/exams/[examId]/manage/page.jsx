'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Skeleton,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  Add as AddIcon,
  Settings as SectionIcon,
  Quiz as QuestionIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator
} from '@mui/icons-material';
import { 
  fetchExamById, 
  addExamSection,
  removeExamSection,
  addQuestionToSection,
  removeQuestionFromSection 
} from '@/store/slices/examSlice';
import { showNotification } from '@/store/slices/uiSlice';

export default function ExamManagePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useParams();
  
  const examId = params.examId;
  const examState = useSelector(state => state.exam || {});
  const { currentExam, isLoading, error } = examState;
  
  const [loading, setLoading] = useState(false);
  const [openSectionDialog, setOpenSectionDialog] = useState(false);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [skillTypes, setSkillTypes] = useState([]);
  const [sectionForm, setSectionForm] = useState({
    skill_type_id: '',
    section_order: 1,
    duration_minutes: 30,
    instruction: ''
  });

  // Fetch skill types
  useEffect(() => {
    const fetchSkillTypes = async () => {
      try {
        // This is a mock - replace with actual API call
        setSkillTypes([
          { id: 1, skill_type_name: 'Reading' },
          { id: 2, skill_type_name: 'Listening' },
          { id: 3, skill_type_name: 'Writing' },
          { id: 4, skill_type_name: 'Speaking' },
          { id: 5, skill_type_name: 'Grammar' }
        ]);
      } catch (error) {
        console.error('Error fetching skill types:', error);
      }
    };
    
    fetchSkillTypes();
  }, []);

  // Fetch exam data on mount
  useEffect(() => {
    if (examId) {
      dispatch(fetchExamById(examId));
    }
  }, [dispatch, examId]);

  const handleAddSection = async () => {
    setLoading(true);
    try {
      const result = await dispatch(addExamSection({
        examId,
        sectionData: {
          ...sectionForm,
          skill_type_id: parseInt(sectionForm.skill_type_id),
          section_order: parseInt(sectionForm.section_order),
          duration_minutes: parseInt(sectionForm.duration_minutes)
        }
      }));
      
      if (addExamSection.fulfilled.match(result)) {
        dispatch(showNotification({
          message: 'Thêm phần thi thành công!',
          type: 'success'
        }));
        setOpenSectionDialog(false);
        // Reset form with next order
        const nextOrder = ((currentExam?.sections?.length || 0) + 1);
        setSectionForm({
          skill_type_id: '',
          section_order: nextOrder,
          duration_minutes: 30,
          instruction: ''
        });
        // Refresh exam data
        dispatch(fetchExamById(examId));
      }
    } catch (error) {
      dispatch(showNotification({
        message: 'Có lỗi xảy ra khi thêm phần thi',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSection = async (sectionId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phần thi này? Tất cả câu hỏi trong phần này sẽ bị xóa.')) {
      return;
    }
    
    setLoading(true);
    try {
      const result = await dispatch(removeExamSection({
        examId,
        sectionId
      }));
      
      if (removeExamSection.fulfilled.match(result)) {
        dispatch(showNotification({
          message: 'Xóa phần thi thành công!',
          type: 'success'
        }));
        // Refresh exam data
        dispatch(fetchExamById(examId));
      }
    } catch (error) {
      dispatch(showNotification({
        message: 'Có lỗi xảy ra khi xóa phần thi',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = (section) => {
    setSelectedSection(section);
    setOpenQuestionDialog(true);
  };

  const handleOpenSectionDialog = () => {
    // Calculate next section order
    const nextOrder = (currentExam?.sections?.length || 0) + 1;
    setSectionForm(prev => ({
      ...prev,
      section_order: nextOrder
    }));
    setOpenSectionDialog(true);
  };

  // Loading skeleton
  if (isLoading && !currentExam) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" height={400} sx={{ mt: 2 }} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Có lỗi xảy ra khi tải bài thi: {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push(`/teacher/exams/${examId}`)}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Quản lý Sections - {currentExam?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thêm và quản lý các phần thi và câu hỏi
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenSectionDialog}
        >
          Thêm phần thi
        </Button>
      </Box>

      {/* Overview Stats */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Tổng số phần thi
              </Typography>
              <Typography variant="h5" color="primary">
                {currentExam?.sections?.length || 0}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Tổng câu hỏi
              </Typography>
              <Typography variant="h5" color="primary">
                {currentExam?.sections?.reduce((total, section) => 
                  total + (section.questions?.length || 0), 0) || 0}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Thời gian thi
              </Typography>
              <Typography variant="h5" color="primary">
                {currentExam?.duration_minutes || 0} phút
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Trạng thái
              </Typography>
              <Chip 
                label={currentExam?.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                color={currentExam?.status === 'published' ? 'success' : 'default'}
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sections List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Danh sách phần thi
          </Typography>
          
          {!currentExam?.sections || currentExam.sections.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Chưa có phần thi nào. Hãy thêm phần thi đầu tiên để bắt đầu xây dựng bài thi.
            </Alert>
          ) : (
            <List>
              {currentExam.sections.map((section, index) => (
                <ListItem key={section.id || index} divider>
                  <ListItemIcon>
                    <DragIndicator color="action" />
                  </ListItemIcon>
                  <ListItemIcon>
                    <SectionIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          Phần {section.section_order || index + 1}: {section.skillType?.skill_type_name || 'N/A'}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={`${section.questions?.length || 0} câu hỏi`}
                          variant="outlined"
                        />
                        <Chip 
                          size="small" 
                          label={`${section.duration_minutes || 0} phút`}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        {section.instruction && (
                          <Typography variant="body2" color="text.secondary">
                            Hướng dẫn: {section.instruction}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box display="flex" gap={1}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleAddQuestion(section)}
                      >
                        <QuestionIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="default"
                        disabled={loading}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleRemoveSection(section.id)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Add Section Dialog */}
      <Dialog 
        open={openSectionDialog} 
        onClose={() => setOpenSectionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm phần thi mới</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Kỹ năng</InputLabel>
              <Select
                value={sectionForm.skill_type_id}
                label="Kỹ năng"
                onChange={(e) => setSectionForm(prev => ({ ...prev, skill_type_id: e.target.value }))}
              >
                {skillTypes.map((skill) => (
                  <MenuItem key={skill.id} value={skill.id}>
                    {skill.skill_type_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Thứ tự phần"
              type="number"
              value={sectionForm.section_order}
              onChange={(e) => setSectionForm(prev => ({ ...prev, section_order: e.target.value }))}
              inputProps={{ min: 1 }}
            />

            <TextField
              fullWidth
              label="Thời gian (phút)"
              type="number"
              value={sectionForm.duration_minutes}
              onChange={(e) => setSectionForm(prev => ({ ...prev, duration_minutes: e.target.value }))}
              inputProps={{ min: 1 }}
            />

            <TextField
              fullWidth
              label="Hướng dẫn"
              multiline
              rows={3}
              value={sectionForm.instruction}
              onChange={(e) => setSectionForm(prev => ({ ...prev, instruction: e.target.value }))}
              placeholder="Nhập hướng dẫn cho phần thi này..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSectionDialog(false)}>
            Hủy
          </Button>
          <Button 
            onClick={handleAddSection}
            variant="contained"
            disabled={loading || !sectionForm.skill_type_id}
          >
            {loading ? 'Đang thêm...' : 'Thêm phần thi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog 
        open={openQuestionDialog} 
        onClose={() => setOpenQuestionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Thêm câu hỏi vào phần: {selectedSection?.skillType?.skill_type_name}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            Chức năng thêm câu hỏi đang được phát triển. Bạn có thể quản lý câu hỏi thông qua trang quản lý ngân hàng câu hỏi.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuestionDialog(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}