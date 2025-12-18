'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { showNotification } from '@/store/slices/uiSlice';

export default function DashboardLayoutPage({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Show welcome message for new sessions
    if (user && sessionStorage.getItem('showWelcome') !== 'false') {
      dispatch(showNotification({
        type: 'success',
        message: `Chào mừng trở lại, ${user.name}!`,
      }));
      sessionStorage.setItem('showWelcome', 'false');
    }
  }, [isAuthenticated, user, router, dispatch]);

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}