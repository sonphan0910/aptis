'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    if (token) {
      // Redirect to dashboard if logged in
      router.push('/home');
    } else {
      // Redirect to login if not logged in
      router.push('/login');
    }
  }, [router]);

  return null;
}