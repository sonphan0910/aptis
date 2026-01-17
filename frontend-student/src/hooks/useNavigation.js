'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Custom hook for handling navigation with loading states
 * Prevents flicker during page transitions
 */
export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = useCallback((path, options = {}) => {
    if (pathname === path) return;

    setIsNavigating(true);
    
    const method = options.replace ? 'replace' : 'push';
    router[method](path);
    
    // Clear loading state after transition
    const timeout = setTimeout(() => {
      setIsNavigating(false);
    }, options.delay || 300);

    return () => clearTimeout(timeout);
  }, [router, pathname]);

  const navigateToHome = useCallback(() => navigate('/home'), [navigate]);
  const navigateToExams = useCallback(() => navigate('/exams'), [navigate]);
  const navigateToLogin = useCallback(() => navigate('/login', { replace: true }), [navigate]);
  const navigateToProfile = useCallback(() => navigate('/profile'), [navigate]);
  const navigateToPractice = useCallback(() => navigate('/practice'), [navigate]);
  const navigateToResults = useCallback(() => navigate('/results'), [navigate]);

  const navigateToExam = useCallback((examId) => {
    navigate(`/exams/${examId}`);
  }, [navigate]);

  const navigateToExamTake = useCallback((examId, attemptId = null) => {
    const url = attemptId 
      ? `/exams/${examId}/take?attemptId=${attemptId}`
      : `/exams/${examId}/take`;
    navigate(url);
  }, [navigate]);

  const navigateToResult = useCallback((attemptId) => {
    navigate(`/results/${attemptId}`);
  }, [navigate]);

  return {
    navigate,
    isNavigating,
    pathname,
    // Convenience methods
    navigateToHome,
    navigateToExams,
    navigateToLogin,
    navigateToProfile,
    navigateToPractice,
    navigateToResults,
    navigateToExam,
    navigateToExamTake,
    navigateToResult,
  };
}