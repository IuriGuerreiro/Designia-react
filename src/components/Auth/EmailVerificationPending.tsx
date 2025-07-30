import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEmailRateLimit } from '../../hooks/useEmailRateLimit';
import AuthLayout from './AuthLayout';
import './Auth.css';

const EmailVerificationPending: React.FC = () => {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const { resendVerification } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { canSend, timeRemaining, checkRateLimit, startCountdown } = useEmailRateLimit();

  const email = location.state?.email || new URLSearchParams(location.search).get('email') || '';
  const fromLogin = location.state?.fromLogin || false;
  const customMessage = location.state?.message;

  useEffect(() => {
    if (email) {
      checkRateLimit(email, 'email_verification');
    }
  }, [email, checkRateLimit]);

  const handleResendEmail = async () => {
    if (!canSend) return;
    setIsResending(true);
    setResendMessage('');
    
    try {
      const result = await resendVerification(email);
      if (result.success) {
        setResendSuccess(true);
        setResendMessage('Verification email sent successfully!');
        startCountdown(60);
      } else {
        setResendSuccess(false);
        setResendMessage(result.message || 'Failed to send verification email.');
        if (result.message.includes('wait')) {
          await checkRateLimit(email, 'email_verification');
        }
      }
    } catch {
      setResendSuccess(false);
      setResendMessage('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="auth-header">
          <h2>Check Your Email</h2>
          <p>{fromLogin ? 'Verification is required to log in.' : 'Please verify your email to continue.'}</p>
        </div>

        <div className="verification-pending-content">
          <p>We've sent a verification link to <strong>{email}</strong>. Please click the link in the email to activate your account.</p>
          
          {resendMessage && (
            <div className={`message ${resendSuccess ? 'success' : 'error'}`}>
              {resendMessage}
            </div>
          )}

          <div className="verification-actions">
            <button
              onClick={handleResendEmail}
              disabled={isResending || !canSend}
              className="auth-button"
            >
              {isResending ? 'Sending...' : !canSend ? `Resend in ${timeRemaining}s` : 'Resend Verification Email'}
            </button>
            <button onClick={() => navigate('/login')} className="link-button">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default EmailVerificationPending;
