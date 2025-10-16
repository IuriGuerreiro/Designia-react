import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import ErrorMessage from './ErrorMessage';
import GoogleOAuth from './GoogleOAuth';
import styles from './Auth.module.css';

interface LoginProps {
  onSwitchToRegister: () => void;
  onSwitchToPasswordReset: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onSwitchToPasswordReset }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['auth-card']}>
      <div className={styles['auth-header']}>
        <h2 className={styles['auth-title']}>Welcome back to Designia</h2>
        <p className={styles['auth-subtitle']}>
          Pick up right where you left off, continue collaborating with your designer, and manage every order in one place.
        </p>
        <p className={styles['auth-meta']}>New to Designia? Switch to sign up in seconds.</p>
      </div>

      <div className={styles['auth-form']}>
        {error && <ErrorMessage message={error} onClose={() => setError('')} />}
        
        <div className={styles['form-group']}>
          <label htmlFor="email" className={styles['form-label']}>Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isLoading}
            className={`${styles['form-input']} ${styles['auth-input-email']}`}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="password" className={styles['form-label']}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            className={`${styles['form-input']} ${styles['auth-input-password']}`}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div className={styles['form-actions']}>
          <button
            type="button"
            className={styles['link-button']}
            onClick={onSwitchToPasswordReset}
          >
            Forgot your password?
          </button>
        </div>

        <button
          type="button"
          className={`${styles['auth-button']} ${styles['primary']}`}
          disabled={isLoading}
          onClick={handleLogin}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>

        <p className={styles['auth-meta']}>
          Tip: enable two-factor authentication once you’re in for faster designer approvals.
        </p>
      </div>

      <div className={styles['auth-divider']}>
        <span>or</span>
      </div>

      <GoogleOAuth onError={setError} />

      <p className={styles['auth-disclaimer']}>
        By continuing you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
      </p>

      <div className={styles['auth-switch']}>
        <p className={styles['switch-text']}>
          Don't have an account?{' '}
          <button
            type="button"
            className={styles['link-button']} 
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