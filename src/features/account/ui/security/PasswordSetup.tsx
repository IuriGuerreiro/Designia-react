import React, { useState } from 'react';
import { useAuth } from '@/features/auth/state/AuthContext';
import {
  requestPasswordSetup,
  completePasswordSetup,
  ensureHttpError,
} from '@/features/auth/api';
import styles from './PasswordSetup.module.css';

interface PasswordSetupProps {
  onPasswordSet?: () => void;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const PasswordSetup: React.FC<PasswordSetupProps> = ({ onPasswordSet }) => {
  const { user, refreshUserData } = useAuth();
  const [step, setStep] = useState<'initial' | 'verification'>('initial');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user?.is_oauth_only_user) {
    return null;
  }

  const handleRequestPasswordSetup = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await requestPasswordSetup();
      setSuccess(response.message);
      setStep('verification');
    } catch (err) {
      const httpError = ensureHttpError(err);
      setError(httpError?.message ?? 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await completePasswordSetup(verificationCode, password, confirmPassword);
      setSuccess(response.message);

      if (refreshUserData) {
        await refreshUserData();
      }

      setVerificationCode('');
      setPassword('');
      setConfirmPassword('');
      setStep('initial');

      if (onPasswordSet) {
        onPasswordSet();
      }
    } catch (err) {
      const httpError = ensureHttpError(err);
      setError(httpError?.message ?? 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('initial');
    setVerificationCode('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  return (
    <div className={styles['password-setup']}>
      <div className={styles['password-setup-header']}>
        <h3>Password Setup</h3>
        <p>
          Your account is currently secured with Google OAuth only. Set up a password for additional login options.
        </p>
      </div>

      {error && <div className={cx(styles.alert, styles['alert-error'])}>{error}</div>}
      {success && <div className={cx(styles.alert, styles['alert-success'])}>{success}</div>}

      {step === 'initial' && (
        <div className={styles['password-setup-initial']}>
          <div className={styles['oauth-info']}>
            <div className={styles['oauth-indicator']}>
              <span className={styles['oauth-icon']}>🔐</span>
              <div className={styles['oauth-text']}>
                <strong>Google OAuth Account</strong>
                <p>You're currently using Google OAuth for authentication</p>
              </div>
            </div>
          </div>

          <button
            className={cx(styles['settings-btn'], styles['settings-btn-primary'])}
            onClick={handleRequestPasswordSetup}
            disabled={loading}
          >
            {loading ? 'Sending Code...' : 'Set Up Password'}
          </button>

          <div className={styles['setup-info']}>
            <h4>Why set up a password?</h4>
            <ul>
              <li>Alternative login method if Google OAuth is unavailable</li>
              <li>Enhanced account security with multiple authentication options</li>
              <li>Access to advanced security features</li>
            </ul>
            <p className={styles['security-note']}>
              <strong>Security:</strong> Setting up a password requires email verification with a 6-digit code.
            </p>
          </div>
        </div>
      )}

      {step === 'verification' && (
        <div className={styles['password-setup-verification']}>
          <div className={styles['verification-header']}>
            <h4>Verify and Set Password</h4>
            <p>Enter the 6-digit code sent to your email and your new password.</p>
          </div>

          <form onSubmit={handleSetPassword} className={styles['password-setup-form']}>
            <div className={styles['form-group']}>
              <label htmlFor="verificationCode">Verification Code</label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(event) =>
                  setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                className={cx(styles['form-control'], styles['code-input'])}
              />
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter new password"
                minLength={8}
                required
                className={styles['form-control']}
              />
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                minLength={8}
                required
                className={styles['form-control']}
              />
            </div>

            <div className={styles['form-actions']}>
              <button
                type="button"
                className={cx(styles['settings-btn'], styles['settings-btn-secondary'])}
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className={cx(styles['settings-btn'], styles['settings-btn-primary'])}
                disabled={
                  loading || verificationCode.length !== 6 || !password || !confirmPassword
                }
              >
                {loading ? 'Setting Password...' : 'Set Password'}
              </button>
            </div>
          </form>

          <div className={styles['verification-info']}>
            <p className={styles['code-info']}>
              📧 Code expires in 10 minutes. Check your spam folder if you don't see the email.
            </p>
            <button
              type="button"
              className={styles['btn-link']}
              onClick={handleRequestPasswordSetup}
              disabled={loading}
            >
              Resend code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordSetup;
