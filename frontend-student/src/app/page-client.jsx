'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import LandingPage from '@/components/landing/LandingPage';

export default function HomePageClient() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) {
        // Use replace to avoid back button issues
        router.replace('/home');
      } else {
        // Show landing page for unauthenticated users
        setShowLanding(true);
      }
    }
  }, [isAuthenticated, isInitialized, router]);

  // Show loading while determining auth status
  if (!isInitialized) {
    return <LoadingSpinner message="Đang khởi tạo..." />;
  }

  // Show landing page for unauthenticated users
  if (showLanding && !isAuthenticated) {
    return <LandingPage />;
  }

  // Show loading during redirect
  return <LoadingSpinner message="Đang chuyển hướng..." />;
}
