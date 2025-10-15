import { Navigate } from 'react-router-dom';
import { AuthScreen, EmailVerification, EmailVerificationPending } from './ui';
import type { AppRoute } from '@/app/router/types';

export const authPublicRoutes: AppRoute[] = [
  { path: '/login', element: <AuthScreen /> },
  { path: '/register', element: <AuthScreen /> },
  { path: '/password-reset', element: <AuthScreen /> },
  { path: '/verify-email/:token', element: <EmailVerification /> },
  { path: '/verify-email-pending', element: <EmailVerificationPending /> },
  { path: '/*', element: <Navigate to="/login" /> },
];

export const authProtectedRoutes: AppRoute[] = [
  { path: '/logout', element: <Navigate to="/login" /> },
];
