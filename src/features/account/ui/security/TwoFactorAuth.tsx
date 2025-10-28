import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      setError(httpError?.message ?? t('account.security.errors.fetch_status_failed'));
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
      setError(httpError?.message ?? t('account.security.errors.toggle_failed'));
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
      <div className={styles.twoFactorAuth}>
        <div className={styles.loading}>{t('account.security.loading')}</div>
      </div>
    );
  }

  return (
    <div className={styles.twoFactorAuth}>
      <div className={styles.twoFactorCard}>
        <div className={styles.twoFactorInfo}>
          <span className={styles.email}>{twoFactorStatus?.email}</span>
          <span className={styles.status}>
            {twoFactorStatus?.two_factor_enabled ? t('account.security.status.enabled') : t('account.security.status.disabled')}
          </span>
        </div>

        {error && <div className={styles.alertMessage}>{error}</div>}

        <div className={styles.twoFactorActions}>
          <button
            className={cx(
              styles.twoFaButton,
              twoFactorStatus?.two_factor_enabled ? styles.twoFaButtonDanger : styles.twoFaButtonPrimary,
            )}
            onClick={() => handleToggle2FA(!twoFactorStatus?.two_factor_enabled)}
            disabled={loading}
          >
            {loading
              ? t('account.security.actions.processing')
              : twoFactorStatus?.two_factor_enabled
                ? t('account.security.actions.disable')
                : t('account.security.actions.enable')}
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
