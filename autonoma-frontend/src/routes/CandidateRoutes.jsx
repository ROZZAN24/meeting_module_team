import { lazy } from 'react';

// project imports
import MinimalLayout from 'layout/MinimalLayout';
import NavMotion from 'layout/NavMotion';
import Loadable from 'ui-component/Loadable';
import ErrorBoundary from './ErrorBoundary';

const CandidateLogin = Loadable(lazy(() => import('views/candidate/Login')));
const CandidateAssessment = Loadable(lazy(() => import('views/candidate/Assessment')));

const CandidateRoutes = {
  path: '/',
  element: (
    <NavMotion>
      <MinimalLayout />
    </NavMotion>
  ),
  errorElement: <ErrorBoundary />,
  children: [
    {
      path: '/candidate/login',
      element: <CandidateLogin />
    },
    {
      path: '/candidate/assessment',
      element: <CandidateAssessment />
    }
  ]
};

export default CandidateRoutes;
