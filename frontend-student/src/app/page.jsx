'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    if (token) {
      // Redirect to dashboard if logged in
      redirect('/home');
    } else {
      // Redirect to login if not logged in
      redirect('/login');
    }
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div className="spinner" />
    </div>
  );
}