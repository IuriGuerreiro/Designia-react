import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      setError(httpError?.message ?? t('account.security.password_setup.errors.send_code_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError(t('account.security.password_setup.errors.passwords_mismatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('account.security.password_setup.errors.password_min_length'));
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
      setError(httpError?.message ?? t('account.security.password_setup.errors.set_failed'));
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
        <h3>{t('account.security.password_setup.title')}</h3>
        <p>{t('account.security.password_setup.subtitle')}</p>
      </div>

      {error && <div className={cx(styles.alert, styles.alertError)}>{error}</div>}
      {success && <div className={cx(styles.alert, styles.alertSuccess)}>{success}</div>}

      {step === 'initial' && (
        <div className={styles.passwordSetupInitial}>
          <div className={styles.oauthInfo}>
            <div className={styles.oauthIndicator}>
              <span className={styles.oauthIcon}>🔐</span>
              <div className={styles.oauthText}>
                <strong>{t('account.security.password_setup.oauth_account_title')}</strong>
                <p>{t('account.security.password_setup.oauth_account_description')}</p>
              </div>
            </div>
          </div>

          <button
            className={styles.settingsBtn}
            onClick={handleRequestPasswordSetup}
            disabled={loading}
          >
            {loading ? t('account.security.password_setup.actions.sending_code') : t('account.security.password_setup.actions.setup_password')}
          </button>

          <div className={styles.setupInfo}>
            <h4>{t('account.security.password_setup.why_title')}</h4>
            <ul>
              <li>{t('account.security.password_setup.why_points.alt_login')}</li>
              <li>{t('account.security.password_setup.why_points.enhanced_security')}</li>
              <li>{t('account.security.password_setup.why_points.advanced_features')}</li>
            </ul>
            <p className={styles.securityNote}>
              <strong>{t('account.security.password_setup.security_label')}</strong> {t('account.security.password_setup.security_note')}
            </p>
          </div>
        </div>
      )}

      {step === 'verification' && (
        <div className={styles.passwordSetupVerification}>
          <div className={styles.verificationHeader}>
            <h4>{t('account.security.password_setup.verify_title')}</h4>
            <p>{t('account.security.password_setup.verify_description')}</p>
          </div>

          <form onSubmit={handleSetPassword} className={styles.passwordSetupForm}>
            <div className={styles.formGroup}>
              <label htmlFor="verificationCode">{t('account.security.password_setup.form.code_label')}</label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(event) =>
                  setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder={t('account.security.password_setup.form.code_placeholder')}
                maxLength={6}
                required
                className={cx(styles.formControl, styles.codeInput)}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">{t('account.security.password_setup.form.password_label')}</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t('account.security.password_setup.form.password_placeholder')}
                minLength={8}
                required
                className={styles.formControl}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">{t('account.security.password_setup.form.confirm_label')}</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder={t('account.security.password_setup.form.confirm_placeholder')}
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
                {t('account.security.password_setup.actions.back')}
              </button>
              <button
                type="submit"
                className={styles.settingsBtn}
                disabled={
                  loading || verificationCode.length !== 6 || !password || !confirmPassword
                }
              >
                {loading ? t('account.security.password_setup.actions.setting_password') : t('account.security.password_setup.actions.set_password')}
              </button>
            </div>
          </form>

          <div className={styles.verificationInfo}>
            <p className={styles.codeInfo}>📧 {t('account.security.password_setup.code_expiry_hint')}</p>
            <button
              type="button"
              className={styles.resendLink}
              onClick={handleRequestPasswordSetup}
              disabled={loading}
            >
              {t('account.security.password_setup.actions.resend_code')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordSetup;
