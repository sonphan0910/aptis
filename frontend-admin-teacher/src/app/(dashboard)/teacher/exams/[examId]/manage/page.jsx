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
  DragIndicator,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import {
  fetchExamById,
  addExamSection,
  updateExamSection,
  removeExamSection,
  addQuestionToSection,
  removeQuestionFromSection
} from '@/store/slices/examSlice';
import { showNotification } from '@/store/slices/uiSlice';
import { usePublicData } from '@/hooks/usePublicData';
import { examApi } from '@/services/examService';
import { LazyQuestionDisplay } from '@/components/teacher/questions/LazyQuestionDisplay';

export default function ExamManagePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useParams();
  
  const examId = params.examId;
  const examState = useSelector(state => state.exams || {});
  const { currentExam, isLoading, error } = examState;
  const { skillTypes, loading: publicDataLoading } = usePublicData();
  
  const [loading, setLoading] = useState(false);
  const [openSectionDialog, setOpenSectionDialog] = useState(false);
  const [openEditSectionDialog, setOpenEditSectionDialog] = useState(false);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddQuestionFormDialog, setOpenAddQuestionFormDialog] = useState(false);
  const [expandedSectionId, setExpandedSectionId] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [removingQuestionId, setRemovingQuestionId] = useState(null);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    question_order: 1,
    max_score: 10
  });
  const [sectionForm, setSectionForm] = useState({
    skill_type_id: '',
    section_order: 1,
    duration_minutes: 30,
    instruction: ''
  });
  const [editSectionForm, setEditSectionForm] = useState({
    skill_type_id: '',
    duration_minutes: 30,
    instruction: ''
  });

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

  const handleRemoveSection = (section) => {
    setSelectedSection(section);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteSection = async () => {
    if (!selectedSection) return;
    
    setLoading(true);
    try {
      const result = await dispatch(removeExamSection({
        examId,
        sectionId: selectedSection.id
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
      setOpenDeleteDialog(false);
      setSelectedSection(null);
    }
  };

  const handleAddQuestion = (section) => {
    setSelectedSection(section);
    loadAvailableQuestions(section.skill_type_id);
    setOpenQuestionDialog(true);
  };

  const handleEditSection = (section) => {
    setSelectedSection(section);
    setEditSectionForm({
      skill_type_id: section.skill_type_id,
      duration_minutes: section.duration_minutes,
      instruction: section.instruction || ''
    });
    setOpenEditSectionDialog(true);
  };

  const handleUpdateSection = async () => {
    setLoading(true);
    try {
      const result = await dispatch(updateExamSection({
        examId,
        sectionId: selectedSection.id,
        sectionData: {
          ...editSectionForm,
          skill_type_id: parseInt(editSectionForm.skill_type_id),
          duration_minutes: parseInt(editSectionForm.duration_minutes)
        }
      }));
      
      if (updateExamSection.fulfilled.match(result)) {
        dispatch(showNotification({
          message: 'Cập nhật phần thi thành công!',
          type: 'success'
        }));
        setOpenEditSectionDialog(false);
        // Refresh exam data
        dispatch(fetchExamById(examId));
      }
    } catch (error) {
      dispatch(showNotification({
        message: 'Có lỗi xảy ra khi cập nhật phần thi',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableQuestions = async (skillTypeId) => {
    setQuestionsLoading(true);
    try {
      console.log('[loadAvailableQuestions] Fetching questions for skill:', skillTypeId);
      const result = await examApi.getQuestionsBySkill(skillTypeId, 100);
      console.log('[loadAvailableQuestions] Response:', result);
      
      if (result.success && result.data) {
        setAvailableQuestions(result.data);
      } else {
        setAvailableQuestions([]);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      dispatch(showNotification({
        message: 'Lỗi khi tải danh sách câu hỏi: ' + error.message,
        type: 'error'
      }));
      setAvailableQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleAddQuestionClick = (question) => {
    setSelectedQuestion(question);
    // Set default question order as next order after existing questions
    const nextOrder = (selectedSection?.questions?.length || 0) + 1;
    setQuestionForm({
      question_order: nextOrder,
      max_score: 10
    });
    setOpenAddQuestionFormDialog(true);
  };

  const confirmAddQuestion = async () => {
    if (!selectedQuestion || !selectedSection) return;

    setAddingQuestion(true);
    try {
      const result = await dispatch(addQuestionToSection({
        examId,
        sectionId: selectedSection.id,
        questionData: {
          question_id: selectedQuestion.id,
          question_order: parseInt(questionForm.question_order),
          max_score: parseFloat(questionForm.max_score)
        }
      }));

      if (addQuestionToSection.fulfilled.match(result)) {
        dispatch(showNotification({
          message: 'Thêm câu hỏi thành công!',
          type: 'success'
        }));
        setOpenAddQuestionFormDialog(false);
        setSelectedQuestion(null);
        // Refresh exam data to update questions list
        dispatch(fetchExamById(examId));
      }
    } catch (error) {
      dispatch(showNotification({
        message: 'Có lỗi xảy ra khi thêm câu hỏi',
        type: 'error'
      }));
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleRemoveQuestionFromSection = async (sectionId, questionId) => {
    setRemovingQuestionId(questionId);
    try {
      const result = await dispatch(removeQuestionFromSection({
        examId,
        sectionId,
        questionId
      }));

      if (removeQuestionFromSection.fulfilled.match(result)) {
        dispatch(showNotification({
          message: 'Xóa câu hỏi khỏi phần thi thành công!',
          type: 'success'
        }));
        // Refresh exam data
        dispatch(fetchExamById(examId));
      }
    } catch (error) {
      dispatch(showNotification({
        message: 'Có lỗi xảy ra khi xóa câu hỏi',
        type: 'error'
      }));
    } finally {
      setRemovingQuestionId(null);
    }
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
                <Box key={section.id || index}>
                  <ListItem divider>
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
                      <Box display="flex" gap={1} alignItems="center">
                        <IconButton
                          size="small"
                          onClick={() => setExpandedSectionId(
                            expandedSectionId === section.id ? null : section.id
                          )}
                        >
                          {expandedSectionId === section.id ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
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
                          onClick={() => handleEditSection(section)}
                          disabled={loading}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleRemoveSection(section)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>

                  {/* Questions List - Expanded */}
                  {expandedSectionId === section.id && section.questions && section.questions.length > 0 && (
                    <Box sx={{ pl: 4, pr: 2, py: 1, bgcolor: 'background.default' }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Danh sách câu hỏi:
                      </Typography>
                      <List disablePadding>
                        {section.questions.map((question, qIndex) => (
                          <ListItem 
                            key={question.id || qIndex}
                            dense
                            sx={{ 
                              bgcolor: 'background.paper',
                              mb: 0.5,
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <QuestionIcon fontSize="small" color="action" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <LazyQuestionDisplay 
                                  questionId={question.question_id}
                                  questionOrder={question.question_order}
                                  maxScore={question.max_score}
                                  compact={false}
                                />
                              }
                              secondary={null}
                            />
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveQuestionFromSection(section.id, question.id)}
                              disabled={removingQuestionId === question.id}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Empty Questions Message */}
                  {expandedSectionId === section.id && (!section.questions || section.questions.length === 0) && (
                    <Box sx={{ pl: 4, pr: 2, py: 2, bgcolor: 'background.default' }}>
                      <Alert severity="info" sx={{ m: 0 }}>
                        Chưa có câu hỏi trong phần thi này. Hãy thêm câu hỏi bằng cách nhấn nút Thêm.
                      </Alert>
                    </Box>
                  )}
                </Box>
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
            <FormControl fullWidth disabled={publicDataLoading}>
              <InputLabel>Kỹ năng</InputLabel>
              <Select
                value={sectionForm.skill_type_id}
                label="Kỹ năng"
                onChange={(e) => setSectionForm(prev => ({ ...prev, skill_type_id: e.target.value }))}
              >
                {skillTypes && skillTypes.length > 0 ? (
                  skillTypes.map((skill) => (
                    <MenuItem key={skill.id} value={skill.id}>
                      {skill.skill_type_name || skill.name || 'Unknown'}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    {publicDataLoading ? 'Đang tải...' : 'Không có dữ liệu'}
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Thứ tự phần"
              type="number"
              value={sectionForm.section_order}
              disabled
              helperText="Thứ tự được tự động gán dựa trên số phần thi hiện có"
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

      {/* Edit Section Dialog */}
      <Dialog 
        open={openEditSectionDialog} 
        onClose={() => setOpenEditSectionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa phần thi</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} sx={{ mt: 1 }}>
            <FormControl fullWidth disabled={publicDataLoading}>
              <InputLabel>Kỹ năng</InputLabel>
              <Select
                value={editSectionForm.skill_type_id}
                label="Kỹ năng"
                onChange={(e) => setEditSectionForm(prev => ({ ...prev, skill_type_id: e.target.value }))}
              >
                {skillTypes && skillTypes.length > 0 ? (
                  skillTypes.map((skill) => (
                    <MenuItem key={skill.id} value={skill.id}>
                      {skill.skill_type_name || skill.name || 'Unknown'}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    {publicDataLoading ? 'Đang tải...' : 'Không có dữ liệu'}
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Thời gian (phút)"
              type="number"
              value={editSectionForm.duration_minutes}
              onChange={(e) => setEditSectionForm(prev => ({ ...prev, duration_minutes: e.target.value }))}
              inputProps={{ min: 1 }}
            />

            <TextField
              fullWidth
              label="Hướng dẫn"
              multiline
              rows={3}
              value={editSectionForm.instruction}
              onChange={(e) => setEditSectionForm(prev => ({ ...prev, instruction: e.target.value }))}
              placeholder="Nhập hướng dẫn cho phần thi này..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditSectionDialog(false)}>
            Hủy
          </Button>
          <Button 
            onClick={handleUpdateSection}
            variant="contained"
            disabled={loading || !editSectionForm.skill_type_id}
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog 
        open={openQuestionDialog} 
        onClose={() => setOpenQuestionDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle sx={{ py: 1.5 }}>
          Thêm câu hỏi: {selectedSection?.skillType?.skill_type_name}
        </DialogTitle>
        <DialogContent dividers sx={{ py: 1, bgcolor: 'background.paper' }}>
          <Box sx={{ mt: 0 }}>
            {questionsLoading ? (
              <Alert severity="info" sx={{ py: 0.5 }}>Đang tải danh sách câu hỏi...</Alert>
            ) : availableQuestions.length > 0 ? (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Tìm thấy {availableQuestions.length} câu hỏi phù hợp (hiển thị 10 đầu tiên)
                </Typography>
                <List sx={{ py: 0 }}>
                  {availableQuestions.slice(0, 10).map((question, index) => {
                    // Extract and format content
                    const renderContent = (() => {
                      try {
                        const content = question.content;
                        if (!content) return '';
                        return typeof content === 'string' ? content : JSON.stringify(content, null, 2);
                      } catch (e) {
                        return '';
                      }
                    })();

                    return (
                      <ListItem 
                        key={question.id} 
                        divider 
                        sx={{ 
                          py: 1.5, 
                          px: 1,
                          flexDirection: 'column',
                          alignItems: 'flex-start'
                        }}
                        secondaryAction={
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleAddQuestionClick(question)}
                            disabled={addingQuestion}
                            sx={{ ml: 1 }}
                          >
                            Thêm
                          </Button>
                        }
                      >
                        <Box sx={{ width: '100%', mb: 0.5 }}>
                          <Typography variant="caption" fontWeight={600}>
                            Q{index + 1} (ID: {question.id}) • {question.question_type} • {question.skill} • {question.difficulty}
                          </Typography>
                        </Box>
                        {renderContent && (
                          <Box 
                            component="pre"
                            sx={{ 
                              width: '100%',
                              bgcolor: '#f5f5f5',
                              p: 1,
                              borderRadius: 0.5,
                              fontSize: '0.75rem',
                              fontFamily: 'monospace',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              maxHeight: '200px',
                              overflow: 'auto',
                              border: '1px solid #e0e0e0',
                              margin: 0,
                              color: '#333'
                            }}
                          >
                            {renderContent}
                          </Box>
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            ) : (
              <Alert severity="warning" sx={{ py: 0.5 }}>
                Không tìm thấy câu hỏi nào. Tạo câu hỏi trước khi thêm vào phần thi.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ py: 1, px: 2 }}>
          <Button onClick={() => setOpenQuestionDialog(false)} size="small">
            Đóng
          </Button>
          <Button 
            variant="contained"
            size="small"
            onClick={() => {
              window.open('/teacher/questions/new', '_blank');
            }}
          >
            Tạo mới
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa phần thi</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn xóa phần thi này không?
          </Alert>
          {selectedSection && (
            <Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Phần {selectedSection.section_order}: {selectedSection.skillType?.skill_type_name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Thời gian: {selectedSection.duration_minutes} phút
              </Typography>
              {selectedSection.instruction && (
                <Typography variant="body2" color="text.secondary">
                  Hướng dẫn: {selectedSection.instruction}
                </Typography>
              )}
              <Alert severity="error" sx={{ mt: 2 }}>
                <strong>Cảnh báo:</strong> Tất cả câu hỏi trong phần này sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button 
            onClick={confirmDeleteSection}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Đang xóa...' : 'Xóa phần thi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Question Form Dialog */}
      <Dialog 
        open={openAddQuestionFormDialog} 
        onClose={() => setOpenAddQuestionFormDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm câu hỏi vào phần thi</DialogTitle>
        <DialogContent>
          {selectedQuestion && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <LazyQuestionDisplay 
                  questionId={selectedQuestion.id}
                  questionOrder={1}
                  maxScore={1}
                  compact={false}
                />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Loại: {selectedQuestion.questionType?.question_type_name || selectedQuestion.questionType?.code || 'N/A'} | Độ khó: {selectedQuestion.difficulty}
                </Typography>
              </Alert>

              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  fullWidth
                  label="Thứ tự câu hỏi"
                  type="number"
                  value={questionForm.question_order}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, question_order: e.target.value }))}
                  inputProps={{ min: 1 }}
                  helperText="Vị trí của câu hỏi trong phần thi"
                />

                <TextField
                  fullWidth
                  label="Điểm tối đa"
                  type="number"
                  value={questionForm.max_score}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, max_score: e.target.value }))}
                  inputProps={{ min: 0.1, step: 0.1 }}
                  helperText="Điểm tối đa mà học sinh có thể đạt được cho câu hỏi này"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenAddQuestionFormDialog(false)}
            disabled={addingQuestion}
          >
            Hủy
          </Button>
          <Button 
            onClick={confirmAddQuestion}
            variant="contained"
            disabled={addingQuestion || !questionForm.question_order || !questionForm.max_score}
          >
            {addingQuestion ? 'Đang thêm...' : 'Thêm câu hỏi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}