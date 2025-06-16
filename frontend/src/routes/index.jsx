import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { publicRoutes } from './public.routes';
import { dashboardRoutes } from './dashboard.routes';

export const AppRouter = () => {
  return (
    <div className="min-h-screen">
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}

        {/* Dashboard Routes */}
        <Route path={dashboardRoutes.path} element={dashboardRoutes.element}>
          {dashboardRoutes.children.map((route) => (
            <Route
              key={route.path || 'index'}
              index={route.index}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>
      </Routes>
    </div>
  );
};
