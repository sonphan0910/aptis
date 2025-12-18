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
  CircularProgress,
  Tab,
  Tabs
} from '@mui/material';
import { Save, ArrowBack, Publish, UnpublishedOutlined } from '@mui/icons-material';
import ExamForm from '@/components/teacher/exams/ExamForm';
import ExamBuilder from '@/components/teacher/exams/ExamBuilder';
import ExamPreview from '@/components/teacher/exams/ExamPreview';
import { fetchExamById as fetchExam, updateExam, publishExam, unpublishExam } from '@/store/slices/examSlice';
import { showNotification } from '@/store/slices/uiSlice';

export default function EditExamPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  
  const examId = params.examId;
  const { currentExam, loading } = useSelector(state => state.exam);
  
  const [activeTab, setActiveTab] = useState(0);
  const [examData, setExamData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (examId) {
      dispatch(fetchExam(examId));
    }
  }, [examId, dispatch]);

  useEffect(() => {
    if (currentExam) {
      setExamData(currentExam);
    }
  }, [currentExam]);

  const handleFormSubmit = (data) => {
    setExamData(prev => ({ ...prev, ...data }));
  };

  const handleBuilderSubmit = (sections) => {
    setExamData(prev => ({ ...prev, sections }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await dispatch(updateExam({
        id: examId,
        examData: examData
      }));
      
      if (updateExam.fulfilled.match(result)) {
        dispatch(showNotification({
          message: 'Cập nhật bài thi thành công!',
          type: 'success'
        }));
      }
    } catch (error) {
      dispatch(showNotification({
        message: 'Có lỗi xảy ra khi cập nhật bài thi',
        type: 'error'
      }));
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      if (examData.is_published) {
        await dispatch(unpublishExam(examId));
      } else {
        await dispatch(publishExam(examId));
      }
      
      setExamData(prev => ({ ...prev, is_published: !prev.is_published }));
      
      dispatch(showNotification({
        message: `${!examData.is_published ? 'Công khai' : 'Hủy công khai'} bài thi thành công!`,
        type: 'success'
      }));
    } catch (error) {
      dispatch(showNotification({
        message: 'Có lỗi xảy ra',
        type: 'error'
      }));
    }
  };

  if (loading || !examData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const tabs = [
    { label: 'Thông tin cơ bản', value: 0 },
    { label: 'Xây dựng bài thi', value: 1 },
    { label: 'Xem trước', value: 2 }
  ];

  const getTabContent = (tabValue) => {
    switch (tabValue) {
      case 0:
        return (
          <ExamForm
            initialData={examData}
            onSubmit={handleFormSubmit}
            isEditing={true}
          />
        );
      case 1:
        return (
          <ExamBuilder
            examData={examData}
            onSubmit={handleBuilderSubmit}
            isEditing={true}
          />
        );
      case 2:
        return <ExamPreview exam={examData} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/teacher/exams')}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Chỉnh sửa bài thi: {examData.title}
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={handlePublish}
            startIcon={examData.is_published ? <UnpublishedOutlined /> : <Publish />}
            color={examData.is_published ? "warning" : "success"}
          >
            {examData.is_published ? 'Hủy công khai' : 'Công khai'}
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

      <Card>
        <CardContent>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3 }}
          >
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} />
            ))}
          </Tabs>

          {getTabContent(activeTab)}
        </CardContent>
      </Card>
    </Box>
  );
}