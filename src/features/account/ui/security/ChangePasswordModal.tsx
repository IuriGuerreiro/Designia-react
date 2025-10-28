import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ChangePasswordModal.module.css';
import { API_ENDPOINTS } from '@/shared/api';

interface ChangePasswordModalProps {
  isOpen: boolean;
  userEmail?: string | null;
  userId?: number | null;
  onClose: () => void;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, userEmail, userId, onClose }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<'initial' | 'verify' | 'success'>('initial');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [info, setInfo] = useState<string>('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [cpUserId, setCpUserId] = useState<number | null>(userId ?? null);
  const [cooldown, setCooldown] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStep('initial');
    setLoading(false);
    setError('');
    setInfo('');
    setCode('');
    setPassword('');
    setConfirm('');
    setCpUserId(userId ?? null);
    setCooldown(0);
    setShowPw(false);
    setShowConfirm(false);
  }, [isOpen, userId]);

  useEffect(() => {
    if (!cooldown) return;
    const id = window.setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  const maskedEmail = useMemo(() => {
    const email = userEmail || '';
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    const visible = name.slice(0, 2);
    return `${visible}${'*'.repeat(Math.max(3, name.length - 2))}@${domain}`;
  }, [userEmail]);

  const getStrength = (pw: string) => {
    const lengthScore = pw.length >= 12 ? 2 : pw.length >= 8 ? 1 : 0;
    const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^\w]/].reduce((acc, r) => acc + (r.test(pw) ? 1 : 0), 0);
    const score = lengthScore + (variety >= 3 ? 2 : variety >= 2 ? 1 : 0);
    if (score >= 4) return { label: t('account.security.change_password.strength.strong'), level: 'strong' as const, pct: 100 };
    if (score >= 2) return { label: t('account.security.change_password.strength.medium'), level: 'medium' as const, pct: 66 };
    if (pw.length > 0) return { label: t('account.security.change_password.strength.weak'), level: 'weak' as const, pct: 33 };
    return { label: ' ', level: 'empty' as const, pct: 0 };
  };
  const strength = getStrength(password);

  const requestCode = async () => {
    try {
      setLoading(true);
      setError('');
      setInfo('');
      const response = await fetch(API_ENDPOINTS.PASSWORD_RESET_REQUEST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setStep('verify');
        setCooldown(60);
        setCpUserId(typeof data.user_id === 'number' ? data.user_id : (userId ?? null));
        setInfo(data.message || t('account.security.change_password.messages.code_sent'));
      } else if (response.status === 429) {
        setStep('verify');
        setCooldown(60);
        setCpUserId(userId ?? null);
        setInfo((data && data.message) || t('account.security.change_password.messages.code_recently_sent'));
      } else {
        setError((data && data.error) || t('account.security.change_password.errors.send_failed'));
      }
    } catch {
      setError(t('account.security.change_password.errors.network'));
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(API_ENDPOINTS.PASSWORD_RESET_REQUEST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      await response.json().catch(() => ({}));
      setInfo(t('account.security.change_password.messages.code_resent'));
      setCooldown(60);
    } catch {
      setError(t('account.security.change_password.errors.resend_failed'));
    } finally {
      setLoading(false);
    }
  };

  const submitNewPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code || !password || !confirm) {
      setError(t('account.security.change_password.errors.fill_all_fields'));
      return;
    }
    if (password !== confirm) {
      setError(t('account.security.change_password.errors.passwords_mismatch'));
      return;
    }
    try {
      setLoading(true);
      setError('');
      setInfo('');
      const response = await fetch(API_ENDPOINTS.PASSWORD_RESET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: cpUserId,
          code,
          password,
          confirm_password: confirm,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setStep('success');
        setCode('');
        setPassword('');
        setConfirm('');
      } else {
        setError((data && data.error) || t('account.security.change_password.errors.update_failed'));
      }
    } catch {
      setError(t('account.security.change_password.errors.network'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="change-pw-title">
        <div className={styles.modalHeader}>
          <h3 id="change-pw-title">{t('account.security.change_password.title')}</h3>
          <button className={styles.modalClose} onClick={onClose} aria-label={t('account.security.change_password.a11y.close_modal')}>×</button>
        </div>
        <div className={styles.modalBody}>
          {step === 'initial' && (
            <div className={styles.stepContainer}>
              <div className={styles.stepIntro}>
                <span className={styles.stepBadge}>{t('account.security.change_password.step_1')}</span>
                <div>
                  <strong>{t('account.security.change_password.send_code_title')}</strong>
                  <p>{t('account.security.change_password.send_code_description', { email: maskedEmail })}</p>
                </div>
              </div>
              {error && <div className={styles.alertWarning} role="alert" aria-live="assertive">{error}</div>}
              {info && <div className={styles.alertSuccess} role="status" aria-live="polite">{info}</div>}
              <div className={styles.modalActions}>
                <button className={styles.settingsBtn} onClick={requestCode} disabled={loading}>
                  {loading ? t('account.security.change_password.actions.sending_code') : t('account.security.change_password.actions.send_code')}
                </button>
                <button className={cx(styles.settingsBtn, styles.settingsBtnSecondary)} onClick={onClose} disabled={loading}>
                  {t('account.security.change_password.actions.cancel')}
                </button>
              </div>
              <p className={styles.hint}>{t('account.security.change_password.hints.check_spam')}</p>
            </div>
          )}

          {step === 'verify' && (
            <form onSubmit={submitNewPassword} className={styles.stepContainer}>
              <div className={styles.stepIntro}>
                <span className={styles.stepBadge}>{t('account.security.change_password.step_2')}</span>
                <div>
                  <strong>{t('account.security.change_password.verify_title')}</strong>
                  <p>{t('account.security.change_password.verify_description')}</p>
                </div>
              </div>
              {error && <div className={styles.alertWarning} role="alert" aria-live="assertive">{error}</div>}
              {info && <div className={styles.alertSuccess} role="status" aria-live="polite">{info}</div>}
              <div className={styles.grid}> 
                <div className={styles.field}>
                  <label htmlFor="pw-code">{t('account.security.change_password.form.code_label')}</label>
                  <input
                    id="pw-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    title={t('account.security.change_password.form.code_title')}
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={t('account.security.change_password.form.code_placeholder')}
                    className={styles.input}
                  />
                  <div className={styles.inlineRow}>
                    <span className={styles.hint}>{t('account.security.change_password.hints.sent_to', { email: maskedEmail })}</span>
                    <button
                      type="button"
                      className={styles.resend}
                      onClick={resendCode}
                      disabled={loading || cooldown > 0}
                      aria-disabled={loading || cooldown > 0}
                    >
                      {cooldown > 0 ? t('account.security.change_password.actions.resend_in', { seconds: cooldown }) : t('account.security.change_password.actions.resend_code')}
                    </button>
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="pw-new">{t('account.security.change_password.form.new_label')}</label>
                  <div className={styles.inputWrap}>
                    <input
                      id="pw-new"
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('account.security.change_password.form.new_placeholder')}
                      minLength={8}
                      required
                      className={styles.input}
                    />
                    <button
                      type="button"
                      className={styles.toggle}
                      onClick={() => setShowPw((s) => !s)}
                      aria-label={showPw ? t('account.security.change_password.a11y.hide_password') : t('account.security.change_password.a11y.show_password')}
                    >
                      {showPw ? t('account.security.change_password.actions.hide') : t('account.security.change_password.actions.show')}
                    </button>
                  </div>
                  <div className={styles.strength} aria-hidden={strength.level === 'empty'}>
                    <div className={cx(styles.strengthBar, strength.level && styles[`strength_${strength.level}`])} style={{ width: `${strength.pct}%` }} />
                    <span className={styles.strengthLabel}>{strength.label}</span>
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="pw-confirm">{t('account.security.change_password.form.confirm_label')}</label>
                  <div className={styles.inputWrap}>
                    <input
                      id="pw-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder={t('account.security.change_password.form.confirm_placeholder')}
                      minLength={8}
                      required
                      className={styles.input}
                    />
                    <button
                      type="button"
                      className={styles.toggle}
                      onClick={() => setShowConfirm((s) => !s)}
                      aria-label={showConfirm ? t('account.security.change_password.a11y.hide_password') : t('account.security.change_password.a11y.show_password')}
                    >
                      {showConfirm ? t('account.security.change_password.actions.hide') : t('account.security.change_password.actions.show')}
                    </button>
                  </div>
                  {!!confirm && confirm !== password && (
                    <span className={styles.errorText}>{t('account.security.change_password.errors.passwords_mismatch')}</span>
                  )}
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={cx(styles.settingsBtn, styles.settingsBtnSecondary)} onClick={onClose} disabled={loading}>
                  {t('account.security.change_password.actions.cancel')}
                </button>
                <button
                  type="submit"
                  className={styles.settingsBtn}
                  disabled={loading || code.length !== 6 || !password || !confirm || password !== confirm}
                >
                  {loading ? t('account.security.change_password.actions.updating') : t('account.security.change_password.actions.update_password')}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className={styles.successPanel} role="status" aria-live="polite">
              <div className={styles.successIcon}>✓</div>
              <h4>{t('account.security.change_password.success.title')}</h4>
              <p>{t('account.security.change_password.success.description')}</p>
              <div className={styles.modalActions}>
                <button className={cx(styles.settingsBtn, styles.settingsBtnSecondary)} onClick={onClose}>
                  {t('account.security.change_password.actions.close')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
