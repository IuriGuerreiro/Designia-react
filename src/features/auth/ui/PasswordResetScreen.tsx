import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import PasswordReset from './PasswordReset';

const PasswordResetScreen: React.FC = () => {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <PasswordReset onBackToLogin={() => navigate('/login')} />
    </AuthLayout>
  );
};

export default PasswordResetScreen;

