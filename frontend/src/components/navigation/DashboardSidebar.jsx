import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

function DashboardSidebar({ isOpen = true }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isTeacher } = useAuth();

  // Menu items configuration
  const menuItems = [
    { 
      path: '/dashboard', 
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', 
      label: 'Dashboard',
      exact: true,
      show: true
    },
    { 
      path: '/dashboard/profile', 
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', 
      label: 'Profile',
      exact: false,
      show: true
    },
    // Student-specific menu items
    { 
      path: '/dashboard/my-courses', 
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', 
      label: 'My Courses',
      exact: false,
      show: !isTeacher
    },
    // Teacher-specific menu items
    { 
      path: '/dashboard/teaching', 
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', 
      label: 'My Teaching',
      exact: false,
      show: isTeacher
    },
    { 
      path: '/courses', 
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', 
      label: 'Browse Courses',
      exact: false,
      show: !isTeacher
    },
    { 
      path: '/dashboard/messages', 
      icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', 
      label: 'Messages',
      exact: false,
      show: true
    },
    { 
      path: '/dashboard/certificates', 
      icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', 
      label: 'Certificates',
      exact: false,
      show: !isTeacher
    },
    { 
      path: '/dashboard/settings', 
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', 
      label: 'Settings',
      exact: false,
      show: true
    },
  ].filter(item => item.show);

  // Function to check if a menu item is active
  const isMenuItemActive = (menuItem) => {
    if (menuItem.exact) {
      return location.pathname === menuItem.path;
    }
    // For non-dashboard paths, check for exact match
    if (!menuItem.path.startsWith('/dashboard/') && menuItem.path !== '/dashboard') {
      return location.pathname === menuItem.path;
    }
    // Special handling for specific paths to avoid matching with other paths
    const exactMatchPaths = ['/dashboard/certificates', '/dashboard/teaching', '/dashboard/my-courses'];
    if (exactMatchPaths.includes(menuItem.path)) {
      return location.pathname === menuItem.path;
    }
    // For other dashboard paths, check if the path starts with the menu item path
    return location.pathname.startsWith(menuItem.path);
  };

  const handleLogout = () => {
    logout(); // Use the logout method from AuthContext
  };

  return (
    <div className={`h-full flex-shrink-0 transition-all duration-200 ease-in-out ${isOpen ? 'w-64' : 'w-16'} flex flex-col`}>
      <div className="bg-gray-900 border-r border-gray-800 flex flex-col flex-1">
        {/* Logo/Collapsed Icon */}
        <div className={`h-16 flex items-center justify-center border-b border-gray-800 ${isOpen ? 'px-2' : 'px-0'}`}>
          <div className="flex items-center justify-center w-full">
            {isOpen ? (
              <div className="flex items-center space-x-2">
                <img 
                  src="/favicon.svg" 
                  alt="Darsy Logo" 
                  className="h-8 w-8"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  Darsy
                </span>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center">
                <img 
                  src="/favicon.svg" 
                  alt="Darsy Logo" 
                  className="h-8 w-8 p-1.5 rounded-md hover:bg-gray-800/50 transition-colors duration-200 mx-auto"
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            if (!item.show) return null;
            const isActive = isMenuItemActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 768) {
                    document.dispatchEvent(new CustomEvent('closeSidebar'));
                  }
                }}
                className={`group flex items-center py-2.5 text-sm rounded-lg transition-colors duration-150 ${
                  isOpen ? 'px-3 mx-2' : 'px-0 w-full justify-center'
                } ${
                  isActive
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'text-gray-400 hover:bg-gray-800/80 hover:text-gray-200'
                }`}
              >
                <div className={`p-1.5 rounded-md flex items-center justify-center ${
                  isActive 
                    ? 'bg-primary-500/10 text-primary-400' 
                    : 'text-gray-500 group-hover:text-gray-300'
                }`}>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={isActive ? '2' : '1.5'}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={item.icon}
                    />
                  </svg>
                </div>
                {isOpen && (
                  <span className={`ml-3 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Logout Button */}
        <div className={`mt-auto p-2 ${isOpen ? 'px-3' : 'px-2'}`}>
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center justify-center py-2.5 rounded-lg
              text-white font-medium text-sm
              bg-gradient-to-r from-red-600 to-red-700
              hover:from-red-700 hover:to-red-800
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
              shadow-lg hover:shadow-red-500/50
              transition-all duration-200 ease-in-out
              relative overflow-hidden group
              ${isOpen ? 'px-4' : 'px-2'}
            `}
          >
            <span className={`flex items-center ${!isOpen ? 'justify-center w-full' : ''}`}>
              <svg 
                className="h-5 w-5 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
              {isOpen && <span className="ml-3">Logout</span>}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardSidebar;
