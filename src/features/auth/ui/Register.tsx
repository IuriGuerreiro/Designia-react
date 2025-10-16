import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../state/AuthContext';
import ErrorMessage from './ErrorMessage';
import GoogleOAuth from './GoogleOAuth';
import styles from './Auth.module.css';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    // Prepare the data to send with correct field names for the API
    const registrationData = {
      username,
      email,
      password,
      password_confirm: confirmPassword,
      first_name: firstName,
      last_name: lastName
    };

    console.log('Sending registration data:', registrationData);

    try {
      const result = await register(registrationData);
      console.log('Registration result:', result);

      if (result.success) {
        // Registration successful - show success message
        setIsSuccess(true);
        setSuccessMessage(result.message || 'Account created successfully! Please check your email to verify your account.');
        
        // Clear form
        setFirstName('');
        setLastName('');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        // Registration failed - show error message from API
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles['auth-card']}>
        <div className={styles['auth-header']}>
          <h2 className={styles['auth-title']}>You&apos;re almost there!</h2>
          <p className={styles['auth-subtitle']}>
            We&apos;ve sent a confirmation email so you can activate your new workspace.
          </p>
        </div>

        <div className={styles['verification-pending-content']}>
          <div className={`${styles['message']} ${styles['success']}`}>
            {successMessage}
          </div>

          <div className={styles['verification-actions']}>
            <button
              onClick={onSwitchToLogin}
              className={`${styles['auth-button']} ${styles['primary']}`}
            >
              Continue to sign in
            </button>
          </div>
        </div>

        <p className={styles['auth-disclaimer']}>
          Didn&apos;t get the email? Check your spam folder or request another from the sign-in screen.
        </p>
      </div>
    );
  }

  return (
    <div className={styles['auth-card']}>
      <div className={styles['auth-header']}>
        <h2 className={styles['auth-title']}>{t('auth.register_title') || 'Create your Designia ID'}</h2>
        <p className={styles['auth-subtitle']}>
          {t('auth.register_subtitle') || 'Unlock personalized design workflows, real-time designer chat, and AR previews for every project.'}
        </p>
        <p className={styles['auth-meta']}>
          {t('auth.register_meta') || 'Use your best email so we can send collaboration invites and project updates.'}
        </p>
      </div>

      <form className={styles['auth-form']} onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} onClose={() => setError('')} />}
        
        <div className={styles['form-row']}>
          <div className={styles['form-group']}>
            <label htmlFor="firstName" className={styles['form-label']}>
              {t('auth.first_name_label') || 'First Name'}
            </label>
            <input 
              id="firstName" 
              type="text" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              placeholder={t('auth.first_name_placeholder') || 'Enter your first name'} 
              disabled={isLoading}
              className={`${styles['form-input']} ${styles['auth-input-firstname']}`}
            />
          </div>
          <div className={styles['form-group']}>
            <label htmlFor="lastName" className={styles['form-label']}>
              {t('auth.last_name_label') || 'Last Name'}
            </label>
            <input 
              id="lastName" 
              type="text" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              placeholder={t('auth.last_name_placeholder') || 'Enter your last name'} 
              disabled={isLoading}
              className={`${styles['form-input']} ${styles['auth-input-lastname']}`}
            />
          </div>
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="username" className={styles['form-label']}>
            {t('auth.username_label') || 'Username'}
          </label>
          <input 
            id="username" 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder={t('auth.username_placeholder') || 'Choose a unique username'} 
            disabled={isLoading}
            className={`${styles['form-input']} ${styles['auth-input-username']}`}
          />
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="email" className={styles['form-label']}>
            {t('auth.email_label') || 'Email Address'}
          </label>
          <input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder={t('auth.email_placeholder') || 'you@example.com'} 
            disabled={isLoading}
            className={`${styles['form-input']} ${styles['auth-input-email']}`}
          />
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="password" className={styles['form-label']}>
            {t('auth.password_label') || 'Password'}
          </label>
          <input 
            id="password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder={t('auth.password_placeholder') || 'Create a strong password'} 
            disabled={isLoading}
            className={`${styles['form-input']} ${styles['auth-input-password']}`}
          />
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="confirmPassword" className={styles['form-label']}>
            {t('auth.confirm_password_label') || 'Confirm Password'}
          </label>
          <input 
            id="confirmPassword" 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            placeholder={t('auth.confirm_password_placeholder') || 'Confirm your password'} 
            disabled={isLoading}
            className={`${styles['form-input']} ${styles['auth-input-confirm-password']}`}
          />
        </div>

        <button type="submit" className={`${styles['auth-button']} ${styles['primary']}`} disabled={isLoading}>
          {isLoading ? (t('auth.creating_account_button') || 'Creating Account...') : (t('auth.register_button') || 'Create Account')}
        </button>

        <p className={styles['auth-meta']}>
          {t('auth.password_hint') || 'Passwords must be at least 8 characters and include a number for designer security.'}
        </p>
      </form>

      <div className={styles['auth-divider']}>
        <span>or</span>
      </div>

      <GoogleOAuth onError={setError} />

      <p className={styles['auth-disclaimer']}>
        {t('auth.register_disclaimer') || 'By creating an account you agree to our Terms and Privacy Policy.'}
      </p>

      <div className={styles['auth-switch']}>
        <p className={styles['switch-text']}>
          {t('auth.to_login_link')?.split('Sign In')[0] || 'Already have an account? '}
          <button type="button" className={styles['link-button']} onClick={onSwitchToLogin}>
            {t('auth.to_login_link')?.split('? ')[1] || 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
