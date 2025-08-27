import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import PasswordReset from './PasswordReset';
import AuthLayout from './AuthLayout';
import { useTranslation } from 'react-i18next';

const AuthScreen: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'passwordReset'>('login');
  const { t } = useTranslation();

  const handleSwitchMode = (mode: 'login' | 'register' | 'passwordReset') => {
    setAuthMode(mode);
  };

  const renderForm = () => {
    switch (authMode) {
      case 'register':
        return <Register onSwitchToLogin={() => handleSwitchMode('login')} />;
      case 'passwordReset':
        return <PasswordReset onBackToLogin={() => handleSwitchMode('login')} />;
      case 'login':
      default:
        return <Login 
          onSwitchToRegister={() => handleSwitchMode('register')} 
          onSwitchToPasswordReset={() => handleSwitchMode('passwordReset')} 
        />;
    }
  };

  return (
    <AuthLayout>
      {renderForm()}
    </AuthLayout>
  );
};

export default AuthScreen;
