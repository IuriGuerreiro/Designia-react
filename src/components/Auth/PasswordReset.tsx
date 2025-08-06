import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../config/api';
import ErrorMessage from './ErrorMessage';
import './Auth.css';

interface PasswordResetProps {
  onBackToLogin: () => void;
}

const PasswordReset: React.FC<PasswordResetProps> = ({ onBackToLogin }) => {
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const { t } = useTranslation();

  const handleRequestReset = async () => {
    setError('');
    setSuccess('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.PASSWORD_RESET_REQUEST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        setUserId(data.user_id);
        setStep('verify');
      } else {
        setError(data.error || 'Failed to send reset code.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');
    if (!code || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.PASSWORD_RESET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          code,
          password,
          confirm_password: confirmPassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => onBackToLogin(), 3000);
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>{t('auth.password_reset_title')}</h2>
        <p>{step === 'email' ? t('auth.password_reset_description_email') : t('auth.password_reset_description_verify', { email })}</p>
      </div>

      <div className="auth-form">
        {error && <ErrorMessage message={error} onClose={() => setError('')} />}
        {success && <div className="success-message">{success}</div>}
        
        {step === 'email' ? (
          <div className="form-group">
            <label htmlFor="email">{t('auth.email_address_label')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.email_placeholder')}
              disabled={isLoading}
              onKeyPress={(e) => e.key === 'Enter' && handleRequestReset()}
            />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="code">{t('auth.verification_code_label')}</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">{t('auth.new_password_label')}</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.password_placeholder')}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">{t('auth.confirm_password_label')}</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirm_password_placeholder')}
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
              />
            </div>
          </>
        )}

        <button 
          type="button" 
          className="auth-button" 
          disabled={isLoading}
          onClick={step === 'email' ? handleRequestReset : handleResetPassword}
        >
          {isLoading ? t('auth.processing_button') : (step === 'email' ? t('auth.send_reset_code_button') : t('auth.reset_password_button'))}
        </button>
      </div>

      <div className="auth-switch">
        <p>
          <button 
            type="button" 
            className="link-button" 
            onClick={onBackToLogin}
          >
            {t('auth.back_to_login_link')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default PasswordReset;
