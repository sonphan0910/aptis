'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  Divider,
  Chip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  DragIndicator as DragIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  QuestionMark as QuestionIcon,
  ExpandMore as ExpandMoreIcon,
  Assignment as SectionIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  addExamSection,
  removeExamSection,
  addQuestionToSection,
  removeQuestionFromSection
} from '@/store/slices/examSlice';
import { questionService } from '@/services/questionService';

const ExamBuilder = ({ examData, onSubmit, isEditing = false, loading = false }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  // State
  const [sections, setSections] = useState(examData?.sections || []);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [availableSkillTypes, setAvailableSkillTypes] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Dialog states
  const [sectionDialog, setSectionDialog] = useState({ open: false, section: null });
  const [questionPreview, setQuestionPreview] = useState({ open: false, question: null });
  const [saving, setSaving] = useState(false);

  // Load data on mount and when examData changes
  useEffect(() => {
    if (examData?.sections) {
      setSections(examData.sections);
      if (examData.sections.length > 0 && !selectedSection) {
        setSelectedSection(examData.sections[0]);
      }
    }
    loadAvailableQuestions();
    loadSkillTypes();
  }, [examData]);

  // Filter questions when dependencies change
  useEffect(() => {
    filterQuestions();
  }, [availableQuestions, searchTerm, filterSkill, filterType, sections]);

  const loadAvailableQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const response = await questionService.getQuestions({
        page: 1,
        limit: 1000,
        status: 'published'
      });
      setAvailableQuestions(response.data?.questions || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const loadSkillTypes = async () => {
    try {
      // This would be from a skill type service
      const skillTypes = [
        { id: 1, code: 'SPEAKING', skill_type_name: 'Speaking', description: 'Oral communication skills' },
        { id: 2, code: 'WRITING', skill_type_name: 'Writing', description: 'Written communication skills' },
        { id: 3, code: 'READING', skill_type_name: 'Reading', description: 'Reading comprehension skills' },
        { id: 4, code: 'LISTENING', skill_type_name: 'Listening', description: 'Listening comprehension skills' },
        { id: 5, code: 'GRAMMAR', skill_type_name: 'Grammar', description: 'Grammar and vocabulary skills' }
      ];
      setAvailableSkillTypes(skillTypes);
    } catch (error) {
      console.error('Error loading skill types:', error);
    }
  };

  const filterQuestions = () => {
    let filtered = availableQuestions.filter(q => {
      // Filter out questions already in exam
      const usedQuestionIds = sections.flatMap(s =>
        (s.questions || []).map(sq => sq.question?.id || sq.question_id)
      );
      if (usedQuestionIds.includes(q.id)) return false;

      // Search filter
      if (searchTerm && !q.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Skill filter
      if (filterSkill !== 'all' && q.skill_type_id !== parseInt(filterSkill)) return false;

      // Type filter - would need question type filter
      if (filterType !== 'all' && q.question_type_id !== parseInt(filterType)) return false;

      return true;
    });

    setFilteredQuestions(filtered);
  };

  // Section management
  const handleAddSection = () => {
    setSectionDialog({ open: true, section: null });
  };

  const handleEditSection = (section) => {
    setSectionDialog({ open: true, section });
  };

  const handleSaveSection = async (sectionData) => {
    try {
      setSaving(true);

      if (sectionDialog.section) {
        // Update existing section (not implemented in backend yet)
        const updatedSections = sections.map(s =>
          s.id === sectionDialog.section.id
            ? { ...s, ...sectionData }
            : s
        );
        setSections(updatedSections);
      } else {
        // Add new section via API
        const result = await dispatch(addExamSection({
          examId: examData.id,
          sectionData: {
            skill_type_id: sectionData.skill_type_id,
            section_order: sections.length + 1,
            duration_minutes: sectionData.duration_minutes || null,
            instruction: sectionData.instruction || null
          }
        }));

        if (result.type === addExamSection.fulfilled.type) {
          // Add section to local state
          const newSection = {
            id: result.payload.data.id,
            skill_type_id: sectionData.skill_type_id,
            skillType: availableSkillTypes.find(st => st.id === sectionData.skill_type_id),
            section_order: sections.length + 1,
            duration_minutes: sectionData.duration_minutes,
            instruction: sectionData.instruction,
            questions: []
          };

          const updatedSections = [...sections, newSection];
          setSections(updatedSections);
          setSelectedSection(newSection);

          // Notify parent component
          onSubmit({ sections: updatedSections });
        }
      }
    } catch (error) {
      console.error('Error saving section:', error);
    } finally {
      setSaving(false);
    }

    setSectionDialog({ open: false, section: null });
  };

  const handleDeleteSection = async (section) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phần "${section.skillType?.skill_type_name}"?`)) {
      try {
        setSaving(true);

        await dispatch(removeExamSection({
          examId: examData.id,
          sectionId: section.id
        }));

        const updatedSections = sections.filter(s => s.id !== section.id);
        setSections(updatedSections);

        if (selectedSection?.id === section.id) {
          setSelectedSection(updatedSections.length > 0 ? updatedSections[0] : null);
        }

        // Notify parent component
        onSubmit({ sections: updatedSections });
      } catch (error) {
        console.error('Error deleting section:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  // Question management
  const handleAddQuestionToSection = async (question) => {
    if (!selectedSection) return;

    try {
      setSaving(true);

      const result = await dispatch(addQuestionToSection({
        examId: examData.id,
        sectionId: selectedSection.id,
        questionData: {
          question_id: question.id,
          question_order: (selectedSection.questions?.length || 0) + 1,
          max_score: question.default_score || 10
        }
      }));

      if (result.type === addQuestionToSection.fulfilled.type) {
        // Update local state
        const updatedSections = sections.map(section => {
          if (section.id === selectedSection.id) {
            return {
              ...section,
              questions: [...(section.questions || []), {
                id: result.payload.data.id,
                question_id: question.id,
                question: question,
                question_order: (section.questions?.length || 0) + 1,
                max_score: question.default_score || 10
              }]
            };
          }
          return section;
        });

        setSections(updatedSections);
        setSelectedSection(updatedSections.find(s => s.id === selectedSection.id));

        // Notify parent component
        onSubmit({ sections: updatedSections });
      }
    } catch (error) {
      console.error('Error adding question to section:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveQuestionFromSection = async (sectionQuestion) => {
    if (!selectedSection) return;

    try {
      setSaving(true);

      await dispatch(removeQuestionFromSection({
        examId: examData.id,
        sectionId: selectedSection.id,
        questionId: sectionQuestion.question_id
      }));

      // Update local state
      const updatedSections = sections.map(section => {
        if (section.id === selectedSection.id) {
          return {
            ...section,
            questions: section.questions.filter(q => q.id !== sectionQuestion.id)
          };
        }
        return section;
      });

      setSections(updatedSections);
      setSelectedSection(updatedSections.find(s => s.id === selectedSection.id));

      // Notify parent component
      onSubmit({ sections: updatedSections });
    } catch (error) {
      console.error('Error removing question from section:', error);
    } finally {
      setSaving(false);
    }
  };

  const SectionDialog = () => (
    <Dialog
      open={sectionDialog.open}
      onClose={() => setSectionDialog({ open: false, section: null })}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {sectionDialog.section ? 'Chỉnh sửa phần thi' : 'Thêm phần thi mới'}
      </DialogTitle>
      <DialogContent>
        <SectionForm
          section={sectionDialog.section}
          skillTypes={availableSkillTypes}
          onSave={handleSaveSection}
          onCancel={() => setSectionDialog({ open: false, section: null })}
        />
      </DialogContent>
    </Dialog>
  );

  const SectionForm = ({ section, skillTypes, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      skill_type_id: section?.skill_type_id || '',
      duration_minutes: section?.duration_minutes || '',
      instruction: section?.instruction || ''
    });

    const handleSubmit = () => {
      if (!formData.skill_type_id) {
        alert('Vui lòng chọn loại kỹ năng');
        return;
      }
      onSave(formData);
    };

    return (
      <Box sx={{ pt: 1 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Loại kỹ năng *</InputLabel>
          <Select
            value={formData.skill_type_id}
            onChange={(e) => setFormData({ ...formData, skill_type_id: e.target.value })}
            label="Loại kỹ năng *"
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
          margin="normal"
          label="Thời gian (phút)"
          type="number"
          value={formData.duration_minutes}
          onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
          helperText="Để trống nếu không giới hạn thời gian riêng cho phần này"
        />

        <TextField
          fullWidth
          margin="normal"
          label="Hướng dẫn"
          multiline
          rows={3}
          value={formData.instruction}
          onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
          helperText="Hướng dẫn cho học viên về phần thi này"
        />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={onCancel}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </Box>
      </Box>
    );
  };

  const totalQuestions = sections.reduce((total, section) =>
    total + (section.questions?.length || 0), 0);
  const totalScore = sections.reduce((total, section) =>
    total + (section.questions || []).reduce((sectionTotal, q) =>
      sectionTotal + (q.max_score || 0), 0), 0);

  return (
    <Box>
      {/* Header with statistics */}
      <Box mb={3}>
        <Typography variant="h5" gutterBottom>Xây dựng bài thi</Typography>
        <Box display="flex" gap={2} mb={2}>
          <Chip label={`${sections.length} phần`} variant="outlined" />
          <Chip label={`${totalQuestions} câu hỏi`} variant="outlined" />
          <Chip label={`${totalScore} điểm`} variant="outlined" />
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          Một bài thi cần có ít nhất 1 phần và mỗi phần cần có ít nhất 1 câu hỏi để có thể xuất bản.
        </Alert>
      </Box>

      <Grid container spacing={3}>
        {/* Left panel: Sections */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Các phần thi</Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddSection}
                  disabled={saving}
                >
                  Thêm phần
                </Button>
              </Box>

              {sections.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <SectionIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Chưa có phần thi nào
                  </Typography>
                </Box>
              ) : (
                <List>
                  {sections.map((section, index) => (
                    <ListItem
                      key={section.id}
                      button
                      selected={selectedSection?.id === section.id}
                      onClick={() => setSelectedSection(section)}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText',
                          '&:hover': {
                            backgroundColor: 'primary.main'
                          }
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={section.skillType?.skill_type_name || 'Unknown'}
                        secondary={`${section.questions?.length || 0} câu hỏi`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSection(section);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(section);
                          }}
                          disabled={saving}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Middle panel: Section questions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedSection
                  ? `Phần ${sections.indexOf(selectedSection) + 1}: ${selectedSection.skillType?.skill_type_name}`
                  : 'Chọn một phần thi'
                }
              </Typography>

              {selectedSection ? (
                <>
                  {selectedSection.instruction && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        {selectedSection.instruction}
                      </Typography>
                    </Alert>
                  )}

                  {(selectedSection.questions || []).length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <QuestionIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Phần này chưa có câu hỏi nào
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Chọn câu hỏi từ danh sách bên phải để thêm vào
                      </Typography>
                    </Box>
                  ) : (
                    <List>
                      {selectedSection.questions.map((sectionQuestion, index) => (
                        <ListItem key={sectionQuestion.id}>
                          <ListItemIcon>
                            <Typography variant="body2" color="primary">
                              {index + 1}
                            </Typography>
                          </ListItemIcon>
                          <ListItemText
                            primary={sectionQuestion.question?.title || sectionQuestion.question?.question_text}
                            secondary={`${sectionQuestion.max_score} điểm`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              size="small"
                              onClick={() => setQuestionPreview({
                                open: true,
                                question: sectionQuestion.question
                              })}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveQuestionFromSection(sectionQuestion)}
                              disabled={saving}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chọn một phần thi để xem danh sách câu hỏi
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right panel: Available questions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Ngân hàng câu hỏi</Typography>

              {/* Search and filters */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'grey.500' }} />
                  }}
                  sx={{ mb: 1 }}
                />

                <Box display="flex" gap={1}>
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel>Kỹ năng</InputLabel>
                    <Select
                      value={filterSkill}
                      onChange={(e) => setFilterSkill(e.target.value)}
                      label="Kỹ năng"
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      {availableSkillTypes.map((skill) => (
                        <MenuItem key={skill.id} value={skill.id.toString()}>
                          {skill.skill_type_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Question list */}
              {loadingQuestions ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Đang tải câu hỏi...
                  </Typography>
                </Box>
              ) : filteredQuestions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <QuestionIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Không tìm thấy câu hỏi phù hợp
                  </Typography>
                </Box>
              ) : (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {filteredQuestions.map((question) => (
                    <ListItem key={question.id}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" noWrap>
                            {question.title || question.question_text}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {question.question_type?.question_type_name}
                            </Typography>
                            <Typography variant="caption" color="primary">
                              {question.default_score || 10} điểm
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={() => setQuestionPreview({ open: true, question })}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleAddQuestionToSection(question)}
                          disabled={!selectedSection || saving}
                          color="primary"
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <SectionDialog />

      {/* Question Preview Dialog */}
      <Dialog
        open={questionPreview.open}
        onClose={() => setQuestionPreview({ open: false, question: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Xem trước câu hỏi</DialogTitle>
        <DialogContent>
          {questionPreview.question && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {questionPreview.question.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {questionPreview.question.question_text}
              </Typography>
              {/* Add more question details based on type */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionPreview({ open: false, question: null })}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamBuilder;