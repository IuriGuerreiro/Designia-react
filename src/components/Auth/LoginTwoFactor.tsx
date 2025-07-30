import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ErrorMessage from './ErrorMessage';
import './Auth.css';

interface LoginTwoFactorProps {
  userId: number;
  email: string;
  onBack: () => void;
}

const LoginTwoFactor: React.FC<LoginTwoFactorProps> = ({ userId, email, onBack }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const { loginVerify2FA, resend2FACode, isLoading } = useAuth();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setError('');
    try {
      await loginVerify2FA(userId, code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      const result = await resend2FACode(userId, 'login');
      if (result.success) {
        setResendCooldown(60);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>Two-Factor Authentication</h2>
        <p>A verification code has been sent to {email}.</p>
      </div>

      <div className="auth-form">
        {error && <ErrorMessage message={error} onClose={() => setError('')} />}
        
        <div className="form-group">
          <label htmlFor="verificationCode">Verification Code</label>
          <input
            id="verificationCode"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            maxLength={6}
            className="code-input"
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
          />
        </div>

        <button 
          className="auth-button" 
          disabled={isLoading || code.length !== 6}
          onClick={handleVerify}
        >
          {isLoading ? 'Verifying...' : 'Verify & Login'}
        </button>

        <div className="auth-switch">
          <p>
            Didn't receive a code?{' '}
            <button 
              className="link-button" 
              onClick={handleResendCode}
              disabled={isResending || resendCooldown > 0}
            >
              {isResending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </p>
          <button onClick={onBack} className="link-button">Back to Login</button>
        </div>
      </div>
    </div>
  );
};

export default LoginTwoFactor;
