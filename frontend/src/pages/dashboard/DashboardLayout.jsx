import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/navigation/Navbar';
import DashboardSidebar from '@/components/navigation/DashboardSidebar';

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto focus:outline-none bg-gray-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
