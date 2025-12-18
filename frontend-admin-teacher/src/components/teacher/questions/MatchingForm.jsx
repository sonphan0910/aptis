'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Grid,
  Paper
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

export default function MatchingForm({ content = {}, onChange }) {
  const [instruction, setInstruction] = useState(content.instruction || 'Ghép các mục ở cột trái với cột phải');
  const [leftItems, setLeftItems] = useState(content.left_items || [
    { id: 1, text: '' },
    { id: 2, text: '' },
    { id: 3, text: '' },
    { id: 4, text: '' }
  ]);
  const [rightItems, setRightItems] = useState(content.right_items || [
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' }
  ]);
  const [correctMatches, setCorrectMatches] = useState(content.correct_matches || []);
  const [explanation, setExplanation] = useState(content.explanation || '');

  useEffect(() => {
    onChange({
      instruction,
      left_items: leftItems,
      right_items: rightItems,
      correct_matches: correctMatches,
      explanation
    });
  }, [instruction, leftItems, rightItems, correctMatches, explanation]);

  const handleLeftItemChange = (index, text) => {
    const newItems = [...leftItems];
    newItems[index].text = text;
    setLeftItems(newItems);
  };

  const handleRightItemChange = (index, text) => {
    const newItems = [...rightItems];
    newItems[index].text = text;
    setRightItems(newItems);
  };

  const addPair = () => {
    const nextNumber = leftItems.length + 1;
    const nextLetter = String.fromCharCode(65 + rightItems.length);
    
    setLeftItems([...leftItems, { id: nextNumber, text: '' }]);
    setRightItems([...rightItems, { id: nextLetter, text: '' }]);
  };

  const removePair = (index) => {
    if (leftItems.length > 2) {
      const newLeftItems = leftItems.filter((_, i) => i !== index);
      const newRightItems = rightItems.filter((_, i) => i !== index);
      
      // Cập nhật lại ID
      const updatedLeftItems = newLeftItems.map((item, i) => ({ ...item, id: i + 1 }));
      const updatedRightItems = newRightItems.map((item, i) => ({ 
        ...item, 
        id: String.fromCharCode(65 + i) 
      }));
      
      setLeftItems(updatedLeftItems);
      setRightItems(updatedRightItems);
      
      // Cập nhật correctMatches
      const newCorrectMatches = correctMatches.filter(match => 
        match.left !== (index + 1) && match.right !== String.fromCharCode(65 + index)
      );
      setCorrectMatches(newCorrectMatches);
    }
  };

  const handleMatchChange = (leftId, rightId) => {
    const newMatches = correctMatches.filter(match => match.left !== leftId);
    if (rightId) {
      newMatches.push({ left: leftId, right: rightId });
    }
    setCorrectMatches(newMatches);
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
        Các cặp ghép
      </Typography>
      
      {leftItems.map((leftItem, index) => {
        const rightItem = rightItems[index];
        const currentMatch = correctMatches.find(match => match.left === leftItem.id);
        
        return (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label={`Mục ${leftItem.id}`}
                  value={leftItem.text}
                  onChange={(e) => handleLeftItemChange(index, e.target.value)}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={1} textAlign="center">
                <Typography variant="h6">↔</Typography>
              </Grid>
              
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label={`Mục ${rightItem.id}`}
                  value={rightItem.text}
                  onChange={(e) => handleRightItemChange(index, e.target.value)}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={1}>
                {leftItems.length > 2 && (
                  <IconButton
                    color="error"
                    onClick={() => removePair(index)}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                )}
              </Grid>
            </Grid>
            
            {/* Hiển thị ghép đúng */}
            <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
              Ghép: {leftItem.id} → {rightItem.id} (Tự động - cùng hàng)
            </Typography>
          </Paper>
        );
      })}

      <Button
        startIcon={<Add />}
        onClick={addPair}
        variant="outlined"
        sx={{ mb: 3 }}
        disabled={leftItems.length >= 8}
      >
        Thêm cặp ghép
      </Button>

      <TextField
        fullWidth
        label="Giải thích"
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        multiline
        rows={3}
        placeholder="Giải thích về các cặp ghép đúng..."
      />
    </Box>
  );
}