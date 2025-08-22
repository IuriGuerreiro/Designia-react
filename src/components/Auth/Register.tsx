import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import GoogleOAuth from './GoogleOAuth';
import ErrorMessage from './ErrorMessage';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const { t } = useTranslation();
  const { register, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setError('');
    try {
      const result = await register({ email, password, password_confirm: confirmPassword, username, first_name: firstName, last_name: lastName });
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>{t('auth.register_title')}</h2>
        <p>{t('auth.register_subtitle')}</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} onClose={() => setError('')} />}
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">{t('auth.first_name_label')}</label>
            <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={t('auth.first_name_placeholder')} disabled={isLoading} />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">{t('auth.last_name_label')}</label>
            <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={t('auth.last_name_placeholder')} disabled={isLoading} />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="username">{t('auth.username_label')}</label>
          <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('auth.username_placeholder')} disabled={isLoading} />
        </div>

        <div className="form-group">
          <label htmlFor="email">{t('auth.email_label')}</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email_placeholder')} disabled={isLoading} />
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('auth.password_label')}</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.password_placeholder')} disabled={isLoading} />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">{t('auth.confirm_password_label')}</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('auth.confirm_password_placeholder')} disabled={isLoading} />
        </div>

        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? t('auth.creating_account_button') : t('auth.register_button')}
        </button>
      </form>

      <GoogleOAuth onError={setError} />

      <div className="auth-switch">
        <p>
          {t('auth.to_login_link').split('Sign In')[0]}
          <button type="button" className="link-button" onClick={onSwitchToLogin}>
            {t('auth.to_login_link').split('? ')[1]}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
