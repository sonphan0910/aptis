'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Rating,
  IconButton
} from '@mui/material';
import { Close, School, Assignment, Star } from '@mui/icons-material';

export default function CriteriaPreview({ open, onClose, criteria }) {
  if (!criteria) return null;

  const renderRubricLevel = (level) => (
    <Card key={level.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h6" color="primary">
            Level {level.level_number}: {level.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Rating value={level.level_number} max={criteria.max_score} readOnly size="small" />
            <Typography variant="body2" color="text.secondary">
              {level.level_number}/{criteria.max_score} điểm
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          {level.description}
        </Typography>
        {level.indicators && level.indicators.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Chỉ báo đánh giá:
            </Typography>
            {level.indicators.map((indicator, index) => (
              <Chip
                key={index}
                label={indicator}
                variant="outlined"
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Assignment color="primary" />
            <Typography variant="h5">
              Preview Tiêu chí chấm điểm
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            {criteria.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {criteria.description}
          </Typography>
          
          <Box display="flex" gap={2} mb={2}>
            <Chip 
              icon={<School />} 
              label={`${criteria.question_type} - ${criteria.aptis_type}`} 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label={`Kỹ năng: ${criteria.skill}`} 
              color="secondary" 
              variant="outlined" 
            />
            <Chip 
              icon={<Star />} 
              label={`Điểm tối đa: ${criteria.max_score}`} 
              color="warning" 
              variant="outlined" 
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Thang điểm chi tiết
        </Typography>

        {criteria.rubric_levels && criteria.rubric_levels.length > 0 ? (
          <Box>
            {criteria.rubric_levels
              .sort((a, b) => b.level_number - a.level_number)
              .map(renderRubricLevel)}
          </Box>
        ) : (
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Typography color="text.secondary">
              Chưa có thang điểm chi tiết được định nghĩa
            </Typography>
          </Paper>
        )}

        {criteria.guidelines && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Hướng dẫn chấm điểm
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
              <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                {criteria.guidelines}
              </Typography>
            </Paper>
          </>
        )}

        {criteria.examples && criteria.examples.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Ví dụ mẫu
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Điểm</TableCell>
                    <TableCell>Ví dụ câu trả lời</TableCell>
                    <TableCell>Giải thích</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {criteria.examples.map((example, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip 
                          label={example.score} 
                          color={example.score >= criteria.max_score * 0.8 ? 'success' : 
                                example.score >= criteria.max_score * 0.5 ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{example.response}</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {example.explanation}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Đóng
        </Button>
        <Button 
          variant="contained" 
          onClick={() => {
            onClose();
            // Navigate to edit if needed
          }}
        >
          Chỉnh sửa
        </Button>
      </DialogActions>
    </Dialog>
  );
}