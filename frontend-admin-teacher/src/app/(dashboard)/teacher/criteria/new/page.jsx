'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { createCriteria, fetchCriteria } from '@/store/slices/criteriaSlice';
import { showNotification } from '@/store/slices/uiSlice';
import CriteriaFormPage from '@/components/teacher/criteria/CriteriaFormPage';

export default function NewCriteriaPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const handleSave = async (criteriaData) => {
    try {
      setLoading(true);
      
      console.log('Submitting criteria data:', criteriaData);
      const result = await dispatch(createCriteria(criteriaData));
      
      if (result.type === createCriteria.fulfilled.type) {
        dispatch(showNotification({ 
          type: 'success', 
          message: 'Tạo tiêu chí thành công' 
        }));
        
        // Refetch list and navigate back
        dispatch(fetchCriteria({ page: 1, limit: 10 }));
        router.push('/teacher/criteria');
      } else if (result.type === createCriteria.rejected.type) {
        dispatch(showNotification({ 
          type: 'error', 
          message: result.payload || 'Tạo tiêu chí thất bại' 
        }));
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      dispatch(showNotification({ 
        type: 'error', 
        message: error.message || 'Tạo tiêu chí thất bại' 
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <CriteriaFormPage
      onSave={handleSave}
      criteria={null}
      loading={loading}
      pageTitle="Tạo tiêu chí chấm điểm"
    />
  );
}
