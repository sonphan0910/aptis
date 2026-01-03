'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { checkAuthStatus } from '@/store/slices/authSlice';
import LoadingSpinner from '../common/LoadingSpinner';

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function AuthGuard({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  
  const { isAuthenticated, isLoading, isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication status when app loads
    if (!isInitialized) {
      // Only check auth status if we have a token
      const hasToken = !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
      
      if (hasToken) {
        dispatch(checkAuthStatus());
      } else {
        // If no token, just mark as initialized
        dispatch({ type: 'auth/setInitialized' });
      }
    }
  }, [dispatch, isInitialized]);

  useEffect(() => {
    // Handle redirects after authentication state is determined
    if (isInitialized && !isLoading) {
      const isPublicRoute = publicRoutes.includes(pathname);
      
      if (!isAuthenticated && !isPublicRoute) {
        // Redirect to login if not authenticated and trying to access protected route
        router.push('/login');
      } else if (isAuthenticated && isPublicRoute && pathname !== '/') {
        // Redirect to dashboard if authenticated and trying to access auth pages
        router.push('/home');
      }
    }
  }, [isAuthenticated, isInitialized, isLoading, pathname, router]);

  // Show loading spinner while checking auth status
  if (!isInitialized || isLoading) {
    return <LoadingSpinner />;
  }

  return children;
}