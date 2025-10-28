import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      setError(t('account.security.2fa_verify.errors.code_required'));
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
      setError(httpError?.message ?? t('account.security.2fa_verify.errors.invalid_code'));
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
          <h3>
            {action === 'enable' ? t('account.security.2fa_verify.title_enable') : t('account.security.2fa_verify.title_disable')}
          </h3>
          <button className={styles.modalClose} onClick={onCancel} aria-label={t('account.security.2fa_verify.a11y.close_modal')}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.verificationInfo}>
            <div className={styles.emailIcon}>📧</div>
            <p>
              {action === 'enable'
                ? t('account.security.2fa_verify.description_enable')
                : t('account.security.2fa_verify.description_disable')}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.codeInputContainer}>
              <label htmlFor="verification-code">{t('account.security.2fa_verify.form.code_label')}</label>
              <input
                id="verification-code"
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder={t('account.security.2fa_verify.form.code_placeholder')}
                className={styles.codeInput}
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
              />
              <div className={styles.codeHint}>{t('account.security.2fa_verify.form.code_hint')}</div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.timerInfo}>
              {timeLeft > 0 ? (
                <p className={styles.timer}>
                  ⏰ {t('account.security.2fa_verify.timer.expires_in')} <span className={styles.timeLeft}>{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <p className={cx(styles.timer, styles.timerExpired)}>
                  ⚠️ {t('account.security.2fa_verify.timer.expired')}
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
                  {t('account.security.2fa_verify.actions.cancel')}
                </button>
                <button
                  type="submit"
                  className={styles.settingsBtn}
                  disabled={loading || code.length !== 6 || timeLeft <= 0}
                >
                  {loading ? t('account.security.2fa_verify.actions.verifying') : t('account.security.2fa_verify.actions.verify_code')}
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
