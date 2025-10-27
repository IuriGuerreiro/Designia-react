import React, { useEffect, useMemo, useState } from 'react';
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
    if (score >= 4) return { label: 'Strong', level: 'strong' as const, pct: 100 };
    if (score >= 2) return { label: 'Medium', level: 'medium' as const, pct: 66 };
    if (pw.length > 0) return { label: 'Weak', level: 'weak' as const, pct: 33 };
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
        setInfo(data.message || 'Code sent. Check your inbox.');
      } else if (response.status === 429) {
        setStep('verify');
        setCooldown(60);
        setCpUserId(userId ?? null);
        setInfo((data && data.message) || 'A recent code was already sent. Please check your email.');
      } else {
        setError((data && data.error) || 'Failed to send verification code.');
      }
    } catch {
      setError('Network error. Please try again.');
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
      setInfo('If an account exists, a new code was sent.');
      setCooldown(60);
    } catch {
      setError('Unable to resend code right now.');
    } finally {
      setLoading(false);
    }
  };

  const submitNewPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
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
        setError((data && data.error) || 'Failed to update password.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="change-pw-title">
        <div className={styles.modalHeader}>
          <h3 id="change-pw-title">Change Password</h3>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close change password modal">×</button>
        </div>
        <div className={styles.modalBody}>
          {step === 'initial' && (
            <div className={styles.stepContainer}>
              <div className={styles.stepIntro}>
                <span className={styles.stepBadge}>Step 1</span>
                <div>
                  <strong>Send a verification code</strong>
                  <p>We will email a 6-digit code to {maskedEmail}.</p>
                </div>
              </div>
              {error && <div className={styles.alertWarning} role="alert" aria-live="assertive">{error}</div>}
              {info && <div className={styles.alertSuccess} role="status" aria-live="polite">{info}</div>}
              <div className={styles.modalActions}>
                <button className={styles.settingsBtn} onClick={requestCode} disabled={loading}>
                  {loading ? 'Sending Code…' : 'Send Code'}
                </button>
                <button className={cx(styles.settingsBtn, styles.settingsBtnSecondary)} onClick={onClose} disabled={loading}>
                  Cancel
                </button>
              </div>
              <p className={styles.hint}>Having trouble? Check spam or promotions folders.</p>
            </div>
          )}

          {step === 'verify' && (
            <form onSubmit={submitNewPassword} className={styles.stepContainer}>
              <div className={styles.stepIntro}>
                <span className={styles.stepBadge}>Step 2</span>
                <div>
                  <strong>Verify and update password</strong>
                  <p>Enter the 6‑digit code and your new password.</p>
                </div>
              </div>
              {error && <div className={styles.alertWarning} role="alert" aria-live="assertive">{error}</div>}
              {info && <div className={styles.alertSuccess} role="status" aria-live="polite">{info}</div>}
              <div className={styles.grid}> 
                <div className={styles.field}>
                  <label htmlFor="pw-code">Verification Code</label>
                  <input
                    id="pw-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    title="Enter 6 digits"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit code"
                    className={styles.input}
                  />
                  <div className={styles.inlineRow}>
                    <span className={styles.hint}>Sent to {maskedEmail}</span>
                    <button
                      type="button"
                      className={styles.resend}
                      onClick={resendCode}
                      disabled={loading || cooldown > 0}
                      aria-disabled={loading || cooldown > 0}
                    >
                      {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                    </button>
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="pw-new">New Password</label>
                  <div className={styles.inputWrap}>
                    <input
                      id="pw-new"
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      minLength={8}
                      required
                      className={styles.input}
                    />
                    <button
                      type="button"
                      className={styles.toggle}
                      onClick={() => setShowPw((s) => !s)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className={styles.strength} aria-hidden={strength.level === 'empty'}>
                    <div className={cx(styles.strengthBar, strength.level && styles[`strength_${strength.level}`])} style={{ width: `${strength.pct}%` }} />
                    <span className={styles.strengthLabel}>{strength.label}</span>
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="pw-confirm">Confirm Password</label>
                  <div className={styles.inputWrap}>
                    <input
                      id="pw-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter new password"
                      minLength={8}
                      required
                      className={styles.input}
                    />
                    <button
                      type="button"
                      className={styles.toggle}
                      onClick={() => setShowConfirm((s) => !s)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {!!confirm && confirm !== password && (
                    <span className={styles.errorText}>Passwords do not match</span>
                  )}
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={cx(styles.settingsBtn, styles.settingsBtnSecondary)} onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.settingsBtn}
                  disabled={loading || code.length !== 6 || !password || !confirm || password !== confirm}
                >
                  {loading ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className={styles.successPanel} role="status" aria-live="polite">
              <div className={styles.successIcon}>✓</div>
              <h4>Password updated</h4>
              <p>You can now sign in with your new password.</p>
              <div className={styles.modalActions}>
                <button className={cx(styles.settingsBtn, styles.settingsBtnSecondary)} onClick={onClose}>
                  Close
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

