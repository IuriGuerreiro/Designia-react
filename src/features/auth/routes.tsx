import { Navigate } from 'react-router-dom';
import { EmailVerification, EmailVerificationPending } from './ui';
import LoginScreen from './ui/LoginScreen';
import RegisterScreen from './ui/RegisterScreen';
import PasswordResetScreen from './ui/PasswordResetScreen';
import LoginTwoFactorScreen from './ui/LoginTwoFactorScreen';
import type { AppRoute } from '@/app/router/types';

export const authPublicRoutes: AppRoute[] = [
  { path: '/login', element: <LoginScreen /> },
  { path: '/login/2fa', element: <LoginTwoFactorScreen /> },
  { path: '/register', element: <RegisterScreen /> },
  { path: '/password-reset', element: <PasswordResetScreen /> },
  { path: '/verify-email/:token', element: <EmailVerification /> },
  { path: '/verify-email-pending', element: <EmailVerificationPending /> },
  { path: '/*', element: <Navigate to="/login" /> },
];

export const authProtectedRoutes: AppRoute[] = [
  { path: '/logout', element: <Navigate to="/login" /> },
];
