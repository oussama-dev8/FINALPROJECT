import React from 'react';
import { Route } from 'react-router-dom';
import LandingPage from '@/pages/public/LandingPage';
import CoursesPage from '@/pages/public/CoursesPage';
import CourseDetailPage from '@/pages/public/CourseDetailPage';
import LoginPage from '@/pages/public/LoginPage';
import RegisterPage from '@/pages/public/RegisterPage';
import ContactPage from '@/pages/public/ContactPage';

export const publicRoutes = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/courses',
    element: <CoursesPage />,
  },
  {
    path: '/courses/:id',
    element: <CourseDetailPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
];
