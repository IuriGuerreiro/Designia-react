import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import AuthLayout from './AuthLayout';
import styles from './Auth.module.css';

const EmailVerification: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { verifyEmail } = useAuth();

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setVerificationStatus('error');
        setMessage('No verification token provided');
        return;
      }

      const result = await verifyEmail(token);
      
      if (result.success) {
        setVerificationStatus('success');
        setMessage(result.message);
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        setVerificationStatus('error');
        setMessage(result.message);
      }
    };

    handleVerification();
  }, [token, verifyEmail]);

  return (
    <AuthLayout>
      <div className={styles['auth-card']}>
        <div className={styles['auth-header']}>
          <h2 className={styles['auth-title']}>Email verification</h2>
          <p className={styles['auth-meta']}>
            We&apos;re validating your invite and securing your workspace. Hang tight — this only takes a moment.
          </p>
        </div>

        <div className={styles['verification-content']}>
          {verificationStatus === 'loading' && (
            <div className={styles['loading-state']}>
              <div className={styles['spinner']}></div>
              <p>Verifying your email...</p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className={styles['success-state']}>
              <h3>Email verified!</h3>
              <div className={`${styles['verification-banner']} ${styles['success']}`}>{message}</div>
              <p>You&apos;ll be redirected to sign in so you can start designing.</p>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className={styles['error-state']}>
              <h3>Verification failed</h3>
              <p className={`${styles['message']} ${styles['error']}`}>{message}</p>
              <button
                onClick={() => window.location.href = '/'}
                className={`${styles['auth-button']} ${styles['primary']}`}
              >
                Go to Homepage
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default EmailVerification;
