import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminProtectedRoute({ children }) {
  const { currentAdmin, authReady } = useAdminAuth();

  if (!authReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-600">
        Loading admin portal...
      </div>
    );
  }

  if (!currentAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
