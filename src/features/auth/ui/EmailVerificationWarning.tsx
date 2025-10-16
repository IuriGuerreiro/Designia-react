import React, { useState, useEffect } from 'react';
import { useAuth } from '../state/AuthContext';
import { useEmailRateLimit } from '../hooks/useEmailRateLimit';
import styles from './Auth.module.css';

interface EmailVerificationWarningProps {
  email: string;
  message?: string;
  onClose?: () => void;
  onResendSuccess?: () => void;
}

const EmailVerificationWarning: React.FC<EmailVerificationWarningProps> = ({
  email,
  message = 'Account access is restricted until email verification is complete.',
  onClose,
  onResendSuccess
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const { resendVerification } = useAuth();
  const { canSend, timeRemaining, checkRateLimit, startCountdown } = useEmailRateLimit();

  // Check rate limit when component mounts
  useEffect(() => {
    if (email) {
      checkRateLimit(email, 'email_verification');
    }
  }, [email, checkRateLimit]);

  const handleResendVerification = async () => {
    if (!canSend) {
      setResendError(`Please wait ${timeRemaining} seconds before requesting another verification email.`);
      return;
    }

    try {
      setIsResending(true);
      setResendError('');
      setResendMessage('');

      const result = await resendVerification(email);
      
      if (result.success) {
        setResendMessage('A new verification email has been sent to your email address.');
        startCountdown(60);
        if (onResendSuccess) {
          onResendSuccess();
        }
      } else {
        setResendError(result.message);
        // If it's a rate limit error, check the current status
        if (result.message.includes('wait') && result.message.includes('seconds')) {
          await checkRateLimit(email, 'email_verification');
        }
      }
    } catch {
      setResendError('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles['verification-warning']}>
      <div className={styles['warning-header']}>
        <div className={styles['warning-icon']}>⚠️</div>
        <div className={styles['warning-content']}>
          <h4>Email Verification Required</h4>
          <p className={styles['warning-message']}>{message}</p>
        </div>
        {onClose && (
          <button
            className={styles['warning-close']}
            onClick={onClose}
            aria-label="Close warning"
          >
            ×
          </button>
        )}
      </div>

      <div className={styles['warning-details']}>
        <div className={styles['email-info']}>
          <span className={styles['email-label']}>Account email:</span>
          <span className={styles['email-display']}>{email}</span>
        </div>

        <div className={styles['warning-instructions']}>
          <p>
            <strong>What you need to do:</strong>
          </p>
          <ol>
            <li>Check your email inbox for a verification message</li>
            <li>Click the verification link in the email</li>
            <li>Return here and try logging in again</li>
          </ol>
        </div>

        {resendMessage && (
          <div className={`${styles['message']} ${styles['success']}`}>
            <div className={styles['message-icon']}>✅</div>
            <div className={styles['message-text']}>{resendMessage}</div>
          </div>
        )}

        {resendError && (
          <div className={`${styles['message']} ${styles['error']}`}>
            <div className={styles['message-icon']}>❌</div>
            <div className={styles['message-text']}>{resendError}</div>
          </div>
        )}

        <div className={styles['warning-actions']}>
          <button
            type="button"
            className={`${styles['auth-button']} ${styles['primary']}`}
            onClick={handleResendVerification}
            disabled={isResending || !canSend}
          >
            {isResending
              ? 'Resending...'
              : !canSend
                ? `Resend in ${timeRemaining}s`
                : 'Resend Verification Email'
            }
          </button>
        </div>

        <div className={styles['help-section']}>
          <p className={styles['help-text']}>
            <strong>Didn't receive the email?</strong> Check your spam folder or try resending the verification email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationWarning;