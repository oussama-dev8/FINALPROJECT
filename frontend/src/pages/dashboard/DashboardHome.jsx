import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';
import StudentDashboard from '@/components/student/StudentDashboard';
import TeacherDashboard from '@/components/teacher/TeacherDashboard';

function DashboardHome() {
  const { user, isAuthenticated, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Show loading state while checking auth
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Render the appropriate dashboard based on user role
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {isTeacher ? (
        <TeacherDashboard user={user} />
      ) : isStudent ? (
        <StudentDashboard user={user} />
      ) : (
        // This should not happen as we redirect unauthenticated users
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-100">Welcome to Your Dashboard</h2>
          <p className="mt-2 text-gray-400">Please contact support to set up your account.</p>
        </div>
      )}
    </div>
  );
}

export default DashboardHome;
