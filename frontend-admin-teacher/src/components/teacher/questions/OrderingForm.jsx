'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { Add, Delete, DragIndicator, ArrowUpward, ArrowDownward } from '@mui/icons-material';

export default function OrderingForm({ content = {}, onChange }) {
  const [instruction, setInstruction] = useState(content.instruction || 'Sắp xếp các mục theo thứ tự đúng');
  const [items, setItems] = useState(content.items || [
    { id: 1, text: '', order: 1 },
    { id: 2, text: '', order: 2 },
    { id: 3, text: '', order: 3 },
    { id: 4, text: '', order: 4 }
  ]);
  const [explanation, setExplanation] = useState(content.explanation || '');

  useEffect(() => {
    onChange({
      instruction,
      items,
      correct_order: items.map(item => item.id),
      explanation
    });
  }, [instruction, items, explanation]);

  const handleItemChange = (index, text) => {
    const newItems = [...items];
    newItems[index].text = text;
    setItems(newItems);
  };

  const addItem = () => {
    const newId = Math.max(...items.map(item => item.id)) + 1;
    const newItem = {
      id: newId,
      text: '',
      order: items.length + 1
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index) => {
    if (items.length > 2) {
      const newItems = items.filter((_, i) => i !== index);
      // Cập nhật lại order
      const updatedItems = newItems.map((item, i) => ({
        ...item,
        order: i + 1
      }));
      setItems(updatedItems);
    }
  };

  const moveItem = (index, direction) => {
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < items.length - 1)
    ) {
      const newItems = [...items];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Hoán đổi vị trí
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      
      // Cập nhật lại order
      const updatedItems = newItems.map((item, i) => ({
        ...item,
        order: i + 1
      }));
      
      setItems(updatedItems);
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        label="Hướng dẫn"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Typography variant="subtitle1" gutterBottom>
        Các mục cần sắp xếp (thứ tự hiện tại là thứ tự đúng)
      </Typography>
      
      <List>
        {items.map((item, index) => (
          <ListItem key={item.id} component={Paper} sx={{ mb: 1, p: 1 }}>
            <DragIndicator sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography sx={{ minWidth: 30, fontWeight: 'bold' }}>
              {item.order}.
            </Typography>
            <TextField
              fullWidth
              placeholder={`Mục ${item.order}`}
              value={item.text}
              onChange={(e) => handleItemChange(index, e.target.value)}
              size="small"
              sx={{ mx: 1 }}
            />
            <ListItemSecondaryAction>
              <Box display="flex" gap={0.5}>
                <IconButton
                  size="small"
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                >
                  <ArrowUpward />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === items.length - 1}
                >
                  <ArrowDownward />
                </IconButton>
                {items.length > 2 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeItem(index)}
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Button
        startIcon={<Add />}
        onClick={addItem}
        variant="outlined"
        sx={{ mb: 3 }}
        disabled={items.length >= 8}
      >
        Thêm mục
      </Button>

      <TextField
        fullWidth
        label="Giải thích"
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        multiline
        rows={3}
        placeholder="Giải thích về thứ tự đúng..."
      />
    </Box>
  );
}