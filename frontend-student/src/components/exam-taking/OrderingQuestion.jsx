'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  List,
  ListItem,
} from '@mui/material';
import {
  DragIndicator,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';

export default function OrderingQuestion({ question, onAnswerChange }) {
  const [orderedItems, setOrderedItems] = useState([]);

  useEffect(() => {
    if (question.answer_data?.ordered_items) {
      setOrderedItems(question.answer_data.ordered_items);
    } else if (question.question_content?.items) {
      // Initialize with shuffled items
      const items = [...question.question_content.items];
      setOrderedItems(items);
    }
  }, [question.answer_data, question.question_content]);

  const moveItem = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= orderedItems.length) return;
    
    const newItems = [...orderedItems];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    
    setOrderedItems(newItems);
    
    onAnswerChange({
      ordered_items: newItems
    });
  };

  const moveUp = (index) => {
    moveItem(index, index - 1);
  };

  const moveDown = (index) => {
    moveItem(index, index + 1);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Sắp xếp theo thứ tự đúng:
      </Typography>
      
      <Typography variant="body2" color="textSecondary" paragraph>
        Sử dụng các nút mũi tên để sắp xếp các mục theo thứ tự đúng.
      </Typography>
      
      <List>
        {orderedItems.map((item, index) => (
          <ListItem
            key={item.id || index}
            sx={{
              p: 0,
              mb: 1
            }}
          >
            <Paper
              elevation={1}
              sx={{
                width: '100%',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <IconButton
                  size="small"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  sx={{ p: 0.5 }}
                >
                  <ArrowUpward fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => moveDown(index)}
                  disabled={index === orderedItems.length - 1}
                  sx={{ p: 0.5 }}
                >
                  <ArrowDownward fontSize="small" />
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    minWidth: 30,
                    height: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    borderRadius: '50%',
                    fontSize: '0.875rem'
                  }}
                >
                  {index + 1}
                </Typography>
                <DragIndicator color="action" />
              </Box>
              
              <Typography variant="body1" sx={{ flex: 1 }}>
                {item.text}
              </Typography>
            </Paper>
          </ListItem>
        ))}
      </List>
      
      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        Thứ tự hiện tại: {orderedItems.map((_, i) => i + 1).join(' → ')}
      </Typography>
    </Box>
  );
}