import React, { useEffect, useState } from 'react';
import {
  fetchTwoFactorStatus as fetchTwoFactorStatusApi,
  toggleTwoFactor,
  ensureHttpError,
} from '@/features/auth/api';
import TwoFactorVerifyModal from './TwoFactorVerifyModal';
import styles from './TwoFactorAuth.module.css';

interface TwoFactorStatus {
  two_factor_enabled: boolean;
  email: string;
}

const TwoFactorAuth: React.FC = () => {
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'enable' | 'disable' | null>(null);

  useEffect(() => {
    void loadTwoFactorStatus();
  }, []);

  const loadTwoFactorStatus = async () => {
    try {
      setLoading(true);
      const response = await fetchTwoFactorStatusApi();
      setTwoFactorStatus(response);
    } catch (err) {
      const httpError = ensureHttpError(err);
      setError(httpError?.message ?? 'Failed to fetch 2FA status');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async (enable: boolean) => {
    try {
      setLoading(true);
      setError('');

      const response = await toggleTwoFactor(enable);

      if (response.requires_verification) {
        setPendingAction(enable ? 'enable' : 'disable');
        setShowVerifyModal(true);
      } else {
        await loadTwoFactorStatus();
      }
    } catch (err) {
      const httpError = ensureHttpError(err);
      setError(httpError?.message ?? 'Failed to toggle 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setShowVerifyModal(false);
    setPendingAction(null);
    void loadTwoFactorStatus();
  };

  const handleVerificationCancel = () => {
    setShowVerifyModal(false);
    setPendingAction(null);
  };

  if (loading && !twoFactorStatus) {
    return (
      <div className={styles['two-factor-auth']}>
        <div className={styles.loading}>Loading 2FA settings...</div>
      </div>
    );
  }

  return (
    <div className={styles['two-factor-auth']}>
      <div className={styles['two-factor-simple']}>
        <div className={styles['two-factor-info']}>
          <span className={styles.email}>{twoFactorStatus?.email}</span>
          <span className={styles.status}>
            {twoFactorStatus?.two_factor_enabled ? '2FA Enabled' : '2FA Disabled'}
          </span>
        </div>

        {error && <div className={styles['error-message']}>{error}</div>}

        <div className={styles['two-factor-actions']}>
          <button
            className={cx(
              styles.twoFaButton,
              twoFactorStatus?.two_factor_enabled ? styles.twoFaButtonDanger : styles.twoFaButtonPrimary,
            )}
            onClick={() => handleToggle2FA(!twoFactorStatus?.two_factor_enabled)}
            disabled={loading}
          >
            {loading
              ? 'Processing...'
              : twoFactorStatus?.two_factor_enabled
                ? 'Disable'
                : 'Enable'}
          </button>
        </div>
      </div>

      {showVerifyModal && pendingAction && (
        <TwoFactorVerifyModal
          action={pendingAction}
          onSuccess={handleVerificationSuccess}
          onCancel={handleVerificationCancel}
        />
      )}
    </div>
  );
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export default TwoFactorAuth;
