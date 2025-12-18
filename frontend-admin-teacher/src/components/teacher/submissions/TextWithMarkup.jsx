'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Popover,
  Button,
  TextField,
  Chip,
  Paper,
  ButtonGroup
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  HighlightAlt,
  Comment,
  Spellcheck,
  Error,
  CheckCircle,
  Warning,
  Info,
  Delete,
  Edit
} from '@mui/icons-material';

const markupTypes = [
  { 
    type: 'highlight', 
    label: 'Highlight', 
    icon: HighlightAlt, 
    color: '#ffeb3b',
    textColor: '#000'
  },
  { 
    type: 'error', 
    label: 'Lỗi', 
    icon: Error, 
    color: '#f44336',
    textColor: '#fff'
  },
  { 
    type: 'warning', 
    label: 'Cảnh báo', 
    icon: Warning, 
    color: '#ff9800',
    textColor: '#000'
  },
  { 
    type: 'suggestion', 
    label: 'Gợi ý', 
    icon: Info, 
    color: '#2196f3',
    textColor: '#fff'
  },
  { 
    type: 'correct', 
    label: 'Đúng', 
    icon: CheckCircle, 
    color: '#4caf50',
    textColor: '#fff'
  }
];

export default function TextWithMarkup({ 
  text, 
  markups = [], 
  onMarkupsChange,
  readonly = false,
  showToolbar = true 
}) {
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [commentAnchor, setCommentAnchor] = useState(null);
  const [currentComment, setCurrentComment] = useState('');
  const [editingMarkup, setEditingMarkup] = useState(null);
  const textRef = useRef(null);

  const handleTextSelection = () => {
    if (readonly) return;
    
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    if (selectedText && textRef.current?.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const start = getTextOffset(textRef.current, range.startContainer, range.startOffset);
      const end = start + selectedText.length;
      
      setSelectedText(selectedText);
      setSelectionRange({ start, end });
      
      // Position toolbar near selection
      const rect = range.getBoundingClientRect();
      const anchorPosition = {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      };
      
      setAnchorEl(anchorPosition);
    } else {
      setSelectedText('');
      setSelectionRange(null);
      setAnchorEl(null);
    }
  };

  const getTextOffset = (root, node, offset) => {
    let textOffset = 0;
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let currentNode;
    while (currentNode = walker.nextNode()) {
      if (currentNode === node) {
        return textOffset + offset;
      }
      textOffset += currentNode.textContent.length;
    }
    return textOffset;
  };

  const addMarkup = (type, comment = '') => {
    if (!selectionRange || !onMarkupsChange) return;

    const newMarkup = {
      id: Date.now(),
      type,
      start: selectionRange.start,
      end: selectionRange.end,
      text: selectedText,
      comment,
      timestamp: new Date().toISOString()
    };

    onMarkupsChange([...markups, newMarkup]);
    setAnchorEl(null);
    setSelectedText('');
    setSelectionRange(null);
    
    // Clear selection
    window.getSelection().removeAllRanges();
  };

  const deleteMarkup = (markupId) => {
    if (!onMarkupsChange) return;
    onMarkupsChange(markups.filter(m => m.id !== markupId));
  };

  const openCommentDialog = (type) => {
    setEditingMarkup(type);
    setCurrentComment('');
    setCommentAnchor(anchorEl);
  };

  const saveWithComment = () => {
    if (editingMarkup) {
      addMarkup(editingMarkup, currentComment);
      setCommentAnchor(null);
      setEditingMarkup(null);
      setCurrentComment('');
    }
  };

  const renderTextWithMarkups = () => {
    if (!text) return '';
    
    // Sort markups by start position
    const sortedMarkups = [...markups].sort((a, b) => a.start - b.start);
    
    let result = [];
    let currentPos = 0;

    sortedMarkups.forEach((markup, index) => {
      // Add text before markup
      if (currentPos < markup.start) {
        result.push(text.slice(currentPos, markup.start));
      }

      // Add marked up text
      const markupType = markupTypes.find(t => t.type === markup.type);
      const style = {
        backgroundColor: markupType?.color || '#ffeb3b',
        color: markupType?.textColor || '#000',
        padding: '2px 4px',
        borderRadius: '2px',
        position: 'relative',
        cursor: readonly ? 'help' : 'pointer'
      };

      result.push(
        <span
          key={markup.id}
          style={style}
          title={markup.comment || markupType?.label}
          onClick={() => {
            if (markup.comment) {
              alert(`${markupType?.label}: ${markup.comment}`);
            }
          }}
        >
          {markup.text}
          {!readonly && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                deleteMarkup(markup.id);
              }}
              style={{
                position: 'absolute',
                top: -10,
                right: -10,
                width: 16,
                height: 16,
                backgroundColor: '#f44336',
                color: '#fff'
              }}
            >
              <Delete style={{ fontSize: 10 }} />
            </IconButton>
          )}
        </span>
      );

      currentPos = markup.end;
    });

    // Add remaining text
    if (currentPos < text.length) {
      result.push(text.slice(currentPos));
    }

    return result;
  };

  useEffect(() => {
    if (!readonly) {
      document.addEventListener('selectionchange', handleTextSelection);
      return () => {
        document.removeEventListener('selectionchange', handleTextSelection);
      };
    }
  }, [readonly]);

  return (
    <Box>
      {/* Toolbar for selection */}
      {showToolbar && !readonly && (
        <Popover
          open={Boolean(anchorEl)}
          anchorReference="anchorPosition"
          anchorPosition={anchorEl}
          onClose={() => setAnchorEl(null)}
        >
          <Paper sx={{ p: 1 }}>
            <Typography variant="caption" gutterBottom display="block">
              "{selectedText?.substring(0, 30)}..."
            </Typography>
            <ButtonGroup size="small">
              {markupTypes.map((markupType) => {
                const Icon = markupType.icon;
                return (
                  <Tooltip key={markupType.type} title={markupType.label}>
                    <Button
                      startIcon={<Icon />}
                      onClick={() => {
                        if (markupType.type === 'comment' || markupType.type === 'error') {
                          openCommentDialog(markupType.type);
                        } else {
                          addMarkup(markupType.type);
                        }
                      }}
                    >
                      {markupType.label}
                    </Button>
                  </Tooltip>
                );
              })}
            </ButtonGroup>
          </Paper>
        </Popover>
      )}

      {/* Comment Dialog */}
      <Popover
        open={Boolean(commentAnchor)}
        anchorReference="anchorPosition"
        anchorPosition={commentAnchor}
        onClose={() => setCommentAnchor(null)}
      >
        <Paper sx={{ p: 2, width: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            Thêm nhận xét
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={currentComment}
            onChange={(e) => setCurrentComment(e.target.value)}
            placeholder="Nhập nhận xét của bạn..."
            size="small"
          />
          <Box mt={2} display="flex" gap={1} justifyContent="flex-end">
            <Button
              size="small"
              onClick={() => setCommentAnchor(null)}
            >
              Hủy
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={saveWithComment}
              disabled={!currentComment.trim()}
            >
              Lưu
            </Button>
          </Box>
        </Paper>
      </Popover>

      {/* Text Content */}
      <Box
        ref={textRef}
        sx={{
          p: 2,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          minHeight: 200,
          fontSize: 14,
          lineHeight: 1.6,
          userSelect: readonly ? 'none' : 'text',
          backgroundColor: readonly ? 'grey.50' : 'background.paper'
        }}
        onMouseUp={handleTextSelection}
      >
        {renderTextWithMarkups()}
      </Box>

      {/* Markup Legend */}
      {markups.length > 0 && (
        <Box mt={2}>
          <Typography variant="caption" gutterBottom display="block">
            Chú thích:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {markupTypes
              .filter(type => markups.some(m => m.type === type.type))
              .map((type) => {
                const Icon = type.icon;
                const count = markups.filter(m => m.type === type.type).length;
                return (
                  <Chip
                    key={type.type}
                    icon={<Icon />}
                    label={`${type.label} (${count})`}
                    size="small"
                    style={{
                      backgroundColor: type.color,
                      color: type.textColor
                    }}
                  />
                );
              })}
          </Box>
        </Box>
      )}
    </Box>
  );
}