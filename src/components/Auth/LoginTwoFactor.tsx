import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import ErrorMessage from './ErrorMessage';
import './Auth.css';

interface LoginTwoFactorProps {
  userId: number;
  email: string;
  onBack: () => void;
}

const LoginTwoFactor: React.FC<LoginTwoFactorProps> = ({ userId, email, onBack }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const { loginVerify2FA, resend2FACode, isLoading } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setError('');
    try {
      await loginVerify2FA(userId, code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      const result = await resend2FACode(userId, 'login');
      if (result.success) {
        setResendCooldown(60);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>{t('auth.two_factor_title')}</h2>
        <p>{t('auth.two_factor_description', { email })}</p>
      </div>

      <div className="auth-form">
        {error && <ErrorMessage message={error} onClose={() => setError('')} />}
        
        <div className="form-group">
          <label htmlFor="verificationCode">{t('auth.verification_code_label')}</label>
          <input
            id="verificationCode"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            maxLength={6}
            className="code-input"
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
          />
        </div>

        <button 
          className="auth-button" 
          disabled={isLoading || code.length !== 6}
          onClick={handleVerify}
        >
          {isLoading ? t('auth.verifying_button') : t('auth.verify_login_button')}
        </button>

        <div className="auth-switch">
          <p>
            {t('auth.didnt_receive_code')}{' '}
            <button 
              className="link-button" 
              onClick={handleResendCode}
              disabled={isResending || resendCooldown > 0}
            >
              {isResending ? t('auth.sending_button') : resendCooldown > 0 ? t('auth.resend_in_button', { seconds: resendCooldown }) : t('auth.resend_code_button')}
            </button>
          </p>
          <button onClick={onBack} className="link-button">{t('auth.back_to_login_link')}</button>
        </div>
      </div>
    </div>
  );
};

export default LoginTwoFactor;
