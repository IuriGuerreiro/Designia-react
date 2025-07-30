import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import PasswordReset from './PasswordReset';
import AuthLayout from './AuthLayout';
import './Auth.css';

const AuthScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isRegisterRoute = location.pathname === '/register';
  const isPasswordResetRoute = location.pathname === '/password-reset';
  
  const switchToRegister = () => navigate('/register');
  const switchToLogin = () => navigate('/login');
  const switchToPasswordReset = () => navigate('/password-reset');

  return (
    <AuthLayout>
      {isRegisterRoute ? (
        <Register onSwitchToLogin={switchToLogin} />
      ) : isPasswordResetRoute ? (
        <PasswordReset onBackToLogin={switchToLogin} />
      ) : (
        <Login 
          onSwitchToRegister={switchToRegister} 
          onSwitchToPasswordReset={switchToPasswordReset}
        />
      )}
    </AuthLayout>
  );
};

export default AuthScreen;