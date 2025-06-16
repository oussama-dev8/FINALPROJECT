import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import UserMenu from '../navigation/UserMenu';
import DashboardSidebar from '../navigation/DashboardSidebar';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="fixed top-0 right-0 left-0 h-16 bg-gray-900 border-b border-gray-800 z-40 flex items-center justify-between px-4">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <Bars3Icon className="h-5 w-5" />
            )}
          </button>
        </div>
        
        <div className="flex items-center">
          <UserMenu />
        </div>
      </div>

      {/* Sidebar and Main Content */}
      <div className="flex h-screen overflow-hidden pt-16">
        {/* Sidebar */}
        <div 
          className={`h-full flex-shrink-0 transition-all duration-200 ease-in-out ${
            sidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          <div className="h-full bg-gray-900 border-r border-gray-800">
            <DashboardSidebar isOpen={sidebarOpen} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-gray-900 text-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default DashboardLayout;
