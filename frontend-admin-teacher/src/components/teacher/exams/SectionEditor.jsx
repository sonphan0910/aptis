'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  DragIndicator,
  Save,
  Close
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function SectionEditor({ 
  sections = [],
  onSectionsChange,
  selectedSectionId,
  onSectionSelect 
}) {
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [sectionForm, setSectionForm] = useState({ 
    name: '', 
    description: '', 
    instructions: '',
    time_limit: 0 
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddSection = () => {
    setSectionForm({ name: '', description: '', instructions: '', time_limit: 0 });
    setEditingSectionId(null);
    setDialogOpen(true);
  };

  const handleEditSection = (section) => {
    setSectionForm({
      name: section.name || '',
      description: section.description || '',
      instructions: section.instructions || '',
      time_limit: section.time_limit || 0
    });
    setEditingSectionId(section.id);
    setDialogOpen(true);
  };

  const handleSaveSection = () => {
    const newSections = [...sections];
    
    if (editingSectionId) {
      // Edit existing section
      const index = newSections.findIndex(s => s.id === editingSectionId);
      if (index >= 0) {
        newSections[index] = {
          ...newSections[index],
          ...sectionForm
        };
      }
    } else {
      // Add new section
      const newSection = {
        id: Date.now(),
        order_index: sections.length,
        questions: [],
        ...sectionForm
      };
      newSections.push(newSection);
    }
    
    onSectionsChange(newSections);
    setDialogOpen(false);
    setEditingSectionId(null);
  };

  const handleDeleteSection = (sectionId) => {
    const newSections = sections.filter(s => s.id !== sectionId);
    // Re-index sections
    newSections.forEach((section, index) => {
      section.order_index = index;
    });
    onSectionsChange(newSections);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const newSections = Array.from(sections);
    const [reorderedSection] = newSections.splice(result.source.index, 1);
    newSections.splice(result.destination.index, 0, reorderedSection);
    
    // Update order_index
    newSections.forEach((section, index) => {
      section.order_index = index;
    });
    
    onSectionsChange(newSections);
  };

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Phần thi</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={handleAddSection}
        >
          Thêm phần
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <List
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{ maxHeight: 500, overflow: 'auto' }}
            >
              {sections.map((section, index) => (
                <Draggable 
                  key={section.id} 
                  draggableId={section.id.toString()} 
                  index={index}
                >
                  {(provided, snapshot) => (
                    <ListItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      sx={{
                        mb: 1,
                        bgcolor: selectedSectionId === section.id ? 'primary.light' : 'background.paper',
                        border: 1,
                        borderColor: selectedSectionId === section.id ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        cursor: 'pointer',
                        transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                      onClick={() => onSectionSelect(section.id)}
                    >
                      <Box 
                        {...provided.dragHandleProps}
                        sx={{ mr: 2, display: 'flex', alignItems: 'center' }}
                      >
                        <DragIndicator color="action" />
                      </Box>
                      
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1">
                              {section.name || `Part ${index + 1}`}
                            </Typography>
                            <Chip 
                              label={`${(section.questions || []).length} câu`}
                              size="small"
                              color="primary"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            {section.description && (
                              <Typography variant="body2" color="text.secondary">
                                {section.description}
                              </Typography>
                            )}
                            {section.time_limit > 0 && (
                              <Chip 
                                label={`${section.time_limit} phút`}
                                size="small"
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSection(section);
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(section.id);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      {sections.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">
            Chưa có phần thi nào. Nhấn "Thêm phần" để bắt đầu.
          </Typography>
        </Box>
      )}

      {/* Section Form Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSectionId ? 'Chỉnh sửa phần thi' : 'Thêm phần thi mới'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <TextField
              fullWidth
              label="Tên phần"
              value={sectionForm.name}
              onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
              placeholder="Ví dụ: Part 1 - Grammar"
            />
            
            <TextField
              fullWidth
              label="Mô tả"
              multiline
              rows={2}
              value={sectionForm.description}
              onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
              placeholder="Mô tả ngắn gọn về phần thi này..."
            />
            
            <TextField
              fullWidth
              label="Hướng dẫn"
              multiline
              rows={3}
              value={sectionForm.instructions}
              onChange={(e) => setSectionForm({ ...sectionForm, instructions: e.target.value })}
              placeholder="Hướng dẫn chi tiết cho học sinh về phần thi này..."
            />
            
            <TextField
              fullWidth
              label="Thời gian (phút)"
              type="number"
              value={sectionForm.time_limit}
              onChange={(e) => setSectionForm({ ...sectionForm, time_limit: parseInt(e.target.value) || 0 })}
              inputProps={{ min: 0, max: 180 }}
              helperText="Để 0 nếu không giới hạn thời gian riêng cho phần này"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            startIcon={<Save />}
            onClick={handleSaveSection}
            disabled={!sectionForm.name.trim()}
          >
            {editingSectionId ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}