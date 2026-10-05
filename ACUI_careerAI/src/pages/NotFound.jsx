import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-4 text-center">
      <AlertCircle className="w-24 h-24 text-blue-500 mb-6" />
      <h1 className="text-5xl font-bold text-white mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-300 mb-6">Page Not Found</h2>
      <p className="text-gray-400 max-w-md mx-auto mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/dashboard" 
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
