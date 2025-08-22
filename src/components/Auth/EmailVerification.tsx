import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from './AuthLayout';
import './Auth.css';

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
      <div className="auth-card">
        <div className="auth-header">
          <h2>Email Verification</h2>
        </div>

        <div className="verification-content">
          {verificationStatus === 'loading' && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Verifying your email...</p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="success-state">
              <h3>Email Verified!</h3>
              <p>{message}</p>
              <p>Redirecting to login...</p>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="error-state">
              <h3>Verification Failed</h3>
              <p className="error-message">{message}</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="auth-button"
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
