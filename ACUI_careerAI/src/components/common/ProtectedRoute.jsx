import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCareer } from '../../context/CareerContext';

export default function ProtectedRoute({ children }) {
  const { currentUser, authReady } = useAuth();
  const { progressReady } = useCareer();

  if (!authReady) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!progressReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900 text-gray-400" role="status">
        <span className="learning-loading-mark mr-3" /> Restoring your career progress…
      </div>
    );
  }

  return children;
}
