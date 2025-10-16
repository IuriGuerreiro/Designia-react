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
    <div className={styles.passwordSetup}>
      <div className={styles.passwordSetupHeader}>
        <h3>Password Setup</h3>
        <p>
          Your account is currently secured with Google OAuth only. Set up a password for additional login options.
        </p>
      </div>

      {error && <div className={cx(styles.alert, styles.alertError)}>{error}</div>}
      {success && <div className={cx(styles.alert, styles.alertSuccess)}>{success}</div>}

      {step === 'initial' && (
        <div className={styles.passwordSetupInitial}>
          <div className={styles.oauthInfo}>
            <div className={styles.oauthIndicator}>
              <span className={styles.oauthIcon}>🔐</span>
              <div className={styles.oauthText}>
                <strong>Google OAuth Account</strong>
                <p>You're currently using Google OAuth for authentication</p>
              </div>
            </div>
          </div>

          <button
            className={styles.settingsBtn}
            onClick={handleRequestPasswordSetup}
            disabled={loading}
          >
            {loading ? 'Sending Code...' : 'Set Up Password'}
          </button>

          <div className={styles.setupInfo}>
            <h4>Why set up a password?</h4>
            <ul>
              <li>Alternative login method if Google OAuth is unavailable</li>
              <li>Enhanced account security with multiple authentication options</li>
              <li>Access to advanced security features</li>
            </ul>
            <p className={styles.securityNote}>
              <strong>Security:</strong> Setting up a password requires email verification with a 6-digit code.
            </p>
          </div>
        </div>
      )}

      {step === 'verification' && (
        <div className={styles.passwordSetupVerification}>
          <div className={styles.verificationHeader}>
            <h4>Verify and Set Password</h4>
            <p>Enter the 6-digit code sent to your email and your new password.</p>
          </div>

          <form onSubmit={handleSetPassword} className={styles.passwordSetupForm}>
            <div className={styles.formGroup}>
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
                className={cx(styles.formControl, styles.codeInput)}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter new password"
                minLength={8}
                required
                className={styles.formControl}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                minLength={8}
                required
                className={styles.formControl}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={cx(styles.settingsBtn, styles.settingsBtnSecondary)}
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className={styles.settingsBtn}
                disabled={
                  loading || verificationCode.length !== 6 || !password || !confirmPassword
                }
              >
                {loading ? 'Setting Password...' : 'Set Password'}
              </button>
            </div>
          </form>

          <div className={styles.verificationInfo}>
            <p className={styles.codeInfo}>
              📧 Code expires in 10 minutes. Check your spam folder if you don't see the email.
            </p>
            <button
              type="button"
              className={styles.resendLink}
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
