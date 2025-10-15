import React, { useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/state/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEmailRateLimit } from '../../hooks/useEmailRateLimit';
import AuthLayout from './AuthLayout';
import styles from './Auth.module.css';

const EmailVerificationPending: React.FC = () => {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const { resendVerification } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { canSend, timeRemaining, checkRateLimit, startCountdown } = useEmailRateLimit();
  const { t } = useTranslation();

  const email = location.state?.email || new URLSearchParams(location.search).get('email') || '';
  const fromLogin = location.state?.fromLogin || false;
  const customMessage = location.state?.message;

  useEffect(() => {
    if (email) {
      checkRateLimit(email, 'email_verification');
    }
  }, [email, checkRateLimit]);

  const handleResendEmail = async () => {
    if (!canSend) return;
    setIsResending(true);
    setResendMessage('');
    
    try {
      const result = await resendVerification(email);
      if (result.success) {
        setResendSuccess(true);
        setResendMessage('Verification email sent successfully!');
        startCountdown(60);
      } else {
        setResendSuccess(false);
        setResendMessage(result.message || 'Failed to send verification email.');
        if (result.message.includes('wait')) {
          await checkRateLimit(email, 'email_verification');
        }
      }
    } catch {
      setResendSuccess(false);
      setResendMessage('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles['auth-card']}>
        <div className={styles['auth-header']}>
          <h2 className={styles['auth-title']}>{t('auth.check_email_title')}</h2>
          <p className={styles['auth-subtitle']}>{fromLogin ? t('auth.verification_required') : t('auth.verify_email_continue')}</p>
        </div>

        <div className={styles['verification-pending-content']}>
          <p>{t('auth.verification_sent_message', { email })}</p>
          
          {resendMessage && (
            <div className={`${styles['message']} ${resendSuccess ? styles['success'] : styles['error']}`}>
              {resendMessage}
            </div>
          )}

          <div className={styles['verification-actions']}>
            <button
              onClick={handleResendEmail}
              disabled={isResending || !canSend}
              className={`${styles['auth-button']} ${styles['primary']}`}
            >
              {isResending ? t('auth.sending_button') : !canSend ? t('auth.resend_in_button', { seconds: timeRemaining }) : t('auth.resend_verification_button')}
            </button>
            <button onClick={() => navigate('/login')} className={styles['link-button']}>
              {t('auth.back_to_login_link')}
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default EmailVerificationPending;
