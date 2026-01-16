'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) {
        // Use replace to avoid back button issues
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isInitialized, router]);

  // Show loading while determining auth status
  return <LoadingSpinner message="Đang chuyển hướng..." />;
}