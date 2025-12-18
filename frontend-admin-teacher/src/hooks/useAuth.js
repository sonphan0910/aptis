'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { checkAuth, logout } from '@/store/slices/authSlice';

export function useAuth(redirectTo = '/login') {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, loading, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    // Kiểm tra authentication khi component mount
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    // Redirect nếu chưa đăng nhập
    if (!loading && !isAuthenticated && redirectTo) {
      router.push(redirectTo);
    }
  }, [loading, isAuthenticated, redirectTo, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  return {
    user,
    loading,
    isAuthenticated,
    logout: handleLogout,
    hasRole,
    hasAnyRole
  };
}