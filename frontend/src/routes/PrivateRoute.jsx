import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';

function PrivateRoute({ children, roles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Redirect to home page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (roles.length > 0 && !roles.includes(user.user_type)) {
    // User doesn't have required role, redirect to dashboard or show unauthorized
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PrivateRoute;
