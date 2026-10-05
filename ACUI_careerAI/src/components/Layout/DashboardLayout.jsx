import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Menu } from 'lucide-react';

export default function DashboardLayout() {
  const { currentUser, authReady } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="career-user-app flex h-screen bg-navy-900 overflow-hidden text-white">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile header */}
        <header className="lg:hidden h-16 bg-navy-800 border-b border-navy-700 flex items-center px-4 no-print">
          <button
            type="button"
            aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={sidebarOpen}
            aria-controls="career-dashboard-sidebar"
            onClick={toggleSidebar}
            className="flex h-11 w-11 items-center justify-center rounded-md text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Menu size={24} />
          </button>
          <img className="careerai-brand-logo ml-4" src="/images/careerai-logo.png" alt="CareerAI" />
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-navy-900">
          <div className="container mx-auto px-4 py-8 md:px-8 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
