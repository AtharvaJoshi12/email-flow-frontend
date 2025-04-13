"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FlowBuilder from '../../components/FlowBuilder';

const DashboardPage = () => {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
    } else {
      // Optionally, validate token with backend here
      setAuthChecked(true);
    }
  }, []);

  if (!authChecked) return <div className="text-center mt-10">🔒 Checking authentication...</div>;

  return (
    <div className="p-4">
      <FlowBuilder />
    </div>
  );
};

export default DashboardPage;
