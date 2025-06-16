import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardHome from '@/pages/dashboard/DashboardHome';
import ProfilePage from '@/pages/dashboard/ProfilePage';
import MyCourses from '@/pages/dashboard/MyCourses';
import MessagesPage from '@/pages/dashboard/MessagesPage';
import Certificates from '@/pages/dashboard/Certificates';
import Settings from '@/pages/dashboard/Settings';

// Teacher pages
import TeachingPage from '@/pages/teacher/TeachingPage';
import TeacherCourses from '@/pages/teacher/TeacherCourses';
import TeacherCourseDetailPage from '@/pages/teacher/TeacherCourseDetailPage';
import CourseForm from '@/pages/teacher/CourseForm';
import AddLessonPage from '@/pages/teacher/AddLessonPage';

// Student pages
import StudentCourseDetailPage from '@/pages/student/StudentCourseDetailPage';

// Video Room component
import VideoRoom from '@/components/VideoRoom/VideoRoom';

import PrivateRoute from './PrivateRoute';

// Role-based route components
const TeacherRoute = ({ element }) => (
  <PrivateRoute roles={['teacher']}>
    {element}
  </PrivateRoute>
);

const StudentRoute = ({ element }) => (
  <PrivateRoute roles={['student']}>
    {element}
  </PrivateRoute>
);

export const dashboardRoutes = {
  path: '/dashboard',
  element: (
    <PrivateRoute>
      <DashboardLayout />
    </PrivateRoute>
  ),
  children: [
    {
      index: true,
      element: <DashboardHome />,
    },
    {
      path: 'profile',
      element: <ProfilePage />,
    },
    {
      path: 'my-courses',
      element: <StudentRoute element={<MyCourses />} />,
    },
    {
      path: 'my-courses/:id',
      element: <StudentRoute element={<StudentCourseDetailPage />} />,
    },
    {
      path: 'messages',
      element: <MessagesPage />,
    },
    {
      path: 'certificates',
      element: <StudentRoute element={<Certificates />} />,
    },
    {
      path: 'teaching',
      element: <TeacherRoute element={<TeachingPage />} />,
    },
    // Teacher course management routes
    {
      path: 'teacher/courses',
      element: <TeacherRoute element={<TeacherCourses />} />,
    },
    {
      path: 'teacher/courses/new',
      element: <TeacherRoute element={<CourseForm />} />,
    },
    {
      path: 'teacher/courses/:id/edit',
      element: <TeacherRoute element={<CourseForm />} />,
    },
    {
      path: 'teacher/courses/:id/view',
      element: <TeacherRoute element={<TeacherCourseDetailPage />} />,
    },
    {
      path: 'teacher/courses/:courseId/lessons/new',
      element: <TeacherRoute element={<AddLessonPage />} />,
    },
    // Video Room routes
    {
      path: 'video-room/:roomId',
      element: <VideoRoom />,
    },
    {
      path: 'settings',
      element: <Settings />,
    },
  ],
};
