import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import PasswordReset from './PasswordReset';
import './Auth.css';
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
        return <Login onSwitchToRegister={() => handleSwitchMode('register')} onSwitchToPasswordReset={() => handleSwitchMode('passwordReset')} />;
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-content-wrapper">
        <div className="auth-branding">
          <div className="auth-branding-content">
            <div className="auth-logo">Designia</div>
            <h1>{t('auth.branding_title')}</h1>
            <p>{t('auth.branding_subtitle')}</p>
            <ul className="auth-features">
              <li>{t('auth.feature_1')}</li>
              <li>{t('auth.feature_2')}</li>
              <li>{t('auth.feature_3')}</li>
            </ul>
          </div>
        </div>
        <div className="auth-form-section">
          <div className="auth-container">
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
