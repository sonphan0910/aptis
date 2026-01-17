'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { checkAuthStatus } from '@/store/slices/authSlice';
import LoadingSpinner from '../common/LoadingSpinner';

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function AuthGuard({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [initializing, setInitializing] = useState(true);
  
  const { isAuthenticated, isLoading, isInitialized, token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Quick initialization check
    if (!isInitialized) {
      const storedToken = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      
      if (storedToken && storedUser) {
        // If we have stored credentials, check if they're still valid
        dispatch(checkAuthStatus());
      } else {
        // No stored credentials, mark as initialized quickly
        dispatch({ type: 'auth/setInitialized' });
      }
    }
  }, [dispatch, isInitialized]);

  useEffect(() => {
    // Handle redirects only when fully initialized
    if (isInitialized && !isLoading) {
      const isPublicRoute = publicRoutes.includes(pathname);
      
      // Determine if we need to redirect
      let redirectPath = null;
      
      if (!isAuthenticated && !isPublicRoute && pathname !== '/') {
        redirectPath = '/login';
      } else if (isAuthenticated && isPublicRoute && pathname !== '/') {
        redirectPath = '/home';
      }
      
      if (redirectPath) {
        // Use replace instead of push to avoid flicker
        router.replace(redirectPath);
      } else {
        // No redirect needed, stop initializing
        setInitializing(false);
      }
    }
  }, [isAuthenticated, isInitialized, isLoading, pathname, router]);

  useEffect(() => {
    // Stop initializing when authentication is determined
    if (isInitialized && !isLoading) {
      const timer = setTimeout(() => setInitializing(false), 100);
      return () => clearTimeout(timer);
    }
  }, [isInitialized, isLoading]);

  // Show minimal loading only during initial authentication check
  if (!isInitialized || (isLoading && initializing)) {
    const isPublicRoute = publicRoutes.includes(pathname);
    
    // For public routes, show content immediately if no stored auth
    if (isPublicRoute && !token && !user) {
      return children;
    }
    
    return <LoadingSpinner message="Đang kiểm tra xác thực..." />;
  }

  return children;
}