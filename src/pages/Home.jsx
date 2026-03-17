import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Navigate } from 'react-router-dom';
import ParentHome from '@/components/home/ParentHome';
import NannyHome from '@/components/home/NannyHome';

export default function Home() {
  const { user } = useAuth();
  const role = user?.role;

  if (!role || !user?.onboarding_complete) {
    if (role === 'nanny' && !user?.onboarding_complete) {
      return <Navigate to="/NannyOnboarding" replace />;
    }
    if (!role) {
      return <Navigate to="/Onboarding" replace />;
    }
  }

  if (role === 'admin') return <Navigate to="/AdminDashboard" replace />;
  if (role === 'nanny') return <NannyHome />;
  return <ParentHome />;
}