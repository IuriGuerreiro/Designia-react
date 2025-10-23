import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import LoginTwoFactor from './LoginTwoFactor';

type LocationState = {
  userId?: number;
  email?: string;
};

const LoginTwoFactorScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const userId = state.userId;
  const email = state.email || '';

  if (!userId) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <AuthLayout>
      <LoginTwoFactor
        userId={userId}
        email={email}
        onBack={() => navigate('/login')}
      />
    </AuthLayout>
  );
};

export default LoginTwoFactorScreen;

