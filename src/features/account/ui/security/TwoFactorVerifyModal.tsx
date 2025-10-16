import React, { useEffect, useState } from 'react';
import { ensureHttpError, verifyTwoFactorAction } from '@/features/auth/api';
import styles from './TwoFactorVerifyModal.module.css';

interface TwoFactorVerifyModalProps {
  action: 'enable' | 'disable';
  onSuccess: () => void;
  onCancel: () => void;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const TwoFactorVerifyModal: React.FC<TwoFactorVerifyModalProps> = ({ action, onSuccess, onCancel }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const purpose = action === 'enable' ? 'enable_2fa' : 'disable_2fa';
      await verifyTwoFactorAction(code, purpose);
      onSuccess();
    } catch (err) {
      const httpError = ensureHttpError(err);
      setError(httpError?.message ?? 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modalContent} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{action === 'enable' ? 'Enable' : 'Disable'} Two-Factor Authentication</h3>
          <button className={styles.modalClose} onClick={onCancel} aria-label="Close verification modal">
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.verificationInfo}>
            <div className={styles.emailIcon}>📧</div>
            <p>
              We've sent a 6-digit verification code to your email address. Please enter it below to{' '}
              {action === 'enable' ? 'enable' : 'disable'} 2FA.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.codeInputContainer}>
              <label htmlFor="verification-code">Verification Code</label>
              <input
                id="verification-code"
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="000000"
                className={styles.codeInput}
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
              />
              <div className={styles.codeHint}>Enter the 6-digit code from your email</div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.timerInfo}>
              {timeLeft > 0 ? (
                <p className={styles.timer}>
                  ⏰ Code expires in: <span className={styles.timeLeft}>{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <p className={cx(styles.timer, styles.timerExpired)}>
                  ⚠️ Code has expired. Please try again.
                </p>
              )}
            </div>

            <div className={styles.modalActions}>
                <button
                  type="button"
                  className={cx(styles.settingsBtn, styles.settingsBtnSecondary)}
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.settingsBtn}
                  disabled={loading || code.length !== 6 || timeLeft <= 0}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export default TwoFactorVerifyModal;
