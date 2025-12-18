'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress
} from '@mui/material';
import { Save, ArrowBack, Delete } from '@mui/icons-material';
import QuestionForm from '@/components/teacher/questions/QuestionForm';
import QuestionPreview from '@/components/teacher/questions/QuestionPreview';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { fetchQuestion, updateQuestion, deleteQuestion } from '@/store/slices/questionSlice';
import { showNotification } from '@/store/slices/uiSlice';

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  
  const questionId = params.qId;
  const { currentQuestion, loading } = useSelector(state => state.question);
  
  const [questionData, setQuestionData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (questionId) {
      dispatch(fetchQuestion(questionId));
    }
  }, [questionId, dispatch]);

  useEffect(() => {
    if (currentQuestion) {
      setQuestionData(currentQuestion);
    }
  }, [currentQuestion]);

  const handleFormSubmit = (data) => {
    setQuestionData(data);
    setShowPreview(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await dispatch(updateQuestion({
        id: questionId,
        data: questionData
      }));
      
      if (updateQuestion.fulfilled.match(result)) {
        dispatch(showNotification({
          message: 'Cập nhật câu hỏi thành công!',
          type: 'success'
        }));
        router.push('/teacher/questions');
      }
    } catch (error) {
      dispatch(showNotification({
        message: 'Có lỗi xảy ra khi cập nhật câu hỏi',
        type: 'error'
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await dispatch(deleteQuestion(questionId));
      
      if (deleteQuestion.fulfilled.match(result)) {
        dispatch(showNotification({
          message: 'Xóa câu hỏi thành công!',
          type: 'success'
        }));
        router.push('/teacher/questions');
      }
    } catch (error) {
      dispatch(showNotification({
        message: 'Có lỗi xảy ra khi xóa câu hỏi',
        type: 'error'
      }));
    }
    setConfirmDelete(false);
  };

  if (loading || !questionData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/teacher/questions')}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Chỉnh sửa câu hỏi
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setConfirmDelete(true)}
          >
            Xóa
          </Button>
          <Button
            variant="outlined"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Chỉnh sửa' : 'Xem trước'}
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          {showPreview ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Xem trước câu hỏi
              </Typography>
              <QuestionPreview
                question={questionData}
                showActions={false}
              />
              <Box mt={3} display="flex" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => setShowPreview(false)}
                >
                  Quay lại chỉnh sửa
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                >
                  Lưu thay đổi
                </Button>
              </Box>
            </Box>
          ) : (
            <QuestionForm
              questionType={questionData.question_type}
              initialData={questionData}
              onSubmit={handleFormSubmit}
              isEditing={true}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Xóa câu hỏi"
        content={`Bạn có chắc muốn xóa câu hỏi "${questionData?.title}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </Box>
  );
}