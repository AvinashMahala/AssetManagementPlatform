import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';

// Lazy-loaded auth components
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const VerifyEmailPage = lazy(() => import('@/features/auth/pages/VerifyEmailPage').then(module => ({ default: module.VerifyEmailPage })));
const VerifyPhonePage = lazy(() => import('@/features/auth/pages/VerifyPhonePage').then(module => ({ default: module.VerifyPhonePage })));
const ProfilePage = lazy(() => import('@/features/auth/pages/ProfilePage').then(module => ({ default: module.ProfilePage })));

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