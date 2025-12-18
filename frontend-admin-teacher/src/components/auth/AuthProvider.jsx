'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuth } from '@/store/slices/authSlice';

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Set hydrated first to prevent SSR mismatch
    setIsHydrated(true);
    
    // Then check authentication state
    console.log('[AuthProvider] Checking auth on startup');
    dispatch(checkAuth());
  }, [dispatch]);

  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return children;
  }

  return children;
}