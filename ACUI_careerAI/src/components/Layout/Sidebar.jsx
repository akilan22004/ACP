import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, BookOpen, CheckSquare, BarChart2, Award, Search, User, LogOut, Bot } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { currentUser, logout } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/careers', icon: <Briefcase size={20} />, label: 'Careers' },
    { to: '/learning', icon: <BookOpen size={20} />, label: 'Learning' },
    { to: '/assessment', icon: <CheckSquare size={20} />, label: 'Assessment' },
    { to: '/mock-interview', icon: <Bot size={20} />, label: 'Mock Interview' },
    { to: '/skill-analysis', icon: <BarChart2 size={20} />, label: 'Skill Analysis' },
    { to: '/certificate', icon: <Award size={20} />, label: 'Certificate' },
    { to: '/jobs', icon: <Search size={20} />, label: 'Jobs' },
    { to: '/profile', icon: <User size={20} />, label: 'Profile' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div id="career-dashboard-sidebar" className={`career-sidebar fixed inset-y-0 left-0 z-30 w-64 border-r border-navy-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col no-print`}>
        <div className="career-sidebar-brand flex items-center h-16 border-b border-navy-700 px-6">
          <h1 className="text-lg font-semibold text-white flex items-center gap-2">
            <img className="careerai-brand-logo" src="/images/careerai-logo.png" alt="CareerAI" />
          </h1>
        </div>
        
        <nav aria-label="Main navigation" className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => { if(window.innerWidth < 1024) toggleSidebar() }}
              className={({ isActive }) =>
                `career-sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'is-active bg-blue-600 bg-opacity-20 text-blue-400 border border-blue-500/30' 
                    : 'text-gray-400 hover:bg-navy-700 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="career-sidebar-account mx-3 mb-3 flex items-center gap-2.5 rounded-lg px-2.5 py-2">
          <span className="career-account-mark">{currentUser?.name?.trim()?.charAt(0)?.toUpperCase() || 'U'}</span>
          <span className="min-w-0"><strong>{currentUser?.name || 'CareerAI learner'}</strong><small>Personal workspace</small></span>
        </div>
        <div className="p-3 border-t border-navy-700">
          <button 
            onClick={handleLogout}
            className="career-sidebar-logout flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
