import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import Login from './Login';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <Login
        onSwitchToRegister={() => navigate('/register')}
        onSwitchToPasswordReset={() => navigate('/password-reset')}
      />
    </AuthLayout>
  );
};

export default LoginScreen;

