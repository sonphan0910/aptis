/**
 * Lazy Loading Question Display Component
 * Chỉ load question details khi cần hiển thị
 */
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert
} from '@mui/material';
import { questionApi } from '../../../services/questionService';

export const LazyQuestionDisplay = ({ questionId, questionOrder, maxScore, compact = false }) => {
  const [questionDetails, setQuestionDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Load question details when component is expanded
  const loadQuestionDetails = async () => {
    if (questionDetails || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await questionApi.getQuestionDetails(questionId);
      console.log('[LazyQuestionDisplay] API Response:', response);
      
      // Handle nested data structure
      const details = response?.data || response;
      console.log('[LazyQuestionDisplay] Processed details:', details);
      
      setQuestionDetails(details);
    } catch (err) {
      setError('Lỗi tải câu hỏi');
      console.error('Failed to load question details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load for non-compact mode
  useEffect(() => {
    if (!compact && isExpanded && !questionDetails) {
      loadQuestionDetails();
    }
  }, [compact, isExpanded, questionDetails]);

  // Handle expand/collapse
  const handleToggle = () => {
    if (!isExpanded && !questionDetails) {
      loadQuestionDetails();
    }
    setIsExpanded(!isExpanded);
  };

  // Compact mode - collapsible
  if (compact) {
    return (
      <Box>
        <Typography 
          variant="body2" 
          fontWeight={500}
          sx={{ cursor: 'pointer', color: 'primary.main' }}
          onClick={handleToggle}
        >
          {`Câu ${questionOrder}: ${isExpanded ? '▼' : '▶'} Xem chi tiết`}
        </Typography>
        
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
          {maxScore && `${maxScore} điểm | `}ID: {questionId}
        </Typography>

        {isExpanded && (
          <Box sx={{ mt: 1, pl: 2, borderLeft: '2px solid #ccc' }}>
            {loading && <CircularProgress size={20} />}
            {error && <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>}
            {questionDetails && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {questionDetails.content 
                  ? (typeof questionDetails.content === 'string'
                      ? questionDetails.content
                      : JSON.stringify(questionDetails.content, null, 2))
                  : '(Chưa có nội dung)'}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  }

  // Full mode - always display
  return (
    <Box>
      <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
        Câu {questionOrder} {maxScore && `(${maxScore} điểm)`}
      </Typography>

      {loading && <CircularProgress size={24} />}
      {error && <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>}
      {questionDetails && (
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            ID: {questionDetails.id} | Loại: {questionDetails.question_type_id} | Khó: {questionDetails.difficulty}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {questionDetails.content 
              ? (typeof questionDetails.content === 'string'
                  ? questionDetails.content
                  : JSON.stringify(questionDetails.content, null, 2))
              : '(Chưa có nội dung)'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};