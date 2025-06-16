import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/shared/context/AuthContext';
import { CourseProvider } from '@/shared/context/CourseContext';
import { AppRouter } from '@/routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CourseProvider>
          <AppRouter />
        </CourseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
