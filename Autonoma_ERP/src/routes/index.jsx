import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// routes
import AuthenticationRoutes from './AuthenticationRoutes';
import LoginRoutes from './LoginRoutes';
import MainRoutes from './MainRoutes';
import SimpleRoutes from './SimpleRoutes';
import ErrorBoundary from './ErrorBoundary';

// project imports
import Loadable from 'ui-component/Loadable';

const PagesLanding = Loadable(lazy(() => import('views/pages/landing')));

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [{ path: '/', element: <PagesLanding />, errorElement: <ErrorBoundary /> }, MainRoutes, LoginRoutes, AuthenticationRoutes, SimpleRoutes],
  {
    basename: import.meta.env.VITE_APP_BASE_NAME
  }
);

export default router;
