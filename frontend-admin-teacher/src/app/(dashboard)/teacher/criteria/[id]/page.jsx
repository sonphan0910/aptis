'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  CircularProgress,
  Button
} from '@mui/material';
import { fetchCriteriaById, updateCriteria, fetchCriteria } from '@/store/slices/criteriaSlice';
import { showNotification } from '@/store/slices/uiSlice';
import CriteriaFormPage from '@/components/teacher/criteria/CriteriaFormPage';
import CriteriaPreview from '@/components/teacher/criteria/CriteriaPreview';

export default function CriteriaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { currentCriteria, isLoading: criteriaLoading, error } = useSelector(state => state.criteria);

  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const criteriaId = params.id;
  const isEditMode = searchParams.get('edit') === 'true';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && criteriaId) {
      console.log('[Page] Fetching criteria with ID:', criteriaId);
      dispatch(fetchCriteriaById(criteriaId)).then((result) => {
        console.log('[Page] fetchCriteriaById result:', result);
        if (result.type === fetchCriteriaById.rejected.type) {
          console.error('Failed to fetch criteria:', result.payload);
          // Redirect to list if criteria not found
          setTimeout(() => router.push('/teacher/criteria'), 1500);
        }
      });
    }
  }, [isMounted, criteriaId, dispatch, router]);

  const handleSave = async (criteriaData) => {
    try {
      setLoading(true);

      console.log('Updating criteria with id:', criteriaId, 'data:', criteriaData);
      const result = await dispatch(updateCriteria({ id: criteriaId, criteriaData }));
      
      if (result.type === updateCriteria.fulfilled.type) {
        dispatch(showNotification({
          type: 'success',
          message: 'Cập nhật tiêu chí thành công'
        }));

        dispatch(fetchCriteria({ page: 1, limit: 10 }));
        router.push('/teacher/criteria');
      } else if (result.type === updateCriteria.rejected.type) {
        dispatch(showNotification({
          type: 'error',
          message: result.payload || 'Cập nhật tiêu chí thất bại'
        }));
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      dispatch(showNotification({
        type: 'error',
        message: error.message || 'Cập nhật tiêu chí thất bại'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/teacher/criteria/${criteriaId}?edit=true`);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  if (criteriaLoading || !isMounted) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !currentCriteria) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Không tìm thấy tiêu chí
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {error || 'Tiêu chí này có thể đã bị xóa hoặc không tồn tại.'}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => router.push('/teacher/criteria')}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  // Edit mode: Show form
  if (isEditMode) {
    return (
      <CriteriaFormPage
        onSave={handleSave}
        criteria={currentCriteria}
        loading={loading}
        pageTitle="Chỉnh sửa tiêu chí chấm điểm"
      />
    );
  }

  // View mode: Show preview
  return (
    <>
      <CriteriaPreview
        open={true}
        onClose={() => router.push('/teacher/criteria')}
        criteria={currentCriteria}
      />
      {showPreview && (
        <CriteriaPreview
          open={showPreview}
          onClose={() => setShowPreview(false)}
          criteria={currentCriteria}
        />
      )}
    </>
  );
}
