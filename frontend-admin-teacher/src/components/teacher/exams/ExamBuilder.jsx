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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  DragIndicator as DragIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  QuestionMark as QuestionIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { questionService } from '@/services/questionService';
// Note: react-beautiful-dnd might need SSR consideration in Next.js 14

const ExamBuilder = ({ examData, onSubmit, isEditing = false }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // State
  const [sections, setSections] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  
  // Dialog states
  const [sectionDialog, setSectionDialog] = useState({ open: false, section: null });
  const [questionPreview, setQuestionPreview] = useState({ open: false, question: null });

  // Load exam data and available questions
  useEffect(() => {
    loadExamData();
    loadAvailableQuestions();
  }, [examData]);

  // Filter questions
  useEffect(() => {
    filterQuestions();
  }, [availableQuestions, searchTerm, filterSkill, filterType, filterDifficulty, sections]);

  const loadExamData = () => {
    try {
      if (examData?.sections) {
        const loadedSections = examData.sections.map((section, index) => ({
          id: section.id || `section-${index}`,
          name: section.name || `Part ${index + 1}`,
          description: section.description || '',
          instructions: section.instructions || '',
          questions: section.questions || [],
          order: section.order || index
        }));
        setSections(loadedSections);
        if (loadedSections.length > 0 && !selectedSection) {
          setSelectedSection(loadedSections[0]);
        }
      }
    } catch (error) {
      console.error('Error loading exam data:', error);
    }
  };

  const loadAvailableQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionService.getQuestions({
        page: 1,
        limit: 1000, // Load all for now
        status: 'published'
      });
      setAvailableQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = availableQuestions.filter(q => {
      // Filter out questions already in exam
      const usedQuestionIds = sections.flatMap(s => s.questions.map(sq => sq.id));
      if (usedQuestionIds.includes(q.id)) return false;
      
      // Search filter
      if (searchTerm && !q.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Skill filter
      if (filterSkill !== 'all' && q.skill !== filterSkill) return false;
      
      // Type filter
      if (filterType !== 'all' && q.question_type !== filterType) return false;
      
      // Difficulty filter
      if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
      
      return true;
    });
    
    setFilteredQuestions(filtered);
  };

  // Section management
  const addSection = () => {
    setSectionDialog({ open: true, section: null });
  };

  const editSection = (section) => {
    setSectionDialog({ open: true, section });
  };

  const saveSection = (sectionData) => {
    if (sectionDialog.section) {
      // Edit existing section
      const updatedSections = sections.map(s => 
        s.id === sectionDialog.section.id 
          ? { ...s, ...sectionData }
          : s
      );
      setSections(updatedSections);
      updateExam(updatedSections);
    } else {
      // Add new section
      const newSection = {
        id: `section-${Date.now()}`,
        ...sectionData,
        questions: [],
        order: sections.length
      };
      const updatedSections = [...sections, newSection];
      setSections(updatedSections);
      setSelectedSection(newSection);
      updateExam(updatedSections);
    }
    setSectionDialog({ open: false, section: null });
  };

  const deleteSection = (sectionId) => {
    const updatedSections = sections.filter(s => s.id !== sectionId);
    setSections(updatedSections);
    if (selectedSection?.id === sectionId) {
      setSelectedSection(updatedSections.length > 0 ? updatedSections[0] : null);
    }
    updateExam(updatedSections);
  };

  // Question management
  const addQuestionToSection = (sectionId, question) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [...section.questions, { ...question, sectionId }]
        };
      }
      return section;
    });
    setSections(updatedSections);
    updateExam(updatedSections);
  };

  const removeQuestionFromSection = (sectionId, questionId) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        };
      }
      return section;
    });
    setSections(updatedSections);
    updateExam(updatedSections);
  };

  const moveQuestionWithinSection = (sectionId, fromIndex, toIndex) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        const questions = [...section.questions];
        const [moved] = questions.splice(fromIndex, 1);
        questions.splice(toIndex, 0, moved);
        return { ...section, questions };
      }
      return section;
    });
    setSections(updatedSections);
    updateExam(updatedSections);
  };

  // Update exam data
  const updateExam = (updatedSections) => {
    if (onSubmit) {
      onSubmit(updatedSections);
    }
  };

  // Question preview
  const previewQuestion = (question) => {
    setQuestionPreview({ open: true, question });
  };

  return (
    <Box sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Xây dựng cấu trúc bài thi
        </Typography>
        <Typography color="text.secondary" paragraph>
          Quản lý các phần thi và thêm câu hỏi vào từng phần.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ flex: 1, height: '100%' }}>
        {/* Left Panel - Sections */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ flex: 1 }}>
                Phần thi ({sections.length})
              </Typography>
              <IconButton onClick={addSection} color="primary">
                <AddIcon />
              </IconButton>
            </Box>
            
            <List sx={{ p: 0 }}>
              {sections.map((section, index) => (
                <ListItem
                  key={section.id}
                  sx={{
                    mb: 1,
                    p: 0,
                    border: selectedSection?.id === section.id ? '2px solid' : '1px solid',
                    borderColor: selectedSection?.id === section.id ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedSection(section)}
                >
                  <Card sx={{ width: '100%' }}>
                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DragIcon sx={{ color: 'text.secondary', mr: 1 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2">
                            {section.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {section.questions.length} câu hỏi
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              editSection(section);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSection(section.id);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Middle Panel - Section Questions */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              {selectedSection ? `${selectedSection.name}` : 'Chọn phần để xem câu hỏi'}
            </Typography>
            
            {selectedSection && (
              <Box>
                {selectedSection.questions.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    <Typography>Chưa có câu hỏi</Typography>
                    <Typography variant="body2">Thêm câu hỏi từ ngân hàng bên phải</Typography>
                  </Box>
                ) : (
                  <List dense sx={{ p: 0 }}>
                    {selectedSection.questions.map((question, index) => (
                      <ListItem key={question.id} sx={{ mb: 1, p: 0 }}>
                        <Card sx={{ width: '100%' }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <DragIcon sx={{ color: 'text.secondary', mr: 1 }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" noWrap>
                                  {index + 1}. {question.title}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                  <Chip 
                                    label={question.question_type} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                  <Chip 
                                    label={question.skill} 
                                    size="small" 
                                    color="primary"
                                    variant="outlined"
                                  />
                                  <Chip 
                                    label={question.difficulty} 
                                    size="small"
                                    color={
                                      question.difficulty === 'easy' ? 'success' :
                                      question.difficulty === 'medium' ? 'warning' : 'error'
                                    }
                                    variant="outlined"
                                  />
                                </Box>
                              </Box>
                              <Box>
                                <IconButton 
                                  size="small"
                                  onClick={() => previewQuestion(question)}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small"
                                  onClick={() => removeQuestionFromSection(selectedSection.id, question.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Panel - Available Questions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Ngân hàng câu hỏi
            </Typography>
            
            {/* Search and filters */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm câu hỏi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                }}
                sx={{ mb: 1 }}
              />
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Kỹ năng</InputLabel>
                    <Select
                      value={filterSkill}
                      onChange={(e) => setFilterSkill(e.target.value)}
                      label="Kỹ năng"
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      <MenuItem value="speaking">Speaking</MenuItem>
                      <MenuItem value="writing">Writing</MenuItem>
                      <MenuItem value="reading">Reading</MenuItem>
                      <MenuItem value="listening">Listening</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Loại</InputLabel>
                    <Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      label="Loại"
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      <MenuItem value="mcq">MCQ</MenuItem>
                      <MenuItem value="matching">Matching</MenuItem>
                      <MenuItem value="gap_filling">Gap Filling</MenuItem>
                      <MenuItem value="ordering">Ordering</MenuItem>
                      <MenuItem value="writing">Writing</MenuItem>
                      <MenuItem value="speaking">Speaking</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Độ khó</InputLabel>
                    <Select
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                      label="Độ khó"
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      <MenuItem value="easy">Dễ</MenuItem>
                      <MenuItem value="medium">Trung bình</MenuItem>
                      <MenuItem value="hard">Khó</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Available questions list */}
            <Box sx={{ flex: 1, overflow: 'auto', border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 1 }}>
              {filteredQuestions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <QuestionIcon sx={{ fontSize: 48, mb: 1 }} />
                  <Typography>Không tìm thấy câu hỏi</Typography>
                </Box>
              ) : (
                filteredQuestions.map((question, index) => (
                  <Card key={question.id} sx={{ mb: 1, cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}>
                    <CardContent sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <DragIcon sx={{ color: 'text.secondary', mr: 1, mt: 0.5 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                            {question.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                            <Chip 
                              label={question.question_type} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                            <Chip 
                              label={question.skill} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                            <Chip 
                              label={question.difficulty} 
                              size="small"
                              color={
                                question.difficulty === 'easy' ? 'success' :
                                question.difficulty === 'medium' ? 'warning' : 'error'
                              }
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          </Box>
                        </Box>
                        <Box>
                          <IconButton 
                            size="small"
                            onClick={() => previewQuestion(question)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          {selectedSection && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => addQuestionToSection(selectedSection.id, question)}
                              sx={{ ml: 1 }}
                            >
                              Thêm
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Section Dialog */}
      <SectionDialog
        open={sectionDialog.open}
        section={sectionDialog.section}
        onSave={saveSection}
        onClose={() => setSectionDialog({ open: false, section: null })}
      />

      {/* Question Preview Dialog */}
      <QuestionPreviewDialog
        open={questionPreview.open}
        question={questionPreview.question}
        onClose={() => setQuestionPreview({ open: false, question: null })}
      />
    </Box>
  );
};


// Question Preview Dialog Component
const QuestionPreviewDialog = ({ open, question, onClose }) => {
  if (!question) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Xem trước câu hỏi
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            {question.title}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label={question.question_type} color="primary" />
            <Chip label={question.skill} />
            <Chip 
              label={question.difficulty}
              color={
                question.difficulty === 'easy' ? 'success' :
                question.difficulty === 'medium' ? 'warning' : 'error'
              }
            />
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            {question.description}
          </Typography>
          
          {question.question_data && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Nội dung câu hỏi:
              </Typography>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {JSON.stringify(question.question_data, null, 2)}
              </pre>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExamBuilder;