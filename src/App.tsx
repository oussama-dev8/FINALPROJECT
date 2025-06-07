import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { Landing } from './pages/Landing';
import { TeacherDashboard } from './pages/Teacher/TeacherDashboard';
import { StudentDashboard } from './pages/Student/StudentDashboard';
import { BrowseCourses } from './pages/Student/BrowseCourses';
import { VideoRoomPage } from './pages/VideoRoomPage';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginForm />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterForm />} />

      {/* Dashboard Redirect */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Navigate to={user?.userType === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} />
          </ProtectedRoute>
        } 
      />

      {/* Teacher Routes */}
      <Route 
        path="/teacher/dashboard" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <Layout>
              <TeacherDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Student Routes */}
      <Route 
        path="/student/dashboard" 
        element={
          <ProtectedRoute requiredRole="student">
            <Layout>
              <StudentDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/courses" 
        element={
          <ProtectedRoute requiredRole="student">
            <Layout>
              <BrowseCourses />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Video Room */}
      <Route 
        path="/video-room/:lessonId" 
        element={
          <ProtectedRoute>
            <VideoRoomPage />
          </ProtectedRoute>
        } 
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;