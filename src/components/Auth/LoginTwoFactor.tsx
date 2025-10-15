import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../features/auth/state/AuthContext';
import ErrorMessage from './ErrorMessage';
import styles from './Auth.module.css';

interface LoginTwoFactorProps {
  userId: number;
  email: string;
  onBack: () => void;
}

const LoginTwoFactor: React.FC<LoginTwoFactorProps> = ({ userId, email, onBack }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const { verifyTwoFactor, resendTwoFactorCode } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await verifyTwoFactor(userId, code);
      // Success - user will be redirected by the auth context
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
      await resendTwoFactorCode(userId);
      setResendCooldown(60); // 60 second cooldown
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles['auth-card']}>
      <div className={styles['auth-header']}>
        <h2 className={styles['auth-title']}>{t('auth.two_factor_title') || 'Two-Factor Authentication'}</h2>
        <p className={styles['auth-subtitle']}>
          {t('auth.two_factor_description', { email }) || `We've sent a verification code to ${email}`}
        </p>
      </div>

      <div className={styles['auth-form']}>
        {error && <ErrorMessage message={error} onClose={() => setError('')} />}
        
        <div className={styles['form-group']}>
          <label htmlFor="verificationCode" className={styles['form-label']}>
            {t('auth.verification_code_label') || 'Verification Code'}
          </label>
          <input
            id="verificationCode"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            maxLength={6}
            className={`${styles['form-input']} ${styles['code-input']} ${styles['auth-input-verification']}`}
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
          />
        </div>

        <button 
          className={`${styles['auth-button']} ${styles['primary']}`} 
          disabled={isLoading || code.length !== 6}
          onClick={handleVerify}
        >
          {isLoading ? (t('auth.verifying_button') || 'Verifying...') : (t('auth.verify_login_button') || 'Verify & Sign In')}
        </button>

        <div className={styles['auth-switch']}>
          <p className={styles['switch-text']}>
            {t('auth.didnt_receive_code') || "Didn't receive the code?"}{' '}
            <button 
              className={styles['link-button']} 
              onClick={handleResendCode}
              disabled={isResending || resendCooldown > 0}
            >
              {isResending ? (t('auth.sending_button') || 'Sending...') : 
               resendCooldown > 0 ? (t('auth.resend_in_button', { seconds: resendCooldown }) || `Resend in ${resendCooldown}s`) : 
               (t('auth.resend_code_button') || 'Resend Code')}
            </button>
          </p>
          <button onClick={onBack} className={`${styles['link-button']} ${styles['back-link']}`}>
            {t('auth.back_to_login_link') || 'Back to Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginTwoFactor;
