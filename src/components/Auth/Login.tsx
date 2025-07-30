import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import GoogleOAuth from './GoogleOAuth';
import ErrorMessage from './ErrorMessage';
import LoginTwoFactor from './LoginTwoFactor';
import './Auth.css';

interface LoginProps {
  onSwitchToRegister: () => void;
  onSwitchToPasswordReset: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onSwitchToPasswordReset }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [twoFactorData, setTwoFactorData] = useState<{ userId: number; email: string; } | null>(null);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.emailNotVerified) {
        navigate('/verify-email-pending', { 
          state: { 
            email: result.email || email,
            fromLogin: true
          } 
        });
        return;
      }
      
      if (result.requires2FA && result.userId) {
        setTwoFactorData({ userId: result.userId, email });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    }
  };

  if (twoFactorData) {
    return (
      <LoginTwoFactor
        userId={twoFactorData.userId}
        email={twoFactorData.email}
        onBack={() => setTwoFactorData(null)}
      />
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>Welcome Back</h2>
        <p>Sign in to access your account.</p>
      </div>

      <div className="auth-form">
        {error && <ErrorMessage message={error} onClose={() => setError('')} />}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
          <button 
            type="button" 
            className="link-button" 
            onClick={onSwitchToPasswordReset}
          >
            Forgot Password?
          </button>
        </div>

        <button 
          type="button" 
          className="auth-button" 
          disabled={isLoading}
          onClick={handleLogin}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </div>

      <GoogleOAuth onError={setError} />

      <div className="auth-switch">
        <p>
          Don't have an account?{' '}
          <button 
            type="button" 
            className="link-button" 
            onClick={onSwitchToRegister}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
