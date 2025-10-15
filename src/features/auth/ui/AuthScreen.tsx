import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import PasswordReset from './PasswordReset';
import AuthLayout from './AuthLayout';

const AuthScreen: React.FC = () => {
  const location = useLocation();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'passwordReset'>('login');

  useEffect(() => {
    if (location.pathname.includes('register')) {
      setAuthMode('register');
    } else if (location.pathname.includes('password-reset')) {
      setAuthMode('passwordReset');
    } else {
      setAuthMode('login');
    }
  }, [location.pathname]);

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
