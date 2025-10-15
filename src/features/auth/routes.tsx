import { Navigate } from 'react-router-dom';
import AuthScreen from '../../components/Auth/AuthScreen';
import EmailVerification from '../../components/Auth/EmailVerification';
import EmailVerificationPending from '../../components/Auth/EmailVerificationPending';
import type { AppRoute } from '../../app/router/types';

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
