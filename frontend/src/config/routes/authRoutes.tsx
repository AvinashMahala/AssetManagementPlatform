import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';

// Lazy-loaded auth components
const LoginPage = lazy(() => import('../../pages/auth/LoginPage').then(module => ({ default: module.LoginPage })));
const VerifyEmailPage = lazy(() => import('../../pages/auth/VerifyEmailPage').then(module => ({ default: module.VerifyEmailPage })));
const VerifyPhonePage = lazy(() => import('../../pages/auth/VerifyPhonePage').then(module => ({ default: module.VerifyPhonePage })));
const ProfilePage = lazy(() => import('../../pages/auth/ProfilePage').then(module => ({ default: module.ProfilePage })));

export const authRoutes: RouteConfig[] = [
  // Public routes
  {
    path: ROUTE_PATHS.LOGIN,
    element: <LoginPage />,
    isPublic: true,
  },
  {
    path: ROUTE_PATHS.VERIFY_EMAIL,
    element: <VerifyEmailPage />,
    isPublic: true,
  },
  {
    path: ROUTE_PATHS.VERIFY_PHONE,
    element: <VerifyPhonePage />,
    isPublic: true,
  },

  // Protected routes
  {
    path: ROUTE_PATHS.PROFILE,
    element: <ProfilePage />,
    isProtected: true,
  },
];