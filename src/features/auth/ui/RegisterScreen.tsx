import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import Register from './Register';

const RegisterScreen: React.FC = () => {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <Register onSwitchToLogin={() => navigate('/login')} />
    </AuthLayout>
  );
};

export default RegisterScreen;

