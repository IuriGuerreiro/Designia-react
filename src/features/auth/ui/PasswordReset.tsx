import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '@/shared/api';
import ErrorMessage from './ErrorMessage';
import styles from './Auth.module.css';
import settingsStyles from '@/features/account/ui/settings/Settings.module.css';

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
      const data = await response.json().catch(() => ({} as any));
      if (response.ok) {
        setSuccess(data.message);
        setUserId(data.user_id);
        setStep('verify');
      } else if (response.status === 429) {
        // Too many requests — show verify screen anyway (code likely already sent)
        setSuccess(
          (data && data.message) || 'A recent code was already sent. Please check your email and enter the code.'
        );
        // Keep existing userId if already set from a previous successful request
        if (typeof data.user_id === 'number') {
          setUserId(data.user_id);
        }
        setStep('verify');
      } else {
        setError((data && data.error) || 'Failed to send reset code.');
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
    <div className={styles['auth-card']}>
      <div className={styles['auth-header']}>
        <h2 className={styles['auth-title']}>{t('auth.password_reset_title') || 'Reset your access'}</h2>
        <p className={styles['auth-subtitle']}>
          {step === 'email'
            ? t('auth.password_reset_description_email') || 'Enter the email linked to your account and we will send a secure reset link.'
            : t('auth.password_reset_description_verify', { email }) || `Enter the 6-digit code sent to ${email} and choose a new password.`}
        </p>
        <p className={styles['auth-meta']}>
          {step === 'email'
            ? 'We use reset codes that expire after 10 minutes to keep your studio safe.'
            : 'Codes refresh with every request. Resend if you need a fresh one.'}
        </p>
      </div>

      <div className={styles['auth-form']}>
        {error && <ErrorMessage message={error} onClose={() => setError('')} />}
        {success && <div className={styles['success-message']}>{success}</div>}
        
        {step === 'email' ? (
          <div className={styles['form-group']}>
            <label htmlFor="email" className={styles['form-label']}>{t('auth.email_address_label')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.email_placeholder')}
              disabled={isLoading}
              className={`${styles['form-input']} ${styles['auth-input-email']}`}
              onKeyPress={(e) => e.key === 'Enter' && handleRequestReset()}
            />
          </div>
        ) : (
          <div className={settingsStyles.settingsCard}>
            <div className={settingsStyles.accountInfo}>
              <div className={settingsStyles.infoGroup}>
                <label htmlFor="code">{t('auth.verification_code_label')}</label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  title="Enter 6 digits"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>
              <div className={settingsStyles.infoGroup}>
                <label htmlFor="password">{t('auth.new_password_label')}</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password_placeholder')}
                  disabled={isLoading}
                  minLength={8}
                  required
                />
              </div>
              <div className={settingsStyles.infoGroup}>
                <label htmlFor="confirmPassword">{t('auth.confirm_password_label')}</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirm_password_placeholder')}
                  disabled={isLoading}
                  minLength={8}
                  required
                  onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
                />
              </div>
            </div>
          </div>
        )}

        <div className={settingsStyles.accountActions}>
          <button
            type="button"
            className={`${settingsStyles.settingsBtn} ${settingsStyles.settingsBtnSecondary}`}
            disabled={isLoading}
            onClick={step === 'email' ? onBackToLogin : () => setStep('email')}
          >
            {step === 'email' ? t('auth.back_to_login_link') : 'Back'}
          </button>
          <button
            type="button"
            className={settingsStyles.settingsBtn}
            disabled={isLoading}
            onClick={step === 'email' ? handleRequestReset : handleResetPassword}
          >
            {isLoading ? t('auth.processing_button') : (step === 'email' ? t('auth.send_reset_code_button') : t('auth.reset_password_button'))}
          </button>
        </div>
      </div>

      <p className={styles['auth-disclaimer']}>
        Having trouble? Reach our support team at <a href="mailto:support@designia.com">support@designia.com</a> and we&apos;ll help you get back in.
      </p>

      <div className={styles['auth-switch']}>
        <p className={styles['switch-text']}>
          <button
            type="button" 
            className={styles['link-button']} 
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
